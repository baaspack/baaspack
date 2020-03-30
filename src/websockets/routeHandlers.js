const createWebsocketRouteHandlers = (wss) => {
  const unfreezeObject = (obj) => JSON.parse(JSON.stringify(obj));

  const handlers = {
    handlePost(collection, data) {
      const dataCopy = unfreezeObject(data);
      this.broadcast(Object.assign({}, { action: 'create', collection, response: dataCopy }));
    },
    handlePut(collection, data) {
      const dataCopy = unfreezeObject(data);
      this.broadcast(Object.assign({}, { action: 'update', collection, response: dataCopy }));
    },
    handlePatch(collection, data) {
      const dataCopy = unfreezeObject(data);
      this.broadcast(Object.assign({}, { action: 'patch', collection, response: dataCopy }));
    },
    handleDelete(collection, data) {
      const dataCopy = unfreezeObject(data);
      this.broadcast(Object.assign({}, { action: 'delete', collection, response: dataCopy }));
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