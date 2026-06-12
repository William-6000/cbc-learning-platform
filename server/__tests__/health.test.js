import request from 'supertest';
import { app } from '../src/app.js';

test('health endpoint identifies the CBC API', async () => {
  const response = await request(app).get('/api/health');
  expect(response.status).toBe(200);
  expect(response.body.service).toMatch(/CBC Senior School API/);
});
