import { Router } from 'express';
import '../dal/users.js';
import { createUser, getAllUsers, getUserById } from '../dal/users.js';

const router = Router();

// TODO: Student implementation - Part 1: User Routes
// GET /users
router.get('/', async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: 'failed to fetch'});
    }
});
// GET /users/:id
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            res.status(404).json({ error: 'user not found'});
            return;
        }

        const user = await getUserById(id);
        if (!user) {
            res.status(404).json({ error: 'user not found'});
            return;
        }

        res.json(user);
    } catch (e) {
        res.status(500).json({ error: 'failed to fetch user!'});
    }
});
// POST /users

router.post('/', async (req, res) => {
    try {
        const {name, email} = req.body ?? {};

        if (typeof name !== 'string' || typeof email !== 'string') {
            res.status(400).json({ error: 'need a name and email'});
            return;
        }

        const user = await createUser({ name, email});
        res.status(201).json(user);
        
    } catch (e) {
        res.status(500).json({ error: 'failed to make user'});
    }
});

export default router;
