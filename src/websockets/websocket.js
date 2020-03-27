class Websocket {
  constructor(wss, client) {
    this.wss = wss;
    this.client = client;
    this.userId = null;
  }

  // sendMessage = (client, message) => {
  //   client.send(JSON.stringify(message));
  // }

  // broadcast = (message) => {
  //   this.wss.clients.forEach(client => {
  //     this.sendMessage(client, message);
  //   });
  // }
}

export default Websocket;