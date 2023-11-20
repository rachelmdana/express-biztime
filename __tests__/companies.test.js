const request = require('supertest');
const app = require('../app');

describe('GET /companies', () => {
  test('should return a list of companies', async () => {
    const response = await request(app).get('/companies');
    console.log(response.statusCode);
    console.log(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('companies');
    expect(Array.isArray(response.body.companies)).toBe(true);
  });
});
