const createCollectionEndpoints = (router, getCollectionNames, generateModels, addRoutesFromModel) => {
  router.get('/Collections/', async (req, res) => {
    const collectionNames = await getCollectionNames();

    res.json(collectionNames);
  });

  router.post('/Collections/', async (req, res) => {
    const { collectionName } = req.body;

    const newModels = await generateModels([collectionName]);

    addRoutesFromModel(router, newModels[collectionName]);

    return res.send(collectionName);
  });
};

export default createCollectionEndpoints;
