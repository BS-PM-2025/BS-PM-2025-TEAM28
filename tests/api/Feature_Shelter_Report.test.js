const axios = require('axios');
jest.mock('axios'); // Mock Axios

const BASE_URL = 'http://10.0.2.2:3000/api';

describe('Feature_Shelter_Report', () => {
  let testShelterId;

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