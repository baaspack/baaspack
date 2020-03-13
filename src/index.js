import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { MongoClient } from 'mongodb';

import createResources from './resources';

const dbClient = new MongoClient(
  process.env.SERVER_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const seedData = false;

const main = async () => {
  try {
    await dbClient.connect();

    const resources = await createResources(dbClient.db(process.env.DATABASE_NAME), seedData);

    app.use(async (req, res, next) => {
      req.context = {
        me: await resources.user.find({ username: 'Rotschy' }),
      };

      next();
    });

    Object.keys(resources).forEach((resource) => {
      app.use(`/${resource}s`, resources[resource].router);
    });

    app.listen(process.env.PORT, () => {
      console.log(`Example app listening on port ${process.env.PORT}!`);
    });
  } catch (e) {
    console.error(e);
  }
};

main();
