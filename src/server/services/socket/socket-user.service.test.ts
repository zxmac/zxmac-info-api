import request from 'supertest';
import app from '../../app';
import { env } from '@utils';

describe('GET /api/v1/socket/users/', () => { // Groups related tests
  it('should return a user object with status 200', async () => { // An individual test case
    const response = await request(app) // Use supertest with the imported app
      .get('/api/v1/socket/users/') // Specify the HTTP method and endpoint
      .set('key', env.API_LOCAL_KEY)
      .send(); // Assert the HTTP status code
    console.log('response', response);

    // Use Jest matchers for further assertions
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body?.length).toBeGreaterThan(0);
  });
});
