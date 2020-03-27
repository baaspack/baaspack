import Websocket from './websocket';

class OnMessage extends Websocket {
  constructor(wss, client, data, models) {
    super(wss, client);
    this.models = models;
    this.data = data;
    this.actionRouter();
  }

  actionRouter = () => {
    const name = this.data.action;

    switch (name) {
      case 'find':
        this.find();
        break;
      case 'getOne':
        this.getOne();
        break;
      case 'getAll':
        this.getAll();
        break;
      case 'create':
        this.create();
        break;
      case 'update':
        this.update();
        break;
      case 'patch':
        this.patch();
        break;
      case 'delete':
        this.delete();
        break;
      case 'broadcast':
        this.wss.broadcast();
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
        this.wss.router.sendMessage(this.client, {
          action: 'error',
          message: 'Error: valid action not provided.'
        });
    }
  }

  find = () => { }

  getOne = async () => {
    const { collection, id } = this.data;
    const model = this.models[collection];
    const response = await model.get(id);

    this.wss.router.sendMessage(this.client, {
      action: 'getOne',
      message: response,
    });
  }

  getAll = async () => {
    const { collection } = this.data;
    const model = this.models[collection];
    const response = await model.find();

    this.wss.router.sendMessage(this.client, {
      action: 'getAll',
      message: response,
    });
  }

  create = async () => {
    const { collection, data } = this.data;
    const model = this.models[collection];
    const response = await model.create(data);

    this.wss.router.sendMessage(this.client, {
      action: 'create',
      message: response,
    });
  }

  update = async () => {
    const { collection, id, data } = this.data;
    const model = this.models[collection];
    const response = await model.update(id, data)

    this.wss.router.sendMessage(this.client, {
      action: 'update',
      message: response,
    });
  }

  patch = async () => {
    const { collection, id, data } = this.data;
    const model = this.models[collection];
    const response = await model.patch(id, data)

    this.wss.router.sendMessage(this.client, {
      action: 'patch',
      message: response,
    });
  }

  delete = async () => {
    const { collection, id } = this.data;
    const model = this.models[collection];
    const response = await model.delete(id);

    this.wss.router.sendMessage(this.client, {
      action: 'delete',
      message: response,
    });
  }

  broadcast = () => {
    this.wss.broadcast(this.data);
  }

  open = () => {
    this.setUserId();

    this.wss.router.sendMessage(this.client, {
      action: 'open',
      message: "User's id has been associated with this connection."
    })

    this.wss.router.broadcast({
      action: 'broadcast',
      message: 'User joined',
      userId: this.client.userId,
    });
  }

  close = () => {

  }

  setUserId = () => {
    if (this.data.userId) {
      this.client.userId = this.data.userId;
    }
  }
}

export default OnMessage;