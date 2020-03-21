import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

const initializePassport = (User) => {
  const authenticateUser = async (email, password, done) => {
    const users = await User.find({ email });
    const user = users[0];

    if (!user) {
      return done(null, false, { message: 'User wrong' });
    }

    const validPass = await bcrypt.compare(password, user.password);

    if (!validPass) {
      return done(null, false, { message: 'Password wrong' });
    }

    return done(null, user);
  };

  const localStrategyOptions = {
    usernameField: 'email',
  };

  passport.use(new LocalStrategy(
    localStrategyOptions,
    authenticateUser,
  ));

  passport.serializeUser((user, done) => (done(null, user.id)));
  passport.deserializeUser(async (userId, done) => {
    const { id, email } = await User.get(userId);

    return done(null, { id, email });
  });

  return passport;
};

export const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(403).json({ message: 'Unauthorized' });
};

export default initializePassport;
