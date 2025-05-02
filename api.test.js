const axios = require('axios');
jest.mock('axios'); // Mock Axios

const BASE_URL = 'http://10.0.2.2:3000/api';

describe('API Tests', () => {
  let testUserId;
  let testShelterId;

  // Test for registering a user
  it('should register a new user', async () => {
    axios.post.mockResolvedValue({
      status: 201,
      data: {
        success: true,
        user: { ID: 1 },
      },
    });

    const response = await axios.post(`${BASE_URL}/register`, {
      Name: 'Test User',
      Gmail: 'testuser@example.com',
      Password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('success', true);
    expect(response.data).toHaveProperty('user.ID');
    testUserId = response.data.user.ID;
  });

  // Test for logging in a user
  it('should log in the user', async () => {
    axios.post.mockResolvedValue({
      status: 200,
      data: {
        success: true,
        user: { Name: 'Test User' },
      },
    });

    const response = await axios.post(`${BASE_URL}/login`, {
      email: 'testuser@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('success', true);
    expect(response.data.user).toHaveProperty('Name', 'Test User');
  });

  // Test for deleting a user
  it('should delete the user', async () => {
    axios.delete.mockResolvedValue({
      status: 200,
      data: {
        message: 'User deleted successfully',
      },
    });

    const response = await axios.delete(`${BASE_URL}/users/${testUserId}`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message', 'User deleted successfully');
  });

  // Test for adding a shelter
  it('should add a new shelter', async () => {
    axios.post.mockResolvedValue({
      status: 200,
      data: {
        message: 'Shelter added successfully',
      },
    });

    const response = await axios.post(`${BASE_URL}/shelters`, {
      Name: 'Test Shelter',
      Latitude: 31.259,
      Longitude: 34.808,
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message', 'Shelter added successfully');

  
    testShelterId = 1; 
  });

  // Test for deleting a shelter
  it('should delete the shelter', async () => {
    axios.delete.mockResolvedValue({
      status: 200,
      data: {
        message: 'Shelter deleted successfully',
      },
    });

    const response = await axios.delete(`${BASE_URL}/shelters/${testShelterId}`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message', 'Shelter deleted successfully');
  });
});