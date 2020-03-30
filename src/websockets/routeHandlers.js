const createWebsocketRouteHandlers = (wss) => {
  const handlers = {
    handlePost(collection, data) {
      data.action = 'post';
      data.collection = collection;
      this.broadcast(data);
    },
    handlePut(collection, data) {
      data.action = 'put';
      data.collection = collection;
      this.broadcast(data);
    },
    handlePatch(collection, data) {
      data.action = 'patch';
      data.collection = collection;
      this.broadcast(data);
    },
    handleDelete(collection, data) {
      data.action = 'delete';
      data.collection = collection;
      this.broadcast(data);
    },
    sendMessage(client, message) {
      client.send(JSON.stringify(message));
    },
    broadcast(message) {
      wss.clients.forEach(client => {
        this.sendMessage(client, message);
      });
    },
  };

  return handlers;
};

export default createWebsocketRouteHandlers;