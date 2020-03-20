import errorHandlers from '../handlers/errorHandlers';
import { verifyToken } from '../routes/auth';

const createGenericRoutes = (model) => {
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

        res.send(resource);
      },
    }, {
      type: 'patch',
      path: `/${model.name}/:id`,
      handler: async (req, res) => {
        const resource = await model.patch(req.params.id, req.body);

        res.send(resource);
      },
    }, {
      type: 'put',
      path: `/${model.name}/:id`,
      handler: async (req, res) => {
        const resource = await model.update(req.params.id, req.body);

        res.send(resource);
      },
    }, {
      type: 'delete',
      path: `/${model.name}/:id`,
      handler: async (req, res) => {
        const resource = await model.delete(req.params.id);

        res.send(resource);
      },
    },
  ];

  return routes;
};

// TODO: Can we make this a pure function?
const addRoutesFromModel = (router, model) => {
  const routeObjects = createGenericRoutes(model);

  routeObjects.forEach(({ type, path, handler }) => {
    const protectedHandler = errorHandlers.catchErrors(handler);

    // TODO: Selective authorization? With verifyToken here,
    // all requests will require authorization
    router[type](path, verifyToken, protectedHandler);
  });
};


export default addRoutesFromModel;
