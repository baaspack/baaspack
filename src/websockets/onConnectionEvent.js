import WebsocketEvent from './websocketEvent';
import { v4 as uuidv4 } from 'uuid';

class OnConnectionEvent extends WebsocketEvent {
  constructor(wss, client, request, channelName) {
    super(wss, client, { channelName, collection: null, id: null });
    this.request = request; // i don't need this
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
    this.id = uuidv4();

    this.client.uuid = this.id;
  }

  addClientToChannel = () => {
    this.wss.channels[this.channelName].clients.push(this.client);
  }

  response = () => {
    const message = {
      actions: ['onConnection'],
      data: {
        id: this.id,
        channelName: this.channelName,
      }
    }

    this.sendMessage(this.client, message);
  }
}

export default OnConnectionEvent;
