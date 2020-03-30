const onConnection = (wss, client) => {
  const message = {
    action: 'connection',
    response: 'Websocket connection established',
  };

  wss.router.sendMessage(client, message);
}

export default onConnection;
