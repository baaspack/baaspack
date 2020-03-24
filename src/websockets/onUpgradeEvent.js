import url from 'url';
import { collectionExists, documentExists } from '../db/mongoose';

const getParams = (url) => {
  const queryIndex = url.indexOf('?');
  return url.slice(queryIndex);
}

const collectionIdNotGiven = (str) => {
  return str === '';
}

const onUpgradeEvent = async (request, socket, head, wss) => {
  const params = new URLSearchParams(getParams(request.url));

  let collectionName;
  let collectionId;

  for (const [name, value] of params) {
    switch (name) {
      case 'collectionName':
        collectionName = value;
        break;
      case 'collectionId':
        collectionId = value;
    }
  }

  if (await collectionExists(collectionName)) {
    if (collectionIdNotGiven(collectionId)) {
      const channelName = collectionName;

      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request, channelName, collectionName, collectionId);
      });
    } else {
      if (await documentExists(collectionName, collectionId)) {
        const channelName = `${collectionName}_${collectionId}`;

        wss.handleUpgrade(request, socket, head, function done(ws) {
          wss.emit('connection', ws, request, channelName, collectionName, collectionId);
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