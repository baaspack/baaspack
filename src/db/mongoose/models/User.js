import mongoose from 'mongoose';

const isEmail = (str) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(str);
};

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [isEmail, 'Invalid Email Address'],
    required: 'Please provide an email address',
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);
