const onMessage = (wss, ws, userId, message, models) => {
  const find = async () => {
    const { action, collection, query } = message;
    const model = getModel(collection);
    const response = await model.find(query);

    wss.router.sendMessage(ws, {
      action,
      response: response,
    });
  }

  const getOne = async () => {
    const { action, collection, id } = message;
    const model = getModel(collection);
    const response = await model.get(id);

    wss.router.sendMessage(ws, {
      action,
      collection: collection,
      response: response,
    });
  }

  const getAll = async () => {
    const { action, collection } = message;
    const model = getModel(collection);
    const response = await model.find();

    wss.router.sendMessage(ws, {
      action,
      collection,
      response: response,
    });
  }

  const create = async () => {
    const { action, collection, data } = message;
    const model = getModel(collection);
    const response = await model.create(data);

    let message = {
      action,
      collection,
      response: response,
    };

    if (data.channel) {
      message.channelId = data.channelId;
    }

    wss.router.broadcast(message);
  }

  const update = async () => {
    const { action, collection, id, data } = message;
    const model = getModel(collection);
    const response = await model.update(id, data)

    let message = {
      action,
      collection,
      response: response,
    };

    if (data.channel) {
      message.channelId = data.channelId;
    }

    wss.router.broadcast(message);
  }

  const patch = async () => {
    const { action, collection, id, data } = message;
    const model = getModel(collection);
    const response = await model.patch(id, data)

    let message = {
      action,
      collection,
      response: response,
    };

    if (data.channel) {
      message.channelId = data.channelId;
    }

    wss.router.broadcast(message);
  }

  const deleted = async () => {
    const { collection, id } = message;
    const model = getModel(collection);
    const response = await model.delete(id);

    let message = {
      action,
      collection,
      response: response,
    };

    if (data.channel) {
      message.channelId = data.channelId;
    }

    wss.router.broadcast(message);
  }

  const open = () => { // redo this
    const { action } = message;

    wss.router.sendMessage(ws, {
      action,
      response: "User's id has been associated with this connection."
    })
  }

  const close = () => { // redo this
    const { action } = message;

    wss.router.broadcast({
      action,
      userId,
    });

    delete wss.connections[userId];
  }

  const joinUsersChannels = async () => {
    // message props needed:
    // action
    // usersId(given in function params)
    // usersInformationCollection

    // Get user’s channels from usersInformationCollection
    const { action, usersInformationCollection } = message;
    const model = getModel(usersInformationCollection);
    const usersChannels = await model.find({ userId: userId }).channels;

    // Add user to connections array in channels array
    usersChannels.forEach(channelId => {
      if (!wss.channels[channelId]) {
        wss.channels[channelId] = { connections: {} };
      }

      wss.channels[channelId].connections[userId] = { connection: ws };
    });

    // Send message back to client with array of channels user belongs to
    const message = {
      action,
      usersChannels,
    }

    wss.router.sendMessage(ws, message);
  }

  const joinChannel = async () => {
    // message props needed:
    // action
    // usersId(given in function params)
    // usersInformationCollection
    // channelId of channel to join

    // Get user’s channels from usersInformationCollection
    const { action, usersInformationCollection, channelId } = message;
    const model = getModel(usersInformationCollection);
    let usersChannels = await model.find({ userId: userId }).channels;
    userChannels = [...usersChannels, channelId];

    // Update channels array field on UsersMeta - add channel to array
    const response = await model.patch(id, { channels: userChannels });

    // Add user to connections array in channels array
    if (!wss.channels[channelId]) {
      wss.channels[channelId] = { connections: {} };
    }

    wss.channels[channelId].connections[userId] = { connection: ws };

    const message = {
      action,
      channelId,
    }

    wss.router.sendMessage(ws, message);
  }

  const leaveChannel = async () => {
    // message props needed:
    // action
    // usersId(given in function params)
    // usersInformationCollection
    // channelId of channel to leave

    // Get user’s channels from usersInformationCollection
    const { action, usersInformationCollection, channelId } = message;
    const model = getModel(usersInformationCollection);
    let usersChannels = await model.find({ userId: userId }).channels;
    usersChannels = usersChannels.filter(channel => channel.id !== channelId);

    // Update channels array field on UsersMeta - delete channel from array
    const response = await model.patch(id, { channels: userChannels });

    // delete user from connections array in channels array
    delete wss.channels[channelId].connections[userId];

    const message = {
      action,
      channelId,
    }

    wss.router.sendMessage(ws, message);
  }

  const getModel = (collection) => {
    return models.find((model) => model.name === collection);
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
    case 'joinUsersChannels':
      joinUsersChannels();
      break;
    case 'joinChannel':
      joinChannel();
      break;
    case 'leaveChannel':
      leaveChannel();
      break;
    default:
      wss.router.sendMessage(client, {
        action: 'error',
        message: 'Error: valid action not provided.'
      });
  }
}

export default onMessage;