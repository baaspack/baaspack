import dotenv from 'dotenv';
import express, { Router } from 'express';

import {
  connectToDb,
  generateModel,
  generateModels,
  generateUploadsModel,
  seedDatabase,
  getCollectionNames,
  User,
} from './db/mongoose';

import startWebsocketServer from './websockets';
// import setupMiddleware from './app';
import initializePassport from './handlers/authorization';
import createAuthRoutes from './routes/authentication';
import addRoutesFromModel from './routes';
import createCollectionEndpoints from './routes/collectionManager';
import createUploadsEndpoints from './routes/uploads';

// FROM app.js
import session from 'express-session';
import cors from 'cors';
import redis from 'redis';
import connectRedis from 'connect-redis';

import errorHandlers from './handlers/errorHandlers';
import { hasApiKey } from './handlers/authorization';

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
// const start = async () => {
const app = express();

// Start the web server
const webServerPort = process.env.PORT || 3000;

const server = app.listen(webServerPort, () => {
  console.log(`App is listening for connections on port ${server.address().port}.`);
  console.log(`Looking out for API keys of: ${process.env.API_KEY}`);
});

// Connect to the db
// await connectToDb(dbConnectionOptions);
(async () => {
  await connectToDb(dbConnectionOptions);
})();

// Populate existing models
// const models = repopulateSeedData ? await seedDatabase() : await generateModels();
// let models = (async () => {
//   return repopulateSeedData ? await seedDatabase() : await generateModels();
// })();

// let models = (async () => {
//   if (repopulateSeedData) {
//     return await seedDatabase()
//   }

//   return await generateModels();
// })();

// let models = (() => {
//   if (repopulateSeedData) {
//     return seedDatabase()
//       .then((data) => {
//         return data;
//       });
//   }

//   return generateModels()
//     .then((data) => {
//       return data;
//     });
// })();

const getModels = async () => {
  if (repopulateSeedData) {
    return await seedDatabase()
  }

  return await generateModels();
}

const models = getModels();

console.log('MODELS FROM START.JS', models);

// Start the websocket server
const wss = startWebsocketServer(server, models);

// Generate HTTP endpoints for routes
const router = Router();

models.forEach((model) => {
  addRoutesFromModel(router, model, wss);
});

// Generate endpoints for authentication & logging in
const passport = initializePassport(User);
const authRoutes = createAuthRoutes(User, passport);

// Generate endpoints for collections
createCollectionEndpoints(router, getCollectionNames, generateModel, addRoutesFromModel);

// Generate endpoints for storage
models.push(generateUploadsModel());
createUploadsEndpoints(router, models.uploads);

// console.log('app from end of start', app);
// console.log('router from end of start', router);
// console.log('authRoutes from end of start', authRoutes);
// console.log('passport from end of start', passport);
// console.log('setupMiddleware from end of start', setupMiddleware);

// setupMiddleware(app, router, authRoutes, passport);

// REPLACING APP.JS AND CALL TO SETUPMIDDLEWARE IN START WITH THE FOLLOWING
const RedisStore = connectRedis(session);
const redisClient = redis.createClient({ host: process.env.REDIS_HOSTNAME });

redisClient.on('connect', () => {
  console.log('Redis:', 'connected!');
});

redisClient.on('error', (err) => {
  console.error('Redis Connection Error:', err);
});

// Enable CORS from all origins
app.use(cors({ origin: true, credentials: true }));

// Parse JSON from request bodies
app.use(express.json());

// Parse Url Encoded request bodies, typically sent from forms.
app.use(express.urlencoded({ extended: true }));

// Configure sessions
app.use(sessionParser);

const sessionParser = app.use(session({
  store: new RedisStore({ client: redisClient }),
  name: '_redis',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    sameSite: true,
  },
}));

// Early exit if a request doesn't include an auth header
app.use(hasApiKey);

app.use(passport.initialize());
app.use(passport.session());

// Configure routes for collections w/ error handling built-in
app.use(authRoutes);
app.use(router);

// serve static files from public directory
app.use(express.static('public/uploads'));
app.use(express.static('public'));
// app.use('/static', express.static(path.join(__dirname, 'public')));
// app.use('/static', express.static(__dirname + '/public'));

// 404 response for requests that didn't hit a route
app.use(errorHandlers.notFound);

// One of our error handlers will see if these errors are just validation errors
app.use(errorHandlers.validationErrors);

// Configure error handlers
// Development Error Handler - Prints stack trace
if (app.get('env') === 'development') {
  app.use(errorHandlers.developmentErrors);
}

// production error handler -- does not print stack trace
app.use(errorHandlers.productionErrors);
// };

// start();

export { sessionParser };



















// import dotenv from 'dotenv';
// import express, { Router } from 'express';

// import {
//   connectToDb,
//   generateModel,
//   generateModels,
//   generateUploadsModel,
//   seedDatabase,
//   getCollectionNames,
//   User,
// } from './db/mongoose';

// import startWebsocketServer from './websockets';
// import setupMiddleware from './app';
// import initializePassport from './handlers/authorization';
// import createAuthRoutes from './routes/authentication';
// import addRoutesFromModel from './routes';
// import createCollectionEndpoints from './routes/collectionManager';
// import createUploadsEndpoints from './routes/uploads';

// // Import variables from .env to make them available on `process.env`
// dotenv.config();

// // Set a flag for whether to reseed the database
// const repopulateSeedData = process.env.SEED_DB;

// // Set DB connection options
// const dbConnectionOptions = {
//   dbUsername: process.env.DB_USERNAME,
//   dbPassword: process.env.DB_PASSWORD,
//   dbHostname: process.env.DB_HOSTNAME,
//   dbPort: process.env.DB_PORT,
//   dbName: process.env.DB_DBNAME,
// };

// // Start the App!
// const start = async () => {
//   const app = express();

//   // Start the web server
//   const webServerPort = process.env.PORT || 3000;

//   const server = app.listen(webServerPort, () => {
//     console.log(`App is listening for connections on port ${server.address().port}.`);
//     console.log(`Looking out for API keys of: ${process.env.API_KEY}`);
//   });

//   // Connect to the db
//   await connectToDb(dbConnectionOptions);

//   // Populate existing models
//   const models = repopulateSeedData ? await seedDatabase() : await generateModels();

//   // Start the websocket server
//   const wss = startWebsocketServer(server, models);

//   // Generate HTTP endpoints for routes
//   const router = Router();

//   models.forEach((model) => {
//     addRoutesFromModel(router, model, wss);
//   });

//   // Generate endpoints for authentication & logging in
//   const passport = initializePassport(User);
//   const authRoutes = createAuthRoutes(User, passport);

//   // Generate endpoints for collections
//   createCollectionEndpoints(router, getCollectionNames, generateModel, addRoutesFromModel);

//   // Generate endpoints for storage
//   models.push(generateUploadsModel());
//   createUploadsEndpoints(router, models.uploads);

//   // console.log('app from end of start', app);
//   // console.log('router from end of start', router);
//   // console.log('authRoutes from end of start', authRoutes);
//   // console.log('passport from end of start', passport);
//   // console.log('setupMiddleware from end of start', setupMiddleware);

//   setupMiddleware(app, router, authRoutes, passport);


//   // try {
//   //   setupMiddleware(app, router, authRoutes, passport);
//   // } catch (e) {
//   //   console.log(e);
//   // }
// };

// start();
