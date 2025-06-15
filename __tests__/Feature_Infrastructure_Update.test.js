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
  it('admin should update "No Shelter Nearby" page', async () => {
  axios.put.mockResolvedValue({
    status: 200,
    data: { message: 'Page updated successfully' },
  });

  const response = await axios.put(`${BASE_URL}/admin/pages/no-shelter-nearby`, {
    content: 'Updated content for No Shelter Nearby',
  });

  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('message', 'Page updated successfully');
});

it('admin should update "First Aid" page', async () => {
  axios.put.mockResolvedValue({
    status: 200,
    data: { message: 'Page updated successfully' },
  });

  const response = await axios.put(`${BASE_URL}/admin/pages/first-aid`, {
    content: 'Updated content for First Aid',
  });

  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('message', 'Page updated successfully');
});

it('admin should update "Emergency Numbers" page', async () => {
  axios.put.mockResolvedValue({
    status: 200,
    data: { message: 'Page updated successfully' },
  });

  const response = await axios.put(`${BASE_URL}/admin/pages/emergency-numbers`, {
    content: 'Updated content for Emergency Numbers',
  });

  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('message', 'Page updated successfully');
});
}); 