import mongoose from 'mongoose';

import User from './user';
import collectionModel from './collectionModel';

const connectDb = () => mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });

const models = { User, collectionModel };

export { connectDb };

export default models;
