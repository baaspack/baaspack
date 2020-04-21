const onClose = (wss, ws, userId, data) => { // do I need data?
  // Remove user from connections array
  // Remove user from connections array in channels array

  const message = {
    action: 'close',
    userId: ws.userId,
  };

  wss.router.broadcast(ws, message);
}

export default onClose;