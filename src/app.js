import express from 'express';
import session from 'express-session';
import cors from 'cors';
import redis from 'redis';
import connectRedis from 'connect-redis';

import errorHandlers from './handlers/errorHandlers';
import { hasApiKey } from './handlers/authorization';

export const createSessionParser = () => {
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient({ host: process.env.REDIS_HOSTNAME });

  redisClient.on('connect', () => {
    console.log('Redis:', 'connected!');
  });

  redisClient.on('error', (err) => {
    console.error('Redis Connection Error:', err);
  });

  const sessionOptions = {
    store: new RedisStore({ client: redisClient }),
    name: '_redis',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
    },
  };

  if (process.env.NODE_ENV === 'production') {
    sessionOptions.cookie.secure = true;
  }

  const sessionParser = session(sessionOptions);

  return sessionParser;
}

export const setupMiddleware = (app, sessionParser, routes, authRoutes, passport) => {
  // Enable CORS from all origins
  app.use(cors({ origin: true, credentials: true }));

  // Parse JSON from request bodies
  app.use(express.json());

  // Parse Url Encoded request bodies, typically sent from forms.
  app.use(express.urlencoded({ extended: true }));

  if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
  }

  // Configure sessions
  app.use(sessionParser);

  // Early exit if a request doesn't include an auth header
  app.use(hasApiKey);

  app.use(passport.initialize());
  app.use(passport.session());

  // Configure routes for collections w/ error handling built-in
  app.use(authRoutes);
  app.use(routes);

  // serve static files from public directory
  app.use(express.static('public/uploads'));
  app.use(express.static('public'));

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
};

export default setupMiddleware;
