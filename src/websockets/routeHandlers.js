const createWebsocketRouteHandlers = (wss) => {
  const unfreezeObject = (obj) => JSON.parse(JSON.stringify(obj));

  const handlers = {
    handleHttpRequest(action, collection, data) {
      console.log('MADE IT HERE - createWebsocketRouteHandlers');
      const dataCopy = unfreezeObject(data);
      this.broadcast(Object.assign({}, { action, collection, response: dataCopy }));
    },
    sendMessage(client, message) {
      client.send(JSON.stringify(message));
    },
    broadcast(message) {
      // if collection is usersmeta, only send to ws with userId set to usersId
      // => we need to set a userId property to the correct wss.clients ws object

      if (message.collection === 'usersmeta') {
        wss.clients.forEach(client => {
          if (client.userId === message.response.userId) {
            client.sendMessage(message)
          }
        });

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
  };

  return handlers;
};

export default createWebsocketRouteHandlers;
