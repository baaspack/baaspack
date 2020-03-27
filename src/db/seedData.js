const seedData = async (models) => {
  const MessageModel = models.find((model) => model.name === 'Message');

  await MessageModel.deleteAll();

  // const user1 = await models.User.create({ username: 'Rotschy' });
  // const user2 = await models.User.create({ username: 'Moskovich' });

  await MessageModel.create({
    // user: user1.id,
    text: 'The first message is the hardest',
  });

  await MessageModel.create({
    // user: user1.id,
    text: 'The second message is also tough',
  });

  await MessageModel.create({
    // user: user2.id,
    text: 'The third brings surprises',
  });
};


export default seedData;
