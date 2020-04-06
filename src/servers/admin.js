import http from 'http';
import WebSocket from 'ws';

export const createWsServer = () => {
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

  wss.on('connection', (ws, req) => {
    // const userId = req.session.passport.user;

    ws.on('message', (msg) => {
      ws.send(`looks like you said: ${msg}`);
    });

    ws.on('close', () => {
      console.log(`see ya from baas`);
    });
  });

  httpServer.listen(4000);
};

export default createWsServer;
