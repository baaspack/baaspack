import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import models, { connectDb } from './models';
import routes from './routes';

const app = express();

const messages = new routes.CollectionRouter('Message');
const messageModel = models.collectionModel('Message');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log(messageModel);

app.use(async (req, res, next) => {
  req.context = {
    models: { User: models.User, Message: messageModel },
    me: await models.User.findByLogin('Rotschy'),
  };

  next();
});

app.use('/users', routes.user);
app.use(`/${messages.resource}`, messages.router);

const eraseDatabaseOnSync = false;

connectDb().then(async () => {
  if (eraseDatabaseOnSync) {
    await Promise.all([
      models.User.deleteMany({}),
      messageModel.deleteMany({}),
    ]);

    createUsersWithMessages();
  }

  app.listen(process.env.PORT, () => console.log(`Example app listening on port ${process.env.PORT}!`));
});

const createUsersWithMessages = async () => {
  const user1 = new models.User({
    username: 'Rotschy',
  });

  const user2 = new models.User({
    username: 'Moskovich',
  });

  const message1 = new messageModel({
    text: 'Published the Road to lear React',
    user: user1.id,
  });

  const message2 = new messageModel({
    text: 'Hello neighbor!',
    user: user2.id,
  });

  const message3 = new messageModel({
    text: 'Top of the morning to you, sir!',
    user: user2.id,
  });

  await message1.save();
  await message2.save();
  await message3.save();

  await user1.save();
  await user2.save();
};
