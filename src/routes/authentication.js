import { Router } from 'express';
import bcrypt from 'bcrypt';
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
    const existingUsers = await User.find({ email });
    const existingUser = existingUsers[0];

    // TODO: Research best practices for duplicate usernames / emails.
    //  It might be bad practice to tell a malicious actor that an
    //  an email address is registered with our service.
    if (existingUser) {
      return res.status(422).send({ message: 'That email already exists!' });
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

const createAuthRoutes = (User, passport) => {
  const router = Router();

  router.post('/register', catchErrors(register(User)));

  router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({ id: req.user.id });
  });

  router.post('/logout', (req, res) => {
    req.logout();
    res.json({ message: 'OK' });
  });

  return router;
};

export default createAuthRoutes;
