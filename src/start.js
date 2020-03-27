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

import initializePassport from './handlers/authorization';
import createAuthRoutes from './routes/authentication';

import addRoutesFromModel from './routes';
import createCollectionEndpoints from './routes/collectionManager';
import createExpressApp from './app';

// Import variables from .env to make them available on `process.env`
dotenv.config();

// Set a flag for whether to reseed the database
const repopulateSeedData = process.env.SEED_DB;

// Set DB connection options
const dbConnectionOptions = {
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbHostname: process.env.DB_HOSTNAME,
  dbPort: process.env.DB_PORT,
  dbName: process.env.DB_DBNAME,
};

// Start the App!
const start = async () => {
  // Connect to the db
  await connectToDb(dbConnectionOptions);

  // Populate existing models
  const models = repopulateSeedData ? await seedDatabase() : await generateModels();

  // Generate HTTP endpoints for routes
  const router = Router();

  models.forEach((model) => {
    addRoutesFromModel(router, model);
  });

  // Generate endpoints for authentication & logging in
  const passport = initializePassport(User);
  const authRoutes = createAuthRoutes(User, passport);

  // Generate endpoints for collections
  createCollectionEndpoints(router, getCollectionNames, generateModel, addRoutesFromModel);

  const app = createExpressApp(router, authRoutes, passport);

  // Start the web server
  const webServerPort = process.env.PORT || 3000;

  const server = app.listen(webServerPort, () => {
    console.log(`App is listening for connections on port ${server.address().port}.`);
    console.log(`Looking out for API keys of: ${process.env.API_KEY}`);
  });
};

start();
