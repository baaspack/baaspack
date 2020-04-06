const createWebsocketRouteHandlers = (wss) => {
  const unfreezeObject = (obj) => JSON.parse(JSON.stringify(obj));

  const handlers = {
    handleHttpRequest(action, collection, data) {
      const dataCopy = unfreezeObject(data);
      this.broadcast(Object.assign({}, { action, collection, response: dataCopy }));
    },
    sendMessage(client, message) {
      client.send(JSON.stringify(message));
    },
    broadcast(message) {
      if (message.channelId) {
        wss.channels[channelId].connections.forEach(connection => {
          this.sendMessage(connection, message);
        });
      } else {
        Object.keys(wss.connections).forEach(client => {
          this.sendMessage(client.connection, message)
        });
      }

      // wss.connections.forEach(client => {
      //   this.sendMessage(client, message);
      // });
    },
  };

  return handlers;
};

export default createWebsocketRouteHandlers;
