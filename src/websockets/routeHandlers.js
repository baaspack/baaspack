const createWebsocketRouteHandlers = (wss) => {
  return {
    handleGetAll: (data) => {
      data.action = 'getOne'
      const client = this.findClient(data.userId);
      this.sendMessage(client, data);
    },
    handleGetOne: (data) => {
      data.action = 'getAll';
      const client = this.findClient(data.first.userId)
      this.sendMessage(client, data);
    },
    handlePost: (data) => {
      data.action = 'post';
      this.broadcast(data);
    },
    handlePatch: (data) => {
      data.action = 'patch';
      this.broadcast(data);
    },
    handlePut: (data) => {
      data.action = 'put';
      this.broadcast(data);
    },
    handleDelete: (data) => {
      data.action = 'delete';
      this.broadcast(data);
    },
    sendMessage: (client, message) => {
      client.send(JSON.stringify(message));
    },
    broadcast: (message) => {
      wss.clients.forEach(client => {
        this.sendMessage(client, message);
      });
    },
    findClient: (userId) => {
      return wss.clients.find((client) => client.userId === userId);
    }
  };
};

export default createWebsocketRouteHandlers;