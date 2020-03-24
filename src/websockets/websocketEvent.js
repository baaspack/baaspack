class WebsocketEvent {
  constructor(wss, client, { channelName, collectionName, collectionId, userId }) {
    this.wss = wss;
    this.client = client;
    this.channelName = channelName;
    this.collectionName = collectionName;
    this.collectionId = collectionId;
    this.userId = userId;
  }

  sendMessage = (client, message) => {
    client.send(JSON.stringify(message));
  }

  broadcast = (broadcast, message) => { // broadcast param is set to 'includeSelf' or 'excludeSelf'. change that.
    this.wss.channels[this.channelName].clients.forEach(client => {
      if (broadcast === 'excludeSelf') {
        if (client === self) return;
      }

      this.sendMessage(client, message);
    });
  }
}

export default WebsocketEvent;