process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = '*';

process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgres://tasknotes:tasknotes_password@localhost:5432/tasknotes_test';

const request = require('supertest');
const { app, pool, initDb } = require('../src/app');

beforeAll(async () => {
  await initDb();
});

beforeEach(async () => {
  await pool.query('TRUNCATE TABLE tasks RESTART IDENTITY');
});

afterAll(async () => {
  await pool.end();
});

describe('Student Study Planner API', () => {
  test('GET /health returns database status', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.database).toBe('connected');
  });

  test('POST /api/tasks creates a task', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Prepare AI exam',
        description: 'Study neural networks',
        subject: 'Artificial Intelligence',
        taskType: 'exam',
        priority: 'high',
        deadline: '2027-03-15',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe('Prepare AI exam');
    expect(response.body.taskType).toBe('exam');
    expect(response.body.priority).toBe('high');
  });

  test('POST /api/tasks rejects an empty title', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        title: '',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Title is required');
  });

  test('GET /api/tasks returns created tasks', async () => {
    await request(app)
      .post('/api/tasks')
      .send({
        title: 'Docker practice',
        subject: 'Cloud Computing',
        taskType: 'assignment',
      });

    const response = await request(app).get('/api/tasks');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Docker practice');
  });

  test('PATCH /api/tasks/:id/toggle completes a task', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Learn Kubernetes',
      });

    const response = await request(app)
      .patch(`/api/tasks/${created.body.id}/toggle`);

    expect(response.statusCode).toBe(200);
    expect(response.body.completed).toBe(true);
  });

  test('DELETE /api/tasks/:id deletes a task', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Temporary task',
      });

    const response = await request(app)
      .delete(`/api/tasks/${created.body.id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Task deleted');

    const tasks = await request(app).get('/api/tasks');

    expect(tasks.body).toHaveLength(0);
  });

  test('GET unknown route returns 404', async () => {
  const response = await request(app).get('/api/unknown');

  expect(response.statusCode).toBe(404);
  expect(response.body.message).toBe('Route not found');
  });

  test('PATCH nonexistent task returns 404', async () => {
  const response = await request(app)
    .patch('/api/tasks/999999/toggle');

  expect(response.statusCode).toBe(404);
  expect(response.body.message).toBe('Task not found');
  });

  test('DELETE nonexistent task returns 404', async () => {
  const response = await request(app)
    .delete('/api/tasks/999999');

  expect(response.statusCode).toBe(404);
  expect(response.body.message).toBe('Task not found');
  });

});