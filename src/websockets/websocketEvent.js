class WebsocketEvent {
  constructor(wss, client, { channelName, collection, id }) {
    this.wss = wss;
    this.client = client;
    this.channelName = channelName;
    this.collection = collection;
    this.id = id;
  }

  sendMessage = (client, message) => {
    client.send(JSON.stringify(message));
  }

  broadcast = (message, from, excludeSelf = true) => {
    const data = {
      actions: 'send',
      from,
      message,
    };

    clients.forEach(client => {
      if (excludeSelf) {
        if (client === self) return;
      }

      sendMessage(client, data);
    });
  }
}

export default WebsocketEvent;