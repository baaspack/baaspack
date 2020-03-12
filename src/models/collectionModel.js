import mongoose from 'mongoose';

const createMongooseModel = (resourceName) => {
  const resourceSchema = new mongoose.Schema({}, { strict: false });

  return mongoose.model(resourceName, resourceSchema);
};

export default createMongooseModel;
