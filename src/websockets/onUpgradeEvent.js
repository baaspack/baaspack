import url from 'url';
import { collectionExists, documentExists } from '../db/mongoose';

const getParams = (url) => {
  const queryIndex = url.indexOf('?');
  return url.slice(queryIndex);
}

const idNotGiven = (str) => {
  return str === '';
}

const onUpgradeEvent = async (request, socket, head, wss) => {
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
      const channelName = collection;

      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request, channelName);
      });
    } else {
      if (await documentExists(collection, id)) {
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
}

export default onUpgradeEvent;