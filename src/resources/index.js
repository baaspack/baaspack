import Model from './Model';
import Router from './Router';
import seedDatabase from './seed';

class Resource extends Model {
  constructor(db, name) {
    super(db, name);
    this.router = new Router(this).router;
  }
}

const createResources = async (db, seedData) => {
  const resourceNames = ['user', 'message'];

  const resources = resourceNames.reduce((accumulator, resourceName) => {
    accumulator[resourceName] = new Resource(db, resourceName);

    return accumulator;
  }, {});

  if (seedData) {
    seedDatabase(resources);
  }

  return resources;
};

export default createResources;
