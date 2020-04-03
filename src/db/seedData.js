const seedData = async (models) => {
  const MessageModel = models.find((model) => model.name === 'messages');

  await MessageModel.deleteAll();

  await MessageModel.create({
    text: 'The first message is the hardest',
  });

  await MessageModel.create({
    text: 'The second message is also tough',
  });

  await MessageModel.create({
    text: 'The third brings surprises',
  });
};


export default seedData;
