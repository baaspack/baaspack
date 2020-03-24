import WebsocketEvent from './websocketEvent';

class OnCloseEvent extends WebsocketEvent {
  constructor(wss, client, data) {
    super(wss, client, data);
  }
}

export default OnCloseEvent;