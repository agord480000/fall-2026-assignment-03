import { Router } from 'express';
import '../dal/tickets.js';
import '../dal/timeLogs.js';
import { createTicket, getAllTickets, getTicketById, updateTicketStatus } from '../dal/tickets.js';
import authMiddleware from '../middleware/auth.js';
import { getTotalHoursForTicket, insertTimeLog } from '../dal/timeLogs.js';

const router = Router();

// TODO: Student implementation - Part 1: Ticket Routes
// GET /tickets
router.get('/', async (req,res) => {
    try {
        const {limit, offset, status} = req.query;

        const options: {
            limit?: number;
            offset?: number;
            status?: string
        } = {};

        if (limit !== undefined) {
            const n = Number(limit);
            if (!Number.isInteger(n) || n < 0) {
                res.status(400).json({ error: 'bad limit'});
                return;
            }
            options.limit = n;
        }

        if (offset !== undefined) {
            const n = Number(offset);
            if (!Number.isInteger(n) || n < 0) {
                res.status(400).json({ error: 'bad offset!'});
                return;
            }
            options.offset=n;
        }

        if (status !== undefined) {
            if (typeof status !== 'string') {
                res.status(400).json({ error: 'bad status'});
                return;
            }
            options.status = status;
        }

        const tickets = await getAllTickets(options);
        res.json(tickets);
    } catch (e) {
        res.status(500).json({ error: 'failed to fetch tickets'});
    }
});
// GET /tickets/:id
router.get('/:id', async (req,res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            res.status(404).json({error: 'cannot find ticket'});
            return;
        }
        const ticket = await getTicketById(id);
        if (!ticket) {
            res.status(404).json({error: 'cannot find ticket'});
            return;
        }

        res.json(ticket);
    } catch (e) {
        res.status(500).json({ error: 'failed to get ticket'});
    }
})
// POST /tickets
router.post('/', authMiddleware, async (req, res) => {
    try {
        const creator_id = res.locals.userId as number;
        const { title, description } = req.body ?? {};

        if (typeof title !== 'string' || title.trim() === '') {
            res.status(400).json({ error: 'need a title'});
            return;
        }

        if (description !== undefined && typeof description !== 'string') {
            res.status(400).json({ error: 'description must be a string!'});
            return;
        }

        const ticket = await createTicket({
            creator_id,
            title,
            description: description ?? null,
        });

        res.status(201).json(ticket);
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'failed to make ticket'});
    }
})
// PATCH /tickets/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            res.status(404).json({ error: 'ticket not found!'});
            return;
        }

        const {status} = req.body ?? {};
        if (typeof status !== 'string' || status.trim() === '') {
            res.status(400).json({ error: 'status is needed'});
            return;
        }

        const updated = await updateTicketStatus(id, status);
        if (!updated) {
            res.status(404).json({ error: 'ticket not found'});
            return;
        }

        res.status(200).json(updated);
        
    } catch (e) {
        res.status(500).json({ error: 'failed to update status'});
    }
})
// TODO: Student implementation - Part 2: Time Log Routes
// POST /tickets/:id/time
router.post('/:id/time', authMiddleware, async (req,res) => {
    try {
        const ticketId = Number(req.params.id);
        if (!Number.isInteger(ticketId)) {
            res.status(404).json({error: 'ticket not found'});
            return;
        }

        const ticket = await getTicketById(ticketId);
        if (!ticket) {
            res.status(404).json({ error: 'ticket not found'});
            return;
        }
    

        const {hours} = req.body ?? {};
        if (typeof hours !== 'number' || !Number.isFinite(hours) || hours <= 0) {
            res.status(400).json({ error: 'hours must be positive'});
            return;
        }

        const userId = res.locals.userId as number;
        const log = await insertTimeLog(ticketId, userId, hours);
        res.status(201).json(log);
        } catch (e) {
            res.status(500).json({ error: 'failed to create time log'});
    }
})

// GET /tickets/:id/time
router.get('/:id/time', async (req,res) => {
    try {
        const ticketId = Number(req.params.id);
        if (!Number.isInteger(ticketId)) {
            res.status(404).json({ error: 'ticket not found'});
            return;
        }

        const ticket = await getTicketById(ticketId);
        if (!ticket) {
            res.status(404).json({ error: 'ticket not found'});
            return;
        }

        const total_hours = await getTotalHoursForTicket(ticketId);
        res.json({ ticket_id: ticketId, total_hours});
    } catch (e) {
        res.status(500).json({ error: 'failed to fetch total hours'});
    }
})

export default router;
