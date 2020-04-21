const onConnection = (wss, ws, userId) => {
  const message = {
    action: 'connection',
    response: 'Websocket connection established',
  };

  wss.router.sendMessage(ws, message);
}

export default onConnection;
