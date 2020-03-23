import WebsocketEvent from './websocketEvent';

class OnCloseEvent extends WebsocketEvent {
  constructor(wss, client, { channelName, collection, id }) {
    super(wss, client, channelName, collection, id);
  }
}

export default OnCloseEvent;