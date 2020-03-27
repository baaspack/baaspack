import WebSocket from 'ws';
import createWebsocketRouteHandlers from './routeHandlers';
import OnConnection from './OnConnection';
import OnMessage from './OnMessage';
import OnClose from './OnClose';

const startWebsocketServer = (server, models) => {
  const wss = new WebSocket.Server({ server });
  wss.router = createWebsocketRouteHandlers(wss);

  wss.on('connection', (client) => {
    new OnConnection(wss, client);

    client.on('message', (data) => {
      new OnMessage(wss, client, JSON.parse(data), models);
    });

    client.on('close', (data) => {
      new OnClose(wss, client, JSON.parse(data));
    });
  });

  return wss;
}

export default startWebsocketServer;
