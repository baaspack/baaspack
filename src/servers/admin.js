/* eslint-disable no-case-declarations */
import http from 'http';
import WebSocket from 'ws';

import { hashedPasswordIfValid } from '../routes/authentication';

const methodMap = {
  get: 'find',
  find: 'get',
  post: 'create',
  put: 'update',
  patch: 'patch',
  delete: 'delete',
};

const createAction = (type, { model, data }) => (
  JSON.stringify({
    type,
    payload: {
      model,
      data,
    },
  })
);

const createCollectionManagerRoutes = (models, router, generateModel, addRoutesFromModel, apiWss) => async ({ action, model, data }) => {
  const actionToTake = methodMap[action];

  if (actionToTake === 'create') {
    const modelToMake = data.model;

    if (modelToMake === 'users' || models.find(({ name }) => name === modelToMake)) {
      const res = { action, message: 'This collection already exists' };
      return createAction('WS_FAILURE', { model, data: res });
    }

    const newModel = await generateModel(modelToMake);
    models.push(newModel);
    addRoutesFromModel(router, newModel, apiWss);

    return createAction('COLLECTION_ADD_COLLECTION_SUCCESS', { model, data: { name: modelToMake } });
  }
};

const createCollectionRoutes = (models) => async ({ action, model, data }) => {
  const actionToTake = methodMap[action];

  // eslint-disable-next-line no-underscore-dangle
  const id = data && (data._id || data.id);
  const modelToUse = models.find(({ name }) => name === model);

  let res = null;
  let socketMsgType = 'WS_FAILURE'; // default to failure message

  try {
    if (actionToTake === 'create' || actionToTake === 'find') {
      res = await modelToUse[actionToTake](data);
    } else {
      res = await modelToUse[actionToTake](id, data);
    }

    socketMsgType = `COLLECTION_${action.toUpperCase()}_SUCCESS`;
  } catch (e) {
    res = { action, message: e.message };
  }

  return createAction(socketMsgType, { model, data: res });
};

const createUserRoutes = (UserModel) => async ({ action, model, data }) => {
  const actionToTake = methodMap[action] || action;

  // eslint-disable-next-line no-underscore-dangle
  const id = data && (data._id || data.id);
  const { email, password } = data || {};

  let res = null;
  let socketMsgType = 'WS_FAILURE';
  const fieldsToReturn = ['_id', 'email', 'createdAt'];

  try {
    switch (actionToTake) {
      case 'create':
        const hashedPass = await hashedPasswordIfValid(UserModel, email, password);

        const user = await UserModel.create({
          email,
          password: hashedPass,
        });

        res = { user };
        break;
      case 'find':
        res = await UserModel.find(null, { selectProps: fieldsToReturn });
        break;
      case 'delete':
        await UserModel.delete(id);
        res = { id };
        break;
      default:
        break;
    }

    socketMsgType = `USER_${action.toUpperCase()}_SUCCESS`;
  } catch (e) {
    res = { action, message: e.message };
  }

  return createAction(socketMsgType, { model, data: res });
};

const getCollectionNames = (models) => {
  const modelNames = models.map(({ name }) => name);

  return createAction('COLLECTION_GET_ALL', { data: modelNames });
};

const configureWs = (socket, collectionManagerRoutes, userRoutes, collectionRoutes) => {
  socket.on('message', async (msg) => {
    const requestMessage = JSON.parse(msg);

    let res;

    switch (requestMessage.model) {
      case 'collections':
        res = await collectionManagerRoutes(requestMessage);
        break;
      case 'users':
        res = await userRoutes(requestMessage);
        break;
      default:
        console.log('collections route');
        res = await collectionRoutes(requestMessage);
        break;
    }

    socket.send(res);
  });
};

export const createWsServer = (models, UserModel, router, generateModel, addRoutesFromModel, apiWss) => {
  const httpServer = http.createServer();
  const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

  const collectionManagerRoutes = createCollectionManagerRoutes(
    models,
    router,
    generateModel,
    addRoutesFromModel,
    apiWss,
  );
  const userRoutes = createUserRoutes(UserModel);
  const collectionRoutes = createCollectionRoutes(models);

  httpServer.on('upgrade', (req, socket, head) => {
    // authenticate the request somehow?
    // maybe look for the admin site's origin?

    wss.handleUpgrade(req, socket, head, (ws) => {
      console.log('made it to baas');
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', (ws, _req) => {
    ws.on('close', () => {
      console.log(`see ya from baas`);
    });

    configureWs(ws, collectionManagerRoutes, userRoutes, collectionRoutes);
    ws.send(getCollectionNames(models));
  });

  httpServer.listen(4000);
};

export default createWsServer;
