import WebsocketEvent from './websocketEvent';
import { v4 as uuidv4 } from 'uuid';

class OnConnectionEvent extends WebsocketEvent {
  constructor(wss, client, request, data) {
    super(wss, client, data);
    this.request = request; // i don't need the request object here
    this.createChannelName();
    this.createClientId();
    this.addClientToChannel();
    this.response();
  }

  createChannelName = () => {
    if (!this.wss.channels[this.channelName]) {
      this.wss.channels[this.channelName] = { clients: [] };
    }
  }

  createClientId = () => {
    this.userId = uuidv4();
    this.client.userId = this.id;
  }

  addClientToChannel = () => {
    this.wss.channels[this.channelName].clients.push(this.client);
  }

  response = () => {
    const message = [{
      name: 'onConnection',
      envelope: {
        userId: this.userId,
        channelName: this.channelName,
      },
    }];

    this.sendMessage(this.client, message);
  }
}

export default OnConnectionEvent;
