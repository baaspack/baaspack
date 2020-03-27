import Websocket from './websocket';

class OnConnection extends Websocket {
  constructor(wss, client) {
    super(wss, client);
    this.response();
  }

  response = () => {
    const message = {
      action: 'connection',
      message: 'Websocket connection established',
    };

    this.wss.router.sendMessage(this.client, message);
  }
}

export default OnConnection;
