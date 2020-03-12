import { Router } from 'express';

class CollectionRouter {
  constructor(resource) {
    this.resource = resource;
    this.router = Router();
    this.generateRoutes();
  }

  generateRoutes() {
    this.router.get('/', async (req, res) => {
      console.log(req);
      const resources = await req.context.models[this.resource].find();

      return res.send(resources);
    });

    this.router.post('/', async (req, res) => {
      const resource = await req.context.models[this.resource].create({
        ...req.body,
        user: req.context.me.id
      });

      return res.send(resource);
    });
  }
}

// const router = Router();

// router.get('/', async (req, res) => {
//   const messages = await req.context.models.Message.find();

//   return res.send(messages);
// });

// router.get('/:messageId', async (req, res) => {
//   const message = await req.context.models.Message.findById(
//     req.params.messageId
//   );

//   return res.send(message);
// });

// router.post('/', async (req, res) => {
//   const message = await req.context.models.Message.create({
//     text: req.body.text,
//     user: req.context.me.id
//   });

//   return res.send(message);
// });

// router.delete('/:messageId', async (req, res) => {
//   const message = await req.context.models.Message.findById(
//     req.params.messageId
//   );

//   let result = null;

//   if (message) {
//     result = await message.remove();
//   }

//   return res.send(result);
// });

export default CollectionRouter;
