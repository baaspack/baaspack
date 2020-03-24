import url from 'url';
import { collectionExists, documentExists } from '../db/mongoose';

const getParams = (url) => {
  const queryIndex = url.indexOf('?');
  return url.slice(queryIndex);
}

const documentIdNotGiven = (str) => {
  return str === '';
}

const onUpgradeEvent = async (request, socket, head, wss) => {
  const params = new URLSearchParams(getParams(request.url));

  let collectionName;
  let documentId;

  for (const [name, value] of params) {
    switch (name) {
      case 'collectionName':
        collectionName = value;
        break;
      case 'documentId':
        documentId = value;
    }
  }

  if (await collectionExists(collectionName)) {
    if (documentIdNotGiven(documentId)) {
      const channelName = collectionName;

      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request, channelName, collectionName, documentId);
      });
    } else {
      if (await documentExists(collectionName, documentId)) {
        const channelName = `${collectionName}_${documentId}`;

        wss.handleUpgrade(request, socket, head, function done(ws) {
          wss.emit('connection', ws, request, channelName, collectionName, documentId);
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