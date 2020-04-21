const seedData = async (models) => {
  const MessageModel = models.find((model) => model.name === 'messages');

  await MessageModel.deleteAll();

  await MessageModel.create({
    text: {
      nested: 'The first message is the hardest',
      gross: {
        this: 'looks pretty bad',
      },
    },
    msgs: ['haha', 'yup', 'arrays too'],
  });

  await MessageModel.create({
    text: 'The second message is also tough',
  });

  await MessageModel.create({
    text: 'The third brings surprises',
  });
};


export default seedData;
