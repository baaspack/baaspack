import WebSocket from 'ws';
import createWebsocketRouteHandlers from './routeHandlers';
import onConnection from './onConnection';
import onMessage from './onMessage';
import onClose from './onClose';

const startWebsocketServer = (server, models) => {
  const wss = new WebSocket.Server({ server });
  wss.router = createWebsocketRouteHandlers(wss);

  // function noop() { }

  // function heartbeat() {
  //   this.isAlive = true;
  // }

  wss.on('connection', (client) => {
    // client.isAlive = true;
    // client.on('pong', heartbeat);
    onConnection(wss, client);

    client.on('message', (data) => {
      onMessage(wss, client, JSON.parse(data), models);
    });

    client.on('close', (data) => {
      onClose(wss, client, JSON.parse(data));
    });
  });

  // const interval = setInterval(function ping() {
  //   wss.clients.forEach(function each(client) {
  //     if (client.isAlive === false) return client.terminate();

  //     client.isAlive = false;
  //     client.ping(noop);
  //   });
  // }, 30000);

  // wss.on('close', () => {
  //   clearInterval(interval);
  // });

  return wss;
}

export default startWebsocketServer;
