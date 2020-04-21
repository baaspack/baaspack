const createCollectionEndpoints = (router, getCollectionNames, generateModel, addRoutesFromModel, wss) => {
  router.get('/Collections/', async (req, res) => {
    const collectionNames = await getCollectionNames();

    res.json(collectionNames);
  });

  router.post('/Collections/', async (req, res) => {
    const { collectionName } = req.body;

    const newModel = await generateModel(collectionName);

    addRoutesFromModel(router, newModel, wss);

    return res.send(collectionName);
  });
};

export default createCollectionEndpoints;
