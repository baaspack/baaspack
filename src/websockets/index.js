import WebSocket from 'ws';
import onUpgrade from './onUpgrade';
import OnConnection from './OnConnection';
import OnMessage from './OnMessage';
import OnClose from './OnClose';

export const startWss = (server) => {
  const wss = new WebSocket.Server({ noServer: true });
  wss.channels = {};

  server.on('upgrade', function upgrade(request, socket, head) {
    onUpgrade(request, socket, head, wss);
  });

  wss.on('connection', (client, request, channelName, collectionName, documentId) => { // i don't need the request object here
    const data = { channelName, collectionName, documentId, userId: null };
    new OnConnection(wss, client, request, data); // i don't need the request object here

    client.on('message', (data) => {
      console.log(`ON MESSAGE DATA, ${JSON.parse(data)}`);
      new OnMessage(wss, client, JSON.parse(data));
    });

    client.on('close', (data) => {
      new OnClose(wss, client, JSON.parse(data));
    });
  });
}
