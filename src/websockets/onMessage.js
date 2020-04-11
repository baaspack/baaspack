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

  // implement open properly
  const open = () => {
    const { action } = message;

    wss.router.broadcast({
      action,
      userId,
    });
  }

  // implement close properly
  const close = () => {
    const { action } = message;

    wss.router.broadcast({
      action,
      userId,
    });
  }

  const joinUsersChannels = async () => {
    const { action, usersInformationCollection } = message;
    const model = getModel(usersInformationCollection);

    await model.find({ userId: userId })
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

        wss.router.sendMessage(ws, responseMessage);
      });
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

    const responseMessage = {
      action,
      channelId,
      response,
    }

    wss.router.sendMessage(ws, responseMessage);
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

    const responseMessage = {
      action,
      channelId,
      response,
    }

    wss.router.sendMessage(ws, responseMessage);
  }

  const changeChannel = async () => {
    // message props needed:
    // action
    // usersId(given in function params)
    // usersInformationCollection
    // channelType of channel to change to
    // channelId of channel to change to

    const { action, usersInformationCollection, channelType, channelId } = message;
    const model = getModel(usersInformationCollection);
    const response = await model.patch(id, { currentChannel: { name: channelType, id: channelId } });

    const responseMessage = {
      action,
      channelType,
      channelId,
      response
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