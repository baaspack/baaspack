const onClose = (wss, client, data) => { // do I need data?
  // Remove user from connections array
  // Remove user from connections array in channels array
  // Update the following in the UserMeta/UserInformation table:
  //   online: boolean
  //   timeclose: ws on close time

  const message = {
    action: 'close',
    userId: client.userId,
  };

  wss.router.broadcast(client, message);
}

export default onClose;