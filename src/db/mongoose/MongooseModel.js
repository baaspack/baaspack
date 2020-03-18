const createAppModel = (name, mongooseModel) => {
  const appModel = {
    name,
    async find(queryObj = {}) {
      const documents = await mongooseModel
        .find(queryObj);

      console.log(documents);

      return documents;
    },
    async get(id) {
      const document = await mongooseModel
        .findById(id);

      return document;
    },
    async create(data) {
      const newDocument = await mongooseModel.create(data);

      return newDocument;
    },
    // TODO: this requires two queries, not efficient. Can't
    // find an easy way to get mongoose to replace a doc, maintain
    // timestamps, AND return the new doc all in one go. This
    // also updated the createdAt timestamp... not sure we want that
    // but maybe that's expected behavior for a PUT
    async update(id, data) {
      await mongooseModel.replaceOne(
        { _id: id },
        data,
      );

      return this.get(id);
    },
    async patch(id, data) {
      const updatedDoc = await mongooseModel.findOneAndUpdate(
        { _id: id },
        { $set: data },
        { returnOriginal: false },
      );

      return updatedDoc;
    },
    async delete(id) {
      const deletedDoc = await mongooseModel
        .findOneAndDelete({ _id: id });

      return deletedDoc;
    },
    async deleteAll() {
      const result = await mongooseModel.deleteMany({});

      return result;
    },
  };

  return appModel;
};

export default createAppModel;
