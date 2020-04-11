import { Router } from 'express';
import bcrypt from 'bcrypt';
import errorHandlers from '../handlers/errorHandlers';

const { catchErrors } = errorHandlers;

const BCRYPT_SALT_ROUNDS = 10;

export const hashedPasswordIfValid = async (UserModel, email, password) => {
  if (!password || password.length < 3) {
    throw new Error('Weak password');
  }

  const existingUsers = await UserModel.find({ email });
  const existingUser = existingUsers[0];

  if (existingUser) {
    throw new Error('Existing user');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  return passwordHash;
};

const register = (User) => async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPass = await hashedPasswordIfValid(User, email, password);

    const user = await User.create({
      email,
      password: hashedPass,
    });

    res.send({ id: user.id });
  } catch (e) {
    res.status(422).send({ message: e.message });
  }
};

const createAuthRoutes = (User, passport) => {
  const router = Router();

  router.post('/register', catchErrors(register(User)));

  router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err); }

      if (!user) {
        return res.status(401).json({ message: info.message });
      }

      // console.log('REQ.SESSION FROM LOGIN', req.session); // holden added this

      req.logIn(user, (err) => {
        if (err) { return next(err); }
        return res.send({ id: user.id });
      });
    })(req, res, next);
  });

  router.post('/logout', (req, res) => {
    req.logout();
    res.json({ message: 'OK' });
  });

  return router;
};

export default createAuthRoutes;
