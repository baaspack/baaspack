import { Router } from 'express';

class ResourceRouter {
  constructor(model) {
    this.model = model;
    this.router = Router();
    this.generateRoutes();
  }

  generateRoutes() {
    this.router.get('/', async (req, res) => {
      const resources = await this.model.find();

      return res.send(resources);
    });

    this.router.get('/:id', async (req, res) => {
      const resource = await this.model.get(req.params.id);

      return res.send(resource);
    });

    this.router.post('/', async (req, res) => {
      const modelData = {
        ...req.body,
        user: req.context.me.id,
      };

      const resource = await this.model.create(modelData);

      return res.send(resource);
    });

    this.router.patch('/:id', async (req, res) => {
      const resource = await this.model.patch(req.params.id, req.body);

      return res.send(resource);
    });

    this.router.put('/:id', async (req, res) => {
      const resource = await this.model.update(req.params.id, req.body);

      return res.send(resource);
    });

    this.router.delete('/:id', async (req, res) => {
      const resource = await this.model.delete(req.params.id);

      return res.send(resource);
    });
  }
}

export default ResourceRouter;
