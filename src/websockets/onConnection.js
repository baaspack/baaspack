const onConnection = (wss, ws, userId) => {
  wss.connections[userId] = { connection: ws };

  console.log('USER ID IS', userId);

  const message = {
    action: 'connection',
    response: 'Websocket connection established',
  };

  wss.router.sendMessage(ws, message);
}

export default onConnection;
