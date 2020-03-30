const onClose = (wss, client, data) => { // do I need data?
  const message = {
    action: 'close',
    userId: client.userId,
  };

  wss.router.broadcast(client, message);
}

export default onClose;