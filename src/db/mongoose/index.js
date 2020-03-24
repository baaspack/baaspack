import mongoose from 'mongoose';
import defaultSchema from './defaultSchema';
import uploadsMetadataSchema from './uploadsMetadataSchema';
import createAppModel from './MongooseModel';
import fillDbWithSeedData from '../seedData';

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose Error: ${err.message}`);
});

mongoose.set('debug', true);

export const getCollectionNames = async () => {
  const collections = await mongoose.connection.db
    .listCollections()
    .toArray();

  const collectionNames = collections
    .filter(({ name }) => name !== 'User')
    .map(({ name }) => name);

  return collectionNames;
};

export const connectToDb = async ({ serverUrl, dbName }) => {
  const connectionString = `${serverUrl}/${dbName}`;

  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    console.log(`Connected to ${connectionString}`);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};

export const generateModels = async (collectionsToCreate) => {
  const collectionNames = collectionsToCreate || await getCollectionNames();

  const appModels = collectionNames.reduce((obj, collectionName) => {
    const mongooseModel = mongoose.model(collectionName, defaultSchema, collectionName);

    // eslint-disable-next-line no-param-reassign
    obj[collectionName] = createAppModel(collectionName, mongooseModel);

    return obj;
  }, {});

  return appModels;
};

export const generateUploadsModel = () => {
  const model = mongoose.model('uploads', uploadsMetadataSchema);
  return createAppModel('uploads', model);
}

export const seedDatabase = async () => {
  const collectionNames = ['Message'];

  const appModels = await generateModels(collectionNames);

  await fillDbWithSeedData(appModels);

  return appModels;
};

export default mongoose;
