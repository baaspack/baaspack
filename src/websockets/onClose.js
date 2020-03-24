import Websocket from './websocket';

class OnClose extends Websocket {
  constructor(wss, client, data) {
    super(wss, client, data);
  }
}

export default OnClose;