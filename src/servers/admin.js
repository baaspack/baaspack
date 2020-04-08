import http from 'http';
import WebSocket from 'ws';

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


// TODO: refactor this function, it's gnarly
const configureWs = (socket, models, UserModel, router, generateModel, addRoutesFromModel) => {
  socket.on('message', async (msg) => {
    const { action, model, data } = JSON.parse(msg);
    const actionToTake = methodMap[action];

    if (actionToTake === 'create' && model === 'collection') {
      const modelToMake = data.model;

      if (modelToMake === 'users' || models.find(({ name }) => name === modelToMake)) {
        const res = { action, message: 'This collection already exists' };
        const socketEarlyResponse = createAction('WS_FAILURE', { model, data: res });
        socket.send(socketEarlyResponse);
        return;
      }

      const newModel = await generateModel(modelToMake);
      models.push(newModel);
      addRoutesFromModel(router, newModel);

      const socketEarlyResponse = createAction('COLLECTION_ADD_COLLECTION_SUCCESS', { model, data: { name: modelToMake } });
      socket.send(socketEarlyResponse);
      return;
    }

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

    const socketResponse = createAction(socketMsgType, { model, data: res });

    socket.send(socketResponse);
  });

  const getCollectionNames = () => {
    const modelNames = models.map(({ name }) => name);

    const socketResponse = createAction(
      'COLLECTION_GET_ALL',
      {
        data: modelNames,
      },
    );

    socket.send(socketResponse);
  };

  getCollectionNames();
};

export const createWsServer = (models, UserModel, router, generateModel, addRoutesFromModel) => {
  const httpServer = http.createServer();
  const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

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

    configureWs(ws, models, UserModel, router, generateModel, addRoutesFromModel);
  });

  httpServer.listen(4000);
};

export default createWsServer;
