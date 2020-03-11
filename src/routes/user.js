import { Router, response } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  const users = await req.context.models.User.find();
  return res.send(users);
});

router.get('/:userId', async (req, res) => {
  const user = await req.context.models.User.findById(req.params.userId);

  return res.send(user);
});

router.get('/:userId', (req, res) =>
  res.send(req.context.models.users[req.params.userId])
);

export default router;
