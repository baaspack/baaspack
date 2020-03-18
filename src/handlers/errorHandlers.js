/* eslint-disable arrow-body-style */
// From Wes Bos's LearnNode Tutorials

/*
  Catch Errors Handler

  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchErrors(), catch any errors they throw, and pass it along to our middleware with next()
*/

const catchErrors = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch(next);
  };
};

/*
  Not Found Error Handler

  If we hit a route that is not found, we mark it as 404 and
  pass it along to the next error handler to display
*/
const notFound = (req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
};


/*
  Mongoose Validation Error Handler

  Detect if there are validation errors
*/

const validationErrors = (err, req, res, next) => {
  // Validation errors appear as err.errors
  if (!err.errors) return next(err);

  res.json(err.errors);
};

/*
  Development Error Handler

  In development we show good error messages so if we hit a syntax error or
  any other previously un-handled error, we can show good info on what happened
*/
// eslint-disable-next-line no-unused-vars
const developmentErrors = (err, req, res, next) => {
  err.stack = err.stack || '';

  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>'),
  };

  res.status(err.status || 500);
  res.json(errorDetails);
};


/*
  Production Error Handler

  No stacktraces are leaked to user
*/
// eslint-disable-next-line no-unused-vars
const productionErrors = (err, req, res, next) => {
  res.status(err.status || 500);
  res.json(err.message);
};

export default {
  catchErrors,
  notFound,
  validationErrors,
  developmentErrors,
  productionErrors,
};
