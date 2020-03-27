import dotenv from 'dotenv';
import express, { Router } from 'express';

import {
  connectToDb,
  generateModels,
  seedDatabase,
  getCollectionNames,
} from './db/mongoose';

import startWebsocketServer from './websockets';
// import createWebsocketRouteHandlers from './websockets/routeHandlers';
import addRoutesFromModel from './routes';
import createCollectionEndpoints from './routes/collectionManager';
import setupMiddleware from './app';

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
  const app = express();

  // Start the web server
  const webServerPort = process.env.PORT || 3000;

  const server = app.listen(webServerPort, () => {
    console.log(`App is listening for connections on port ${server.address().port}.`);
  });

  // Connect to the db
  await connectToDb(dbConnectionOptions);

  // Populate existing models
  const models = repopulateSeedData ? await seedDatabase() : await generateModels();

  // Start the websocket server
  const wss = startWebsocketServer(server, models);
  // wss.router = createWebsocketRouteHandlers(wss);

  // console.log('WSS FROM START', wss);

  // Generate HTTP endpoints for routes
  const router = Router();

  Object.keys(models).forEach((modelName) => {
    const model = models[modelName];
    addRoutesFromModel(router, model, wss);
  });

  // Generate endpoints for collections
  createCollectionEndpoints(router, getCollectionNames, generateModels, addRoutesFromModel);

  setupMiddleware(app, router);
};

start();
