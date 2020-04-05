import WebSocket from 'ws';
import createWebsocketRouteHandlers from './routeHandlers';
import onConnection from './onConnection';
import onMessage from './onMessage';
import onClose from './onClose';

const startWebsocketServer = (server, sessionParser, models) => {
  const wss = new WebSocket.Server({ noServer: true });
  wss.router = createWebsocketRouteHandlers(wss);

  function noop() { }

  function heartbeat() {
    this.isAlive = true;
  }

  server.on('upgrade', (req, socket, head) => {

    sessionParser(req, {}, () => {
      if (!req.session.passport || !req.session.passport.user) {
        socket.destroy();
        return;
      }

      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    });
  });

  wss.on('connection', (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    onConnection(wss, ws);

    ws.on('message', (data) => {
      onMessage(wss, ws, JSON.parse(data), models);
    });

    ws.on('close', (data) => {
      onClose(wss, ws, JSON.parse(data));
    });
  });

  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping(noop);
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return wss;
}

export default startWebsocketServer;
