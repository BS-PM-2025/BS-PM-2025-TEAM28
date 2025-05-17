import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddressShelterScreen from '../screens/AddressShelterScreen';
import axios from 'axios';

// mute console errors
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Error:')) return;
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// simulate the axios module (mock)
jest.mock('axios');

// simulate the navigation prop (mock)
const mockNavigation = {
  navigate: jest.fn(),
};

// simulate the AddressAutocomplete (mock)
jest.mock('../components/AddressAutocomplete', () => {
  return {
    __esModule: true,
    default: ({ onSelectAddress }) => (
      <input
        testID="address-input"
        onChangeText={(text) => {
          if (text === 'Test Address') {
            onSelectAddress({
              address: 'Test Address',
              location: {
                latitude: 31.2600,
                longitude: 34.7693,
              },
            });
          }
        }}
      />
    ),
  };
});

// simulate react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Marker: View,
    PROVIDER_GOOGLE: 'google',
    Polyline: View,
  };
});

// simulate geolocation
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
}));

describe('AddressShelterScreen', () => {
  beforeEach(() => {
    // clear all simulates before each test
    jest.clearAllMocks();
    
    // simulate successful API response for shelters
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/shelters')) {
        return Promise.resolve({
          data: {
            success: true,
            shelters: [
              {
                ID: 1,
                Name: 'Test Shelter',
                Latitude: '31.2600',
                Longitude: '34.7693',
              },
            ],
          },
        });
      } else if (url.includes('/api/directions')) {
        return Promise.resolve({
          data: {
            success: true,
            route: {
              status: 'OK',
              routes: [{
                overview_polyline: {
                  points: 'test_points'
                },
                legs: [{
                  distance: { text: '1.2 km' },
                  duration: { text: '15 mins' }
                }]
              }]
            }
          }
        });
      }
      return Promise.reject(new Error('Unknown API endpoint'));
    });
  });

  it('should handle address selection correctly', async () => {
    const { getByTestId } = render(
      <AddressShelterScreen navigation={mockNavigation} />
    );

    const addressInput = getByTestId('address-input');

    fireEvent.changeText(addressInput, 'Test Address');

    // wait for the API calls to complete and state updates
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://10.0.2.2:3000/api/shelters');
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/directions'));
    });

    // verify that both API calls was made
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('should handle API error gracefully', async () => {
    // replicate API error for both endpoints
    axios.get.mockRejectedValue(new Error('API Error'));

    const { getByTestId } = render(
      <AddressShelterScreen navigation={mockNavigation} />
    );

    const addressInput = getByTestId('address-input');
    fireEvent.changeText(addressInput, 'Test Address');

    // wait for the error handling
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // verify that the API was called at least once
    expect(axios.get).toHaveBeenCalled();
  });
}); 