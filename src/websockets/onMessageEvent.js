import WebsocketEvent from './websocketEvent';

class OnMessageEvent extends WebsocketEvent {
  constructor(wss, client, { channelName, collection, id }) {
    super(wss, client, channelName, collection, id);
    this.actions = actions;
    this.actionsRouter();
  }

  actionsRouter = () => {
    this.actions.forEach((action) => {
      switch (action) {
        case 'send':
          break;
        case 'get':
          break;
        case 'update':
          break;
        case 'deleteData':
          break;
        case 'onOpen':
          break;
        case 'onClose':
          break;
        case 'typing':
          break;
        case 'transfer':
          break;
        default:
      }
    });
  }

  send = (data) => {

  }

  get = (data) => {

  }

  update = (data) => {

  }

  deleteData = (data) => {

  }

  onOpen = (data) => {

  }

  onClose = (data) => {

  }

  typing = (data) => {

  }

  transfer = (data) => {

  }
}

export default OnMessageEvent;