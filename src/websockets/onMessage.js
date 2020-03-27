import Websocket from './websocket';
import { createDocument } from '../db/mongoose';

class OnMessage extends Websocket {
  constructor(wss, client, data) {
    super(wss, client, data);
    this.data = data;
    this.actionRouter();
  }

  actionRouter = () => {
    const name = this.action.data;

    switch (name) {
      case 'find':
        this.find();
        break;
      case 'get':
        this.get();
        break;
      case 'post':
        this.post();
        break;
      case 'put':
        this.put();
        break;
      case 'patch':
        this.patch();
        break;
      case 'delete':
        this.delete();
        break;
      case 'broadcast':
        this.broadcast();
        break;
      case 'connection':
        this.connection();
        break;
      case 'open':
        this.open();
        break;
      case 'close':
        this.close();
        break;
      default:
        this.sendMessage(this.client, {
          action: error,
          message: 'Error: action not provided.'
        });
    }
  }

  find = () => {

  }

  get = () => {
    // handle request
    // send it back to client
  }

  post = () => {
    // handle request
    // broadcast it to all
  }

  put = () => {
    // handle request
    // broadcast it to all
  }

  patch = () => {
    // handle request
    // broadcast it to all
  }

  delete = () => {
    // handle request
    // broadcast it to all
  }

  broadcast = () => {
    this.broadcast(this.data);
  }

  open = () => {
    // format message?
    // broadcast it to all
  }

  close = () => {
    // format message?
    // broadcast it to all
  }

  saveMessage = async (data, type) => {
    const collection = 'messages'; // what collection should message to? saving it to messages for now

    const record = {
      userId: this.userId,
      [`${this.collectionName.toLowerCase()}Id`]: this.documentId,
      data,
      type,
    };

    console.log(await createDocument(collection, record));
  }
}

export default OnMessage;