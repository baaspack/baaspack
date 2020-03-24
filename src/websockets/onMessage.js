import Websocket from './websocket';
import { createDocument } from '../db/mongoose';

class OnMessage extends Websocket {
  constructor(wss, client, data) {
    super(wss, client, data);
    this.actionRouter(data.action);
  }

  actionRouter = (action) => {
    const { name, envelope } = action;

    switch (name) {
      case 'send':
        this.send(envelope)
        break;
      case 'get':
        this.get(envelope);
        break;
      case 'update':
        this.update(envelope);
        break;
      case 'deleteData':
        this.delete(envelope);
        break;
      case 'onOpen':
        this.onOpen(envelope);
        break;
      case 'onClose':
        this.onClose(envelope);
        break;
      case 'typing':
        this.typing(envlope);
        break;
      case 'transfer':
        this.transfer(envelop);
        break;
      default:
    }
  }

  send = (envelope) => {
    const { save, data, type, broadcast } = envelope;

    if (save) {
      this.saveMessage(data, type);
    }

    console.log('USER ID', this.userId)

    const message = {
      name: 'message',
      envelope: {
        from: this.userId,
        data,
        type,
      },
    };

    this.broadcast(broadcast, message);
  }

  get = (envelope) => {

  }

  update = (envelope) => {

  }

  delete = (envelope) => {

  }

  onOpen = (envelope) => {

  }

  onClose = (envelope) => {

  }

  typing = (envelope) => {

  }

  transfer = (envelope) => {

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