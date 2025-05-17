import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import Shelters from '../screens/Shelters';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';

jest.mock('axios');
jest.spyOn(Alert, 'alert');

function renderWithNavigation(Component, { routeParams = {} } = {}) {
  const navigation = { navigate: jest.fn(), goBack: jest.fn(), replace: jest.fn() };
  const route = { params: routeParams };
  return render(
    <NavigationContainer>
      <Component navigation={navigation} route={route} />
    </NavigationContainer>
  );
}

describe('Sprint 2 Integration - Admin Add Shelter', () => {
  const newShelter = {
    name: 'Test Shelter',
    latitude: '32.070',
    longitude: '34.826'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('admin adds a new shelter to the database', async () => {
    // Mock GET shelters (initial fetch)
    axios.get.mockResolvedValueOnce({
      data: { shelters: [] }
    });
    // Mock POST add shelter
    axios.post.mockImplementation((url, data) => {
      if (url.includes('/api/shelters')) {
        if (
          data.Name === newShelter.name &&
          data.Latitude === parseFloat(newShelter.latitude) &&
          data.Longitude === parseFloat(newShelter.longitude)
        ) {
          return Promise.resolve({
            data: { message: 'Shelter added successfully' }
          });
        }
        return Promise.resolve({
          data: { message: 'Failed to add shelter' }
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
    // Mock GET shelters (after adding)
    axios.get.mockResolvedValueOnce({
      data: {
        shelters: [
          {
            ID: 1,
            Name: newShelter.name,
            Latitude: newShelter.latitude,
            Longitude: newShelter.longitude
          }
        ]
      }
    });

    const { getByText, getByPlaceholderText, queryByText } = renderWithNavigation(Shelters);

    // Open add prompt
    fireEvent.press(getByText(/add shelter/i));

    // Fill form
    fireEvent.changeText(getByPlaceholderText(/shelter name/i), newShelter.name);
    fireEvent.changeText(getByPlaceholderText(/latitude/i), newShelter.latitude);
    fireEvent.changeText(getByPlaceholderText(/longitude/i), newShelter.longitude);

    // Submit
    fireEvent.press(getByText(/^add$/i));

    // Expect success alert
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Shelter added successfully'
      )
    );

    // Expect new shelter to appear in the list
    await waitFor(() =>
      expect(queryByText(/test shelter/i)).toBeTruthy()
    );
  });
});