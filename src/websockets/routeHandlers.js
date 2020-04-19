const createWebsocketRouteHandlers = (wss) => {
  const unfreezeObject = (obj) => JSON.parse(JSON.stringify(obj));

  const isUsermeta = (collection) => {
    return collection === 'usersmeta';
  }

  const handlers = {
    handleHttpRequest(action, collection, data) {
      // const dataCopy = unfreezeObject(data);
      // const message = Object.assign({}, { action, collection, response: dataCopy });

      // console.log('got here - handleHttpRequest');
      // console.log('action', action);
      // console.log('collection', collection);
      // console.log('data', data);

      // if (isUsermeta(collection)) {
      //   console.log('got here - isUsermeta(collection)');
      //   this.sendToOwner(message);
      // } else {
      //   this.broadcast(message);
      // }
    },
    sendToOwner(message) {
      console.log('got here - sendToOwner(message)');
      console.log('message', message);
      console.log('message.response.userId', message.response.userId);
      console.log(' wss', wss);
      console.log(' wss.clients', wss.clients);

      // if (wss.clients.length > 0) {
      //   wss.clients.forEach((client) => {
      //     console.log('got here - client.userId', client.userId);
      //     if (client.userId === message.response.userId) {
      //       console.log('got here - client.userId === message.response.userId');
      //       this.sendMessage(client, message);
      //     }
      //   })
      // }
      wss.clients.forEach((client) => {
        console.log('got here - client.userId', client.userId);
        if (client.userId === message.response.userId) {
          console.log('got here - client.userId === message.response.userId');
          this.sendMessage(client, message);
        }
      })
    },
    sendMessageToUser(userId, message) {
      wss.clients.forEach((client) => {
        if (client.userId === userId) {
          this.sendMessage(client, message);
        }
      })
    },
    broadcastButNotToOwner(message) {
      console.log('got here - broadcastButNotToOwner');





    },
    broadcast(message) {
      console.log('got here - broadcast');

      if (isUsermeta(message.collection)) {
        this.sendToOwner(message);
        return;
      }

      console.log('MESSAGE FROM BROADCAST', message);

      let channelType;
      let channelId;

      // messages for http responses will have a response object
      // regular messages will not
      if (message.response && message.response.channelType && message.response.channelId) {
        channelType = message.response.channelType;
        channelId = message.response.channelId;
      } else if (message.channelType && message.channelId) {
        channelType = message.channelType;
        channelId = message.channelId;
      } else {
        channelType = null;
        channelId = null;
      }

      const channelName = `${channelType}_${channelId}`;


      if (channelType && channelId && wss.channels[channelName]) {
        wss.channels[channelName].forEach(connection => {
          this.sendMessage(connection, message);
        });
      } else {
        wss.clients.forEach((client) => this.sendMessage(client, message));
      }
    },
    sendMessage(client, message) {
      client.send(JSON.stringify(message));
    },
  };

  return handlers;
};

export default createWebsocketRouteHandlers;
