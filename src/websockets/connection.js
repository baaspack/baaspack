class Connection {
  constructor(wss, client, data) {
    this.wss = wss;
    this.client = client;
    this.channelName = data.channelName;
    this.collection = data.collection;
    this.id = data.id;
    this.actions = data.actions;
    this.actionsRouter();
  }

  actionsRouter = () => {
    this.actions.forEach((action) => {
      switch (action) {
        case 'send':
          break;
        case 'get':
          break;
        case 'update':
          break;
        case 'delete':
          break;
        case 'onOpen':
          break;
        case 'onClose':
          break;
        case 'typing':
          break;
        case 'transfer':
          break;
        default:
      }
    }
  }

  send = (data) => {

  }

  get = (data) => {

  }

  update = (data) => {

  }

  delete = (data) => {

  }

  onOpen = (data) => {

  }

  onClose = (data) => {

  }

  typing = (data) => {

  }

  transfer = (data) => {

  }

  getParams = (url) => {
    const queryIndex = url.indexOf('?');
    return url.slice(queryIndex);
  }

  idNotGiven = (str) => {
    return str === '';
  }

  sendMessage = (client, message) => {
    client.send(JSON.stringify(message));
  }

  broadcastExclusive = (clients, self, message, from) => {
    const data = {
      actions: 'messageBroadcast',
      from,
      message,
    };

    clients.forEach(client => {
      if (client === self) return;

      sendMessage(client, data);
    });
  }

  broadcastInclusive = (clients, message, from) => {
    const data = {
      actions: 'messageBroadcast',
      from,
      message,
    };

    clients.forEach(client => {
      sendMessage(client, data);
    });
  }
}

export default Connection;