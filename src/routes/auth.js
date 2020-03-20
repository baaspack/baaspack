import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import errorHandlers from '../handlers/errorHandlers';

const { catchErrors } = errorHandlers;

const BCRYPT_SALT_ROUNDS = 10;

const register = (User) => {
  return async (req, res) => {
    const { email, password } = req.body;

    // TODO: better way to handle password validation??
    //  The @hapi/joi module allows us to apply schemas
    //  to requests. Might be something to look into if this
    //  is bad.
    if (!password || password.length < 3) {
      res.status(422).send({ message: 'That password is weak!' });
    }

    // TODO: validate unique email on the db as well?
    //  it's nice doing it here instead of the model
    //  since this is db agnostic. However, unique indexes
    //  can definitely take care of this.
    const existingUser = await User.findOne({ email });

    // TODO: Research best practices for duplicate usernames / emails.
    //  It might be bad practice to tell a malicious actor that an
    //  an email address is registered with our service.
    if (existingUser) {
      console.log(existingUser);
      res.status(422).send({ message: 'That email already exists!' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = new User({
      email,
      password: passwordHash,
    });

    await user.save();

    res.send({ id: user.id });
  };
};

const login = (User) => {
  return async (req, res) => {
    const { email, password } = req.body;

    // Check that user exists
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).send('Email or password is wrong!');
    }

    const validPass = await bcrypt.compare(password, user.password);

    if (!validPass) {
      res.status(400).send('Email or password is wrong!');
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.header('auth-token', token).send(token);
  };
};

export const verifyToken = (req, res, next) => {
  const token = req.header('auth-token');

  if (!token) {
    // TODO Not sure this is the best way to handle errors....
    return next({ status: 401, message: 'Invalid token!' });
  }

  try {
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verifiedToken.id;
    next();
  } catch (e) {
    return next({ status: 400, message: 'Invalid token!' });
  }
};

const createAuthRoutes = (User) => {
  const router = Router();

  router.post('/register', catchErrors(register(User)));

  router.post('/login', catchErrors(login(User)));

  return router;
};

export default createAuthRoutes;
