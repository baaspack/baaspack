const createWebsocketRouteHandlers = (wss) => {
  const handlers = {
    handlePost(data) {
      data.action = 'post';
      this.broadcast(data);
    },
    handlePatch(data) {
      data.action = 'patch';
      this.broadcast(data);
    },
    handlePut(data) {
      data.action = 'put';
      this.broadcast(data);
    },
    handleDelete(data) {
      data.action = 'delete';
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