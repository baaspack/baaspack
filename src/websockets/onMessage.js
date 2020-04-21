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

        wss.router.sendMessage(ws, responseMessage);
      });
  }

  const createChannel = async () => {
    const { action, usersInformationCollection, channelType, name } = message;

    // create new channel
    const channelModel = getModel(channelType);
    const data = { channelType, name, userId: userId };
    const createChannelResponse = await channelModel.create(data);
    const channelId = unfreezeObject(createChannelResponse._id);
    console.log('channelId', channelId);
    console.log('createChannelResponse', createChannelResponse);

    // get usersmeta
    const usersmetaModel = getModel(usersInformationCollection);
    const usersmeta = unfreezeObject(await usersmetaModel.find({ userId: userId }))[0];

    // update user's currentChannel and channels
    const usersCurrentChannel = { channelType, channelId };
    console.log('usersCurrentChannel', usersCurrentChannel);
    const usersChannels = usersmeta.channels.concat(usersCurrentChannel);
    const _updateUsermetaResponse = await usersmetaModel.patch(usersmeta._id, { channels: usersChannels, currentChannel: usersCurrentChannel });

    const responseMessage = {
      action,
      response: createChannelResponse,
    }

    console.log('usersChannels', usersChannels);
    console.log('usersCurrentChannel', usersCurrentChannel);

    // send message to all other ws connections
    wss.router.broadcastButNotToOwner(ws, responseMessage);

    // add user's ws to channels array in channel object
    const channelsChannelName = `${channelType}_${channelId}`;

    if (!wss.channels[channelsChannelName]) {
      wss.channels[channelsChannelName] = [];
    }

    wss.channels[channelsChannelName].push(ws);

    // send message to creator ws connection
    wss.router.sendMessage(ws, Object.assign({}, responseMessage, { usersChannels, usersCurrentChannel }));
  }

  const joinChannel = async () => {
    const { action, usersInformationCollection, channelType, channelId } = message;
    const model = getModel(usersInformationCollection);

    const usersmeta = unfreezeObject(await model.find({ userId: userId }))[0];
    const channel = { channelType, channelId };
    const usersChannels = usersmeta.channels.concat(channel);

    const response = await model.patch(usersmeta._id, { channels: usersChannels, currentChannel: channel });
    const channelName = `${channelType}_${channelId}`;

    if (!wss.channels[channelName]) {
      wss.channels[channelName] = [];
    }

    wss.channels[channelName].push(ws);

    const responseMessage = {
      action,
      userId,
      channelType,
      channelId,
    }

    wss.router.broadcast(responseMessage); // don't sent to ws
    wss.router.sendMessage(ws, Object.assign(responseMessage, { response }));
  }

  const leaveChannel = async () => {
    const { action, usersInformationCollection, channelType, channelId } = message;

    // get usersmeta
    const model = getModel(usersInformationCollection);
    const usersmeta = unfreezeObject(await model.find({ userId: userId }))[0];

    // remove the channel that the user is leaving from usersmeta channels
    const usersChannels = usersmeta.channels.filter((channel) => channel.channelId !== channelId);
    const _response = await model.patch(usersmeta._id, { channels: usersChannels });

    // get updated list of usersmeta channels and filter channels by channelType
    const updatedUsersmeta = unfreezeObject(await model.find({ userId: userId }))[0];
    const usersChannelsOfChannelType = updatedUsersmeta.channels.filter((channel) => channel.channelType == channelType);

    // update user's currentChannel
    let updateCurrentChannel;

    if (usersChannelsOfChannelType.length > 0) {
      const firstChannel = usersChannelsOfChannelType[0];
      updateCurrentChannel = { channelType: firstChannel.channelType, channelId: firstChannel.channelId };
    } else {
      updateCurrentChannel = { channelType: null, channelId: null };
    }

    const response = await model.patch(usersmeta._id, { currentChannel: updateCurrentChannel });

    // broadcast response
    const responseMessage = {
      action,
      userId,
      channelType,
      channelId,
    }

    wss.router.broadcast(responseMessage); // don't sent to ws
    wss.router.sendMessage(ws, Object.assign(responseMessage, { response }));

    // remove ws from wss.channels array
    const channelName = `${channelType}_${channelId}`;

    if (wss.channels[channelName]) {
      wss.channels[channelName] = wss.channels[channelName].filter((connection) => connection !== ws);
    }
  }

  const deleteChannel = async () => {
    const { action, usersInformationCollection, channelMessagesCollection, channelType, channelId } = message;

    // delete all channel messages
    const channelMessagesModel = getModel(channelMessagesCollection);
    const messages = await channelMessagesModel.find();

    messages.forEach(async (message) => {
      const messageCopy = unfreezeObject(message);

      if (messageCopy.channelType === channelType && messageCopy.channelId === channelId) {
        let deleteMessageResponse = await channelMessagesModel.delete(messageCopy._id);
      }
    });

    // delete channel
    const channelModel = getModel(message.channelType);
    const deleteChannelResponse = await channelModel.delete(channelId);

    // get usermeta
    const model = getModel(usersInformationCollection);
    const usersmeta = unfreezeObject(await model.find());

    // iterate through all ws clients. if the channel that's being deleted is in the user's channels usermeta,
    // delete it, and reset their currentChannel property if necessary
    // broadcast the response back to each client individually
    usersmeta.forEach(async (usermeta) => {
      for (let i = 0; i < usermeta.channels.length; i += 1) {
        if (usermeta.channels[i].channelType === channelType && usermeta.channels[i].channelId === channelId) {

          // remove the channel that the user is deleting from usermeta channels
          const usersChannels = usermeta.channels.filter((channel) => channel.channelId !== channelId);
          const usersChannelsOfChannelType = usersChannels.filter((channel) => channel.channelType == channelType);

          // update user's currentChannel
          let usersCurrentChannel = usermeta.currentChannel;

          if (usersCurrentChannel.channelType === channelType && usersCurrentChannel.channelId === channelId) {
            if (usersChannelsOfChannelType.length > 0) {
              const firstChannel = usersChannelsOfChannelType[0];
              usersCurrentChannel = { channelType: firstChannel.channelType, channelId: firstChannel.channelId };
            } else {
              usersCurrentChannel = { channelType: null, channelId: null };
            }
          }

          const response = await model.patch(usermeta._id, { channels: usersChannels, currentChannel: usersCurrentChannel });

          // broadcast response
          const responseMessage = {
            action,
            userId,
            channelType,
            channelId,
            response,
          }

          // remove ws from wss.channels array
          const channelName = `${channelType}_${channelId}`;

          if (wss.channels[channelName]) {
            wss.channels[channelName] = wss.channels[channelName].filter((connection) => connection.userId !== usersmeta.userId);
          }

          wss.router.sendMessageToUser(usermeta.userId, responseMessage);
          break;
        }
      }
    });

    // remove ws from wss.channels array
    const channelName = `${channelType}_${channelId}`;
    delete wss.channels[channelName];
  }

  // done
  const changeChannel = async () => {
    const { action, usersInformationCollection, channelType, channelId } = message;
    const model = getModel(usersInformationCollection);

    const usersmeta = unfreezeObject(await model.find({ userId: userId }))[0];
    const channel = { channelType, channelId };
    const response = await model.patch(usersmeta._id, { currentChannel: channel });

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

  const unfreezeObject = (obj) => JSON.parse(JSON.stringify(obj));

  const { action } = message;

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
    case 'createChannel':
      createChannel();
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
    case 'deleteChannel':
      deleteChannel();
      break;
    default:
      wss.router.sendMessage(client, {
        action: 'error',
        message: 'Error: valid action not provided.'
      });
  }
}

export default onMessage;