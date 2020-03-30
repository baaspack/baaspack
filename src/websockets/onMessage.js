const onMessage = (wss, client, message, models) => {
  const find = async () => {
    const { action, collection, query } = message;
    const model = models[collection];
    const response = await model.find(query);

    wss.router.sendMessage(client, {
      action,
      response: response,
    });
  }

  const getOne = async () => {
    const { action, collection, id } = message;
    const model = models[collection];
    const response = await model.get(id);

    wss.router.sendMessage(client, {
      action,
      collection: collection,
      response: response,
    });
  }

  // works with sdk
  const getAll = async () => {
    const { action, collection } = message;
    const model = models[collection];
    const response = await model.find();

    wss.router.sendMessage(client, {
      action,
      collection,
      response: response,
    });
  }

  // works with sdk
  const create = async () => {
    const { action, collection, data } = message;
    const model = models[collection];
    const response = await model.create(data);

    wss.router.broadcast({
      action,
      collection,
      response: response,
    });
  }

  // works with sdk
  const update = async () => {
    const { action, collection, id, data } = message;
    const model = models[collection];
    const response = await model.update(id, data)

    wss.router.broadcast({
      action,
      collection,
      response: response,
    });
  }

  const patch = async () => {
    const { action, collection, id, data } = message;
    const model = models[collection];
    const response = await model.patch(id, data)

    wss.router.broadcast({
      action,
      collection,
      response: response,
    });
  }

  // works with sdk
  const deleted = async () => {
    const { collection, id } = message;
    const model = models[collection];
    const response = await model.delete(id);

    wss.router.broadcast({
      action,
      collection,
      response: response,
    });
  }

  const open = () => {
    const { action } = message;
    setUserId();

    wss.router.sendMessage(client, {
      action,
      response: "User's id has been associated with this connection."
    })
  }

  const close = () => {
    const { action } = message;

    wss.router.broadcast({
      action,
      userId: client.userId,
    });
  }

  const setUserId = () => {
    if (message.userId) {
      client.userId = message.userId;
    }
  }

  const { action } = message;

  console.log('MESSAGE FROM ONMESSAGE', message);

  switch (action) {
    case 'find':
      find();
      break;
    case 'getOne':
      getOne();
      break;
    case 'getAll':
      getAll();
      break;
    case 'create':
      create();
      break;
    case 'update':
      update();
      break;
    case 'patch':
      patch();
      break;
    case 'delete':
      deleted();
      break;
    case 'broadcast':
      wss.broadcast();
      break;
    case 'connection':
      connection();
      break;
    case 'open':
      open();
      break;
    case 'close':
      close();
      break;
    default:
      wss.router.sendMessage(client, {
        action: 'error',
        message: 'Error: valid action not provided.'
      });
  }
}

export default onMessage;