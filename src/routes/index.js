import errorHandlers from '../handlers/errorHandlers';

const createGenericRoutes = (model, wssRouter) => {
  const routes = [
    {
      type: 'get',
      path: `/${model.name}/`,
      handler: async (req, res) => {
        const resources = await model.find();

        wssRouter.handleGetAll(resources);
        res.send(resources);
      },
    }, {
      type: 'get',
      path: `/${model.name}/:id`,
      handler: async (req, res) => {
        const resource = await model.get(req.params.id);

        wssRouter.handleGetOne(resource);
        res.send(resource);
      },
    }, {
      type: 'post',
      path: `/${model.name}/`,
      handler: async (req, res) => {
        const resource = await model.create(req.body);

        wssRouter.handlePost(resource);
        res.send(resource);
      },
    }, {
      type: 'patch',
      path: `/${model.name}/:id`,
      handler: async (req, res) => {
        const resource = await model.patch(req.params.id, req.body);

        wssRouter.handlePatch(resource);
        res.send(resource);
      },
    }, {
      type: 'put',
      path: `/${model.name}/:id`,
      handler: async (req, res) => {
        const resource = await model.update(req.params.id, req.body);

        wssRouter.handlePut(resource);
        res.send(resource);
      },
    }, {
      type: 'delete',
      path: `/${model.name}/:id`,
      handler: async (req, res) => {
        const resource = await model.delete(req.params.id);

        wssRouter.handleDelete(resource);
        res.send(resource);
      },
    },
  ];

  return routes;
};

// TODO: Can we make this a pure function?
const addRoutesFromModel = (router, model, wss) => {
  const routeObjects = createGenericRoutes(model, wss);

  routeObjects.forEach(({ type, path, handler }) => {
    const protectedHandler = errorHandlers.catchErrors(handler);
    router[type](path, protectedHandler);
  });
};

export default addRoutesFromModel;
