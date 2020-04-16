const onMessage = (wss, ws, userId, message, models) => {
  const find = async () => {
    const { action, collection, query } = message;
    const model = getModel(collection);
    const response = await model.find(query);

    wss.router.sendMessage(ws, { action, response });
  }

  const getOne = async () => {
    const { action, collection, id } = message;
    const model = getModel(collection);
    const response = await model.get(id);

    wss.router.sendMessage(ws, { action, collection, response });
  }

  const getAll = async () => {
    const { action, collection } = message;
    const model = getModel(collection);
    const response = await model.find();

    wss.router.sendMessage(ws, { action, collection, response });
  }

  const create = async () => {
    const { action, collection, data } = message;
    const model = getModel(collection);
    const response = await model.create(data);

    wss.router.broadcast({ action, collection, response });
  }

  const update = async () => {
    const { action, collection, id, data } = message;
    const model = getModel(collection);
    const response = await model.update(id, data);

    wss.router.broadcast({ action, collection, response });
  }

  const patch = async () => {
    const { action, collection, id, data } = message;
    const model = getModel(collection);
    const response = await model.patch(id, data);

    wss.router.broadcast({ action, collection, response });
  }

  const deleted = async () => {
    const { collection, id } = message;
    const model = getModel(collection);
    const response = await model.delete(id);

    wss.router.broadcast({ action, collection, response });
  }

  const open = () => {
    const { action } = message;

    wss.router.broadcast({
      action,
      userId,
    });
  }

  const close = () => {
    const { action } = message;

    wss.router.broadcast({
      action,
      userId,
    });
  }

  const joinUsersChannels = () => {
    const { action, usersInformationCollection } = message;
    const model = getModel(usersInformationCollection);

    model.find({ userId: userId })
      .then((usersmeta) => {
        return usersmeta[0].toObject().channels;
      })
      .then((channels) => {
        channels.forEach(channel => {
          const channelName = `${channel.channelType}_${channel.channelId}`;

          if (!wss.channels[channelName]) {
            wss.channels[channelName] = [];
          }

          wss.channels[channelName].push(ws);
        });

        const responseMessage = {
          action,
          usersChannels: channels,
        }

        console.log('WSS CHANNELS', wss.channels);

        wss.router.sendMessage(ws, responseMessage);
      });
  }

  const joinChannel = async () => {
    const { action, usersInformationCollection, channelType, channelId, channelName, creatorId } = message;
    const model = getModel(usersInformationCollection);

    const usersmeta = await model.find({ userId: userId });
    const usersChannels = [...usersmeta.channels, { channelType, channelId, channelName, creatorId }];

    const response = await model.patch(usersmeta._id, { channels: usersChannels });
    const channelsChannelName = `${channelType}_${channelId}`;

    if (!wss.channels[channelsChannelName]) {
      wss.channels[channelsChannelName] = [];
    }

    wss.channels[channelsChannelName].push(ws);

    const responseMessage = {
      action,
      userId,
      channelType,
      channelId,
      response,
    }

    wss.router.broadcast(responseMessage);
  }

  const leaveChannel = async () => {
    const { action, usersInformationCollection, channelType, channelId } = message;
    const model = getModel(usersInformationCollection);

    const usersmeta = await model.find({ userId: userId });
    const usersChannels = usersmeta.channels.filter(channel => channel.id !== channelId);

    const response = await model.patch(usersmeta._id, { channels: usersChannels });
    const channelName = `${channelType}_${channelId}`;

    wss.channels[channelName] = wss.channels[channelName].filter((connection) => connection !== ws);

    const responseMessage = {
      action,
      userId,
      channelType,
      channelId,
      response,
    }

    wss.router.broadcast(responseMessage);
  }

  const changeChannel = async () => {
    const { action, usersInformationCollection, channelType, channelId, channelName, creatorId } = message;
    const model = getModel(usersInformationCollection);

    const usersmeta = await model.find({ userId: userId });
    const response = await model.patch(usersmeta._id, { currentChannel: { channelType, channelId, channelName, creatorId } });

    const responseMessage = {
      action,
      userId,
      channelType,
      channelId,
      response,
    }

    wss.router.sendMessage(ws, responseMessage);
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
    case 'changeChannel':
      changeChannel();
      break;
    default:
      wss.router.sendMessage(client, {
        action: 'error',
        message: 'Error: valid action not provided.'
      });
  }
}

export default onMessage;