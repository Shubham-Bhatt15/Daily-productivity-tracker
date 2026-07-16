process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-ci';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const TimerSession = require('../models/TimerSession');

let mongoServer;
let token, taskA, taskB;

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

  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Timer User', email: 'timer@test.com', password: 'password123' });
  token = registerRes.body.token;

  const taskARes = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Task A' });
  taskA = taskARes.body._id;

  const taskBRes = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Task B' });
  taskB = taskBRes.body._id;
});

describe('Timer start/stop', () => {
  test('starting a timer sets isRunning and lastStartedAt', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskA}/start-timer`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.isRunning).toBe(true);
    expect(res.body.lastStartedAt).toBeTruthy();
  });

  test('cannot start a timer on a completed task', async () => {
    await request(app)
      .put(`/api/tasks/${taskA}`)
      .set('Authorization', `Bearer ${token}`); // toggle to completed

    const res = await request(app)
      .patch(`/api/tasks/${taskA}/start-timer`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  test('stopping a running timer creates a TimerSession and increases timeSpent', async () => {
    await request(app)
      .patch(`/api/tasks/${taskA}/start-timer`)
      .set('Authorization', `Bearer ${token}`);

    // small delay so elapsed time is > 0
    await new Promise((r) => setTimeout(r, 1100));

    const stopRes = await request(app)
      .patch(`/api/tasks/${taskA}/stop-timer`)
      .set('Authorization', `Bearer ${token}`);

    expect(stopRes.status).toBe(200);
    expect(stopRes.body.isRunning).toBe(false);
    expect(stopRes.body.timeSpent).toBeGreaterThan(0);

    const sessions = await TimerSession.find({ task: taskA });
    expect(sessions.length).toBe(1);
    expect(sessions[0].durationSeconds).toBeGreaterThan(0);
  });

  test('stopping a timer that is not running returns 400', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskA}/stop-timer`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  test('starting a timer on task B auto-stops task A and logs its session', async () => {
    await request(app)
      .patch(`/api/tasks/${taskA}/start-timer`)
      .set('Authorization', `Bearer ${token}`);

    await new Promise((r) => setTimeout(r, 1100));

    await request(app)
      .patch(`/api/tasks/${taskB}/start-timer`)
      .set('Authorization', `Bearer ${token}`);

    // task A should now be stopped, with a logged session
    const taskAState = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    const foundA = taskAState.body.find((t) => t._id === taskA);
    const foundB = taskAState.body.find((t) => t._id === taskB);

    expect(foundA.isRunning).toBe(false);
    expect(foundA.timeSpent).toBeGreaterThan(0);
    expect(foundB.isRunning).toBe(true);

    const sessionsForA = await TimerSession.find({ task: taskA });
    expect(sessionsForA.length).toBe(1);
  });

  test('deleting a task removes its TimerSession history', async () => {
    await request(app)
      .patch(`/api/tasks/${taskA}/start-timer`)
      .set('Authorization', `Bearer ${token}`);
    await new Promise((r) => setTimeout(r, 1100));
    await request(app)
      .patch(`/api/tasks/${taskA}/stop-timer`)
      .set('Authorization', `Bearer ${token}`);

    await request(app)
      .delete(`/api/tasks/${taskA}`)
      .set('Authorization', `Bearer ${token}`);

    const sessions = await TimerSession.find({ task: taskA });
    expect(sessions.length).toBe(0);
  });
});