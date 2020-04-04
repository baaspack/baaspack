import WebSocket from 'ws';
import createWebsocketRouteHandlers from './routeHandlers';
import onConnection from './onConnection';
import onMessage from './onMessage';
import onClose from './onClose';

const startWebsocketServer = (server, sessionParser, models) => {
  const wss = new WebSocket.Server({ clientTracking: false, noServer: true });
  wss.router = createWebsocketRouteHandlers(wss);

  server.on('upgrade', (req, socket, head) => {
    console.log('Parsing session from request...');

    sessionParser(req, {}, () => {
      if (!req.session.passport || !req.session.passport.user) {
        socket.destroy();
        return;
      }

      console.log('Parsed the sesh!');

      wss.handleUpgrade(req, socket, head, (ws) => {
        console.log('Got to handle upgrade!');

        ws.emit('connection', ws, req);
      });
    });
  });

  wss.on('connection', (client, req) => {
    console.log('Got to connection!');
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
}

export default startWebsocketServer;

// const startWebsocketServer = (server, sessionParser, models) => {
//   // original
//   // const wss = new WebSocket.Server({ server });

//   // ws example docs
//   // const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

//   // so example
//   const wss = new WebSocket.Server({
//     server,
//     verifyClient: (info, done) => {
//       // console.log('INFO FROM VERIFY CLIENT', info);
//       sessionParser(info.req, {}, () => {
//         done(info.req.session)
//       })
//     }
//   });

//   wss.router = createWebsocketRouteHandlers(wss);


//   // function noop() { }

//   // function heartbeat() {
//   //   this.isAlive = true;
//   // }

//   server.on('upgrade', function (request, socket, head) {
//     // console.log('WE GOT HERE!');
//     console.log('request.session:', request.session);

//     if (!request.session.passport.userId) {
//       console.log('Destroying websocket connection!')
//       socket.destroy();
//       return;
//     }

//     console.log('Session is parsed!');

//     wss.handleUpgrade(request, socket, head, function (ws) {
//       wss.emit('connection', ws, request);
//     });

//     // console.log('Parsing session from request...');

//     // console.log('sessionParse from websocket file', sessionParser);

//     // sessionParser(request, {}, () => {
//     //   console.log('REQUEST OBJECT FROM SESSION PARSER IN SERVER.ON UPGRADE', request);
//     //   if (!request.session.userId) {
//     //     console.log('Destroying websocket connection!')
//     //     socket.destroy();
//     //     return;
//     //   }

//     //   console.log('Session is parsed!');

//     //   wss.handleUpgrade(request, socket, head, function (ws) {
//     //     wss.emit('connection', ws, request);
//     //   });
//     // });
//   });

//   wss.on('connection', (client) => {
//     // client.isAlive = true;
//     // client.on('pong', heartbeat);
//     onConnection(wss, client);

//     client.on('message', (data) => {
//       onMessage(wss, client, JSON.parse(data), models);
//     });

//     client.on('close', (data) => {
//       onClose(wss, client, JSON.parse(data));
//     });
//   });

//   // const interval = setInterval(function ping() {
//   //   wss.clients.forEach(function each(client) {
//   //     if (client.isAlive === false) return client.terminate();

//   //     client.isAlive = false;
//   //     client.ping(noop);
//   //   });
//   // }, 30000);

//   // wss.on('close', () => {
//   //   clearInterval(interval);
//   // });

//   return wss;
// }

// export default startWebsocketServer;
