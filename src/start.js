import dotenv from 'dotenv';
import { Router } from 'express';

import {
  connectToDb,
  generateModel,
  generateModels,
  seedDatabase,
  getCollectionNames,
  User,
} from './db/mongoose';

import createAuthRoutes from './routes/auth';

import addRoutesFromModel from './routes';
import createCollectionEndpoints from './routes/collectionManager';
import createExpressApp from './app';

// Import variables from .env to make them available on `process.env`
dotenv.config();

// Set a flag for whether to reseed the database
const repopulateSeedData = false;

// Set DB connection options
const serverUrl = process.env.SERVER_URL.replace(/\/$/, ''); // remove closing "/" if it exists

const dbConnectionOptions = {
  serverUrl,
  dbName: process.env.DATABASE_NAME,
};

// Start the App!
const start = async () => {
  // Connect to the db
  await connectToDb(dbConnectionOptions);

  // Populate existing models
  const models = repopulateSeedData ? await seedDatabase() : await generateModels();

  // Generate HTTP endpoints for routes
  const router = Router();

  Object.keys(models).forEach((modelName) => {
    const model = models[modelName];
    addRoutesFromModel(router, model);
  });

  // Generate endpoints for authentication
  const authRoutes = createAuthRoutes(User);

  // Generate endpoints for collections
  createCollectionEndpoints(router, getCollectionNames, generateModel, addRoutesFromModel);

  const app = createExpressApp(router, authRoutes);

  // Start the web server
  const webServerPort = process.env.PORT || 3000;

  const server = app.listen(webServerPort, () => {
    console.log(`App is listening for connections on port ${server.address().port}.`);
  });
};

start();
