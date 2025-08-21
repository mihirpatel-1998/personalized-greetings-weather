const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Location = require('../src/models/location.model');

// ✅ Mock AWS SDK
jest.mock('aws-sdk', () => {
  const mockInvoke = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      StatusCode: 200,
      Payload: JSON.stringify({ message: 'Mocked Lambda success' })
    })
  });

  return {
    Lambda: jest.fn(() => ({
      invoke: mockInvoke
    }))
  };
});

let mongoServer;

jest.setTimeout(20000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Location.deleteMany({});
});

describe('Location API', () => {
  it('should create a location', async () => {
    const res = await request(app)
      .post('/api/v1/locations')
      .send({
        name: 'New York',
        latitude: 40.7128,
        longitude: -74.006
      });

    console.log('Response:', res.body); // Debugging

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Location created successfully');

    // Optional DB validation
    const loc = await Location.findOne({ name: 'New York' });
    expect(loc).not.toBeNull();
    expect(loc.latitude).toBe(40.7128);
  });

  it('should fail if latitude is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/locations')
      .send({
        name: 'Invalid City',
        latitude: -100,
        longitude: 50
      });

    console.log('Response:', res.body); // Debugging

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toMatch(/Validation error/);
  });
});
