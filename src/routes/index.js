import errorHandlers from '../handlers/errorHandlers';

const createGenericRoutes = (model, wss) => {
  const routes = [
    {
      type: 'get',
      path: `/${model.name}/`,
      handler: async (req, res) => {
        const resources = await model.find();

        res.send(resources);
      },
    }, {
      type: 'get',
      path: `/${model.name}/:id`,
      handler: async (req, res) => {
        const resource = await model.get(req.params.id);

        res.send(resource);
      },
    }, {
      type: 'post',
      path: `/${model.name}/`,
      handler: async (req, res) => {
        const resource = await model.create(req.body);

        wss.router.handleHttpRequest('create', model.name, resource);
        res.send(resource);
      },
    }, {
      type: 'put',
      path: `/${model.name}/:id`,
      handler: async (req, res) => {
        const resource = await model.update(req.params.id, req.body);

        wss.router.handleHttpRequest('update', model.name, resource);
        res.send(resource);
      },
    }, {
      type: 'patch',
      path: `/${model.name}/:id`,
      handler: async (req, res) => {
        const resource = await model.patch(req.params.id, req.body);

        wss.router.handleHttpRequest('patch', model.name, resource);
        res.send(resource);
      },
    }, {
      type: 'delete',
      path: `/${model.name}/:id`,
      handler: async (req, res) => {
        const resource = await model.delete(req.params.id);

        wss.router.handleHttpRequest('delete', model.name, resource);
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
