import mongoose from 'mongoose';
import defaultSchema from './defaultSchema';
import uploadsMetadataSchema from './uploadsMetadataSchema';
import createAppModel from './MongooseModel';
import fillDbWithSeedData from '../seedData';
import MongooseUser from './models/User';

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose Error: ${err.message}`);
});

mongoose.set('debug', true);

const getCollections = async () => {
  const collections = await mongoose.connection.db
    .listCollections()
    .toArray();

  return collections;
};

export const getCollectionNames = async () => {
  const collections = await getCollections();

  const collectionNames = collections
    .filter(({ name }) => !/user(s)?/i.test(name))
    .filter(({ name }) => !/uploads/i.test(name))
    .map(({ name }) => name);

  return collectionNames;
};

export const connectToDb = async ({ dbUsername, dbPassword, dbHostname, dbPort, dbName }) => {
  const connectionString = `mongodb://${dbUsername}:${dbPassword}@${dbHostname}:${dbPort}/${dbName}`;

  console.log(`Connecting to ${connectionString}`);

  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    console.log(`Connected to ${connectionString}`);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};

export const generateModel = (collectionName) => {
  const mongooseModel = mongoose.model(collectionName, defaultSchema, collectionName);

  return createAppModel(collectionName, mongooseModel);
};

export const generateModels = async (collectionsToCreate) => {
  const collectionNames = collectionsToCreate || await getCollectionNames();

  const appModels = collectionNames.map(generateModel);

  return appModels;
};

// TODO: unhandled promise error from mongoose.model()

export const generateUploadsModel = () => {
  const model = mongoose.model('uploads', uploadsMetadataSchema);
  return createAppModel('uploads', model);
};

export const seedDatabase = async () => {
  const collectionNames = ['Message'];

  const appModels = await generateModels(collectionNames);

  await fillDbWithSeedData(appModels);

  return appModels;
};

export const User = createAppModel('User', MongooseUser);

export default mongoose;
