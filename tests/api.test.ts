import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 1: API Integration Tests', () => {
  let userId: number;
  let ticketId: number;

  beforeAll(async () => {
    const u = await request(app)
    .post('/users')
    .send({ name: 'setup', email: `setup-${Date.now()}@gmail.com`});
    expect(u.status).toBe(201);
    userId = u.body.id;

    const t = await request(app)
    .post('/tickets')
    .set('X-User-Id', String(userId))
    .send({ title: 'Setup Ticket', description: 'seed'});
    expect(t.status).toBe(201);
    ticketId = t.body.id;
  })
  //
  // user routes
  //
  it('should receive a 201 response from POST /user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Asher', email: `ash${Date.now()}@test.com`});
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Asher'});
    expect(res.body.id).toBeDefined();
  });

  it('should reject bad bodies with status 400', async () => {
    const res = await request(app).post('/users').send({ name: 'Bobb'});
    expect(res.status).toBe(400);
  });

  it('should return an array', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  })

  it('should return 404 for missing user', async () => {
    const res = await request(app).get('/users/999999');
    expect(res.status).toBe(404);
  });

  it('should return 404 for non numeric uid', async () => {
    const res = await request(app).get('/users/zzzz');
    expect(res.status).toBe(404);
  })

  //
  // auth
  //

  it('should 401 when x-user-id is bad', async() => {
    const res = await request(app).post('/tickets').send({});
    expect(res.status).toBe(401);
  });

  it('shouldnt 401 if valid', async() => {
    const res = await request(app)
    .post('/tickets')
    .set('X-User-Id', String(userId))
    .send({ title: 'auth-ok'});
    expect(res.status).not.toBe(401);
  });

  it('doesnt require xuid when getting tickets', async () => {
    const res = await request(app).get('/tickets');
    expect(res.status).not.toBe(401);
  })

  //
  // tickets
  //

  it('should create a ticket with 201 status', async() => {
    const res = await request(app)
    .post('/tickets')
    .set('X-User-Id', String(userId))
    .send({ title: 'new ticket', description: 'whatever'});
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'new ticket',
      description: 'whatever',
      creator_id: userId,
    });
    expect(res.body.id).toBeDefined();
  })

  it('should reject missing title with 400', async () => {
    const res = await request(app)
    .post('/tickets')
    .set('X-User-Id', String(userId))
    .send({ description: 'no title'});
    expect(res.status).toBe(400);
  })

  it('should return a ticket with 200', async () => {
    const res = await request(app).get(`/tickets/${ticketId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ticketId);
  })

  it('should 404 on missing ticket', async() => {
    const res = await request(app).get(`/tickets/999999`);
    expect(res.status).toBe(404);
  })

  it('should update ticket status (200)', async() => {
    const res = await request(app)
    .patch(`/tickets/${ticketId}/status`)
    .set('X-User-Id', String(userId))
    .send({ status: 'IN_PROGRESS'});
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('IN_PROGRESS')
  })

  //
  //filtering // pagination or whatever
  //
  it('should return at most one row', async () => {
    const res = await request(app).get('/tickets?limit=1');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(1);
  })

  it('should skip the first row with offset 1', async() => {
    const all = await request(app).get('/tickets'); 
    const filtered = await request(app).get('/tickets?offset=1&limit=1');
    expect(filtered.status).toBe(200);
    if (all.body.length >= 2) {
      expect(filtered.body[0].id).toBe(all.body[1].id);
    }
  })

  it('should only return rows with status', async() => {
    const res = await request(app).get('/tickets?status=IN_PROGRESS');
    expect(res.status).toBe(200);
    for (const ticket of res.body) {
      expect(ticket.status).toBe('IN_PROGRESS');
    }
  })

  it('should reject non number limits', async () => {
    const res = await request(app).get('/tickets?limit=abc');
    expect(res.status).toBe(400);
  })

  it('should 401 if id is missing', async() => {
    const res = await request(app).post('/tickets').send({ title: 'x'});
    expect(res.status).toBe(401);
  })

  it('should 401 when id is zero', async() => {
    const res = await request(app)
    .post('/tickets')
    .set('X-User-Id', '0')
    .send({ title: 'x'});
    expect(res.status).toBe(401);
  })

  it('get tickets doesnt require id', async() => {
    const res = await request(app).get('/tickets');
    expect(res.status).not.toBe(401);
  })
});
