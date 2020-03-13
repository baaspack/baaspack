import { Router, response } from 'express';

class CollectionManager {
  constructor(db) {
    this.db = db;
    this.router = Router();
    this.generateRoutes();
  }

  generateRoutes() {
    this.router.get('/', async (req, res) => {
      let collections = await this.db.listCollections().toArray();
      collections = collections.map((collection) => collection.name);
      return res.send(collections);
    });
  }
}

export default CollectionManager;
