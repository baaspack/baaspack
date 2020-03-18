import mongo from 'mongodb';

class Model {
  constructor(db, name) {
    this.name = name.slice(0, 1).toUpperCase() + name.slice(1);

    this.collection = db.collection(this.name);
  }

  async find(queryObj) {
    const documents = await this.collection.find(queryObj).toArray();

    if (documents.length === 1) {
      return documents[0];
    }

    return documents;
  }

  async get(id) {
    const oId = new mongo.ObjectID(id);

    return this.collection.findOne({ _id: oId });
  }

  async create(data) {
    await this.collection.insertOne(data);

    const { _id: id, ...otherData } = data;

    return { ...otherData, id };
  }

  async update(id, data) {
    const oId = new mongo.ObjectId(id);

    const updateResult = await this.collection.findOneAndReplace(
      { _id: oId },
      data,
      { returnOriginal: false },
    );

    return updateResult.value;
  }

  async patch(id, data) {
    const oId = new mongo.ObjectId(id);

    const updateResult = await this.collection.findOneAndUpdate(
      { _id: oId },
      { $set: data },
      { returnOriginal: false },
    );

    return updateResult.value;
  }

  delete(id) {
    const oId = new mongo.ObjectId(id);

    return this.collection.findOneAndDelete({ _id: oId }).value;
  }

  deleteMany(queryObj) {
    return this.collection.deleteMany(queryObj);
  }
}

export default Model;
