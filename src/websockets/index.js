import WebSocket from 'ws';
import onUpgradeEvent from './onUpgradeEvent';
import OnConnectionEvent from './OnConnectionEvent';
import OnMessageEvent from './OnMessageEvent';
import OnCloseEvent from './OnCloseEvent';

export const startWss = (server) => {
  const wss = new WebSocket.Server({ noServer: true });
  wss.channels = {};

  server.on('upgrade', function upgrade(request, socket, head) {
    onUpgradeEvent(request, socket, head, wss);
  });

  wss.on('connection', (client, request, channelName) => {
    new OnConnectionEvent(wss, client, request, channelName);

    client.on('message', (data) => {
      new OnMessageEvent(wss, client, JSON.parse(data));
    });

    client.on('close', (data) => {
      new OnCloseEvent(wss, client, JSON.parse(data));
    });
  });
}
