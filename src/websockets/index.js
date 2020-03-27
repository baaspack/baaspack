import WebSocket from 'ws';
import OnConnection from './OnConnection';
import OnMessage from './OnMessage';
import OnClose from './OnClose';

const startWebsocketServer = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (client) => {
    new OnConnection(wss, client);

    client.on('message', (data) => {
      new OnMessage(wss, client, JSON.parse(data));
    });

    client.on('close', (data) => {
      new OnClose(wss, client, JSON.parse(data));
    });
  });
}

export default startWebsocketServer;
