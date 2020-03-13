const seedDatabase = async (resources) => {
  await resources.user.deleteMany({});
  await resources.message.deleteMany({});

  const user1 = await resources.user.create({ username: 'Rotschy' });
  const user2 = await resources.user.create({ username: 'Moskovich' });

  console.log(user1);

  await resources.message.create({
    text: 'The first message is the hardest',
    user: user1.id,
  });

  await resources.message.create({
    text: 'The second message is also tough',
    user: user1.id,
  });

  await resources.message.create({
    text: 'The third brings surprises',
    user: user2.id,
  });
};


export default seedDatabase;
