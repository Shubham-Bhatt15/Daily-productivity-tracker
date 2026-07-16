// Set required env vars before requiring the app, so JWT signing works
// without needing a real .env file present in CI.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-ci';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const Task = require('../models/Task');

let mongoServer;
let tokenA, tokenB, taskId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();

  const resA = await request(app)
    .post('/api/auth/register')
    .send({ name: 'User A', email: 'a@test.com', password: 'password123' });
  tokenA = resA.body.token;

  const resB = await request(app)
    .post('/api/auth/register')
    .send({ name: 'User B', email: 'b@test.com', password: 'password123' });
  tokenB = resB.body.token;

  const taskRes = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ title: "A's private task" });
  taskId = taskRes.body._id;
});

describe('Task ownership enforcement', () => {
  test('user B does not see user A tasks in their own list', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    expect(res.body.find((t) => t._id === taskId)).toBeUndefined();
  });

  test('user B cannot toggle (complete) user A task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);

    const task = await Task.findById(taskId);
    expect(task.completed).toBe(false);
  });

  test('user B cannot delete user A task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);

    const task = await Task.findById(taskId);
    expect(task).not.toBeNull();
  });

  test('user B cannot start the timer on user A task', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}/start-timer`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });

  test('user B cannot edit details of user A task', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}/details`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Hijacked title' });

    expect(res.status).toBe(404);

    const task = await Task.findById(taskId);
    expect(task.title).toBe("A's private task");
  });

  test('user A can access and modify their own task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  test('requests with no token are rejected', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });
});