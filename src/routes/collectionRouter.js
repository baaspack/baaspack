import { Router } from 'express';

class CollectionRouter {
  constructor(resource) {
    this.resource = resource;
    this.router = Router();
    this.generateRoutes();
  }

  generateRoutes() {
    this.router.get('/', async (req, res) => {
      const resources = await req.context.models[this.resource].find();

      return res.send(resources);
    });

    this.router.get('/:id', async (req, res) => {
      const resource = await req.context.models[this.resource].findById(
        req.params.id,
      );

      return res.send(resource);
    });

    this.router.post('/', async (req, res) => {
      const resource = await req.context.models[this.resource].create({
        ...req.body,
        user: req.context.me.id,
      });

      return res.send(resource);
    });

    this.router.patch('/:id', async (req, res) => {
      const resource = await req.context.models[this.resource].findById(
        req.params.id,
      );

      console.log(req.body);

      resource.text = req.body.text;

      await resource.save();

      return res.send(resource);
    });

    this.router.put('/:id', async (req, res) => {
      const resource = await req.context.models[this.resource].findById(
        req.params.id,
      );

      try {
        resource.overwrite(req.body);
        await resource.save();
      } catch (e) {
        console.error(e);
      }

      return res.send(resource);
    });

    this.router.delete('/:id', async (req, res) => {
      const resource = await req.context.models[this.resource].findById(
        req.params.id,
      );

      let result = null;

      if (resource) {
        result = await resource.remove();
      }

      return res.send(result);
    });
  }
}

export default CollectionRouter;
