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

const configureWs = (socket, models, UserModel) => {
  socket.on('message', async (msg) => {
    const { action, model, id, body } = JSON.parse(msg);

    const modelToUse = models.find(({ name }) => name === model);
    const actionToTake = methodMap[action];

    let res = null;

    if (actionToTake === 'create' || actionToTake === 'find') {
      res = await modelToUse[actionToTake](body);
    } else {
      res = await modelToUse[actionToTake](id, body);
    }

    const socketResponse = createAction(
      `COLLECTION_${action.toUpperCase()}`,
      {
        model,
        data: res,
      },
    );

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

export const createWsServer = (models, UserModel) => {
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

    configureWs(ws, models, UserModel);
  });

  httpServer.listen(4000);
};

export default createWsServer;
