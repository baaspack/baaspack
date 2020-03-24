import express from 'express';
import cors from 'cors';


import errorHandlers from './handlers/errorHandlers';

// const path = require('path');

const createExpressApp = (routes) => {
  const app = express();

  // Enable CORS from all origins
  app.use(cors());

  // Parse JSON from request bodies
  app.use(express.json());

  // Parse Url Encoded request bodies, typically sent from forms.
  app.use(express.urlencoded({ extended: true }));

  // Configure routes for collections w/ error handling built-in
  app.use(routes);

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

  return app;
};

export default createExpressApp;
