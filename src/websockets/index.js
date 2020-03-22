import WebSocket from 'ws';
import url from 'url';
import { v4 as uuidv4 } from 'uuid';
// import helpers from '../helpers';
import { collectionExists, documentExists } from '../db/mongoose';

const getParams = (url) => {
  const queryIndex = url.indexOf('?');
  return url.slice(queryIndex);
}

const idNotGiven = (str) => {
  return str === '';
}

const sendMessage = (client, message) => {
  client.send(JSON.stringify(message));
}

const broadcastExclusive = (clients, self, message, from) => {
  const data = {
    actions: 'messageBroadcast',
    from,
    message,
  };

  clients.forEach(client => {
    if (client === self) return;

    sendMessage(client, data);
  });
}

const broadcastInclusive = (clients, message, from) => {
  const data = {
    actions: 'messageBroadcast',
    from,
    message,
  };

  clients.forEach(client => {
    sendMessage(client, data);
  });
}

export const startWss = (server) => {
  const wss = new WebSocket.Server({ noServer: true });
  wss.channels = {};

  server.on('upgrade', async function upgrade(request, socket, head) {
    const params = new URLSearchParams(getParams(request.url));

    let collection;
    let id;

    for (const [name, value] of params) {
      switch (name) {
        case 'collection':
          collection = value;
          break;
        case 'id':
          id = value;
      }
    }

    if (await collectionExists(collection)) {
      if (idNotGiven(id)) {
        console.log('handle web socket for collection');

        const channelName = collection;

        wss.handleUpgrade(request, socket, head, function done(ws) {
          wss.emit('connection', ws, request, channelName);
        });
      } else {
        if (await documentExists(collection, id)) {
          console.log('handle web socket for document of collection')

          const channelName = `${collection}_${id}`;

          wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request, channelName);
          });
        } else {
          console.log('document does not exist');
          socket.destroy();
        }
      }
    } else {
      console.log('collection does not exist');
      socket.destroy();
    }
  });

  wss.on('connection', (client, request, channelName) => {
    if (!wss.channels[channelName]) {
      wss.channels[channelName] = { clients: [] };
    }

    const id = uuidv4();

    client.uuid = id;

    wss.channels[channelName].clients.push(client);

    const message = {
      action: 'welcome',
      id,
      channelName,
    }

    sendMessage(client, message);

    client.on('message', (data) => {
      const {
        channelName,
        collection,
        id,
        actions,
        message,
      } = JSON.parse(data);

      actions.forEach((action) => {
        switch (action) {
          case 'onopen':
            sendMessage(client, {
              actions: 'response',
              message: 'hello',
            });
          case 'save':
            // save message to db;
            break;
          case 'broadcastInclusive':
            broadcastInclusive(wss.channels[channelName].clients, client, message, client.userName);
            break;
          case 'broadcastExclusive':
            broadcastExclusive(wss.channels[channelName].clients, message, client.userName);
            break;
          default:
            sendMessage(client, {
              actions: 'error',
              message: 'Error: invalid action',
            });
        }
      });
    });
  });
}
