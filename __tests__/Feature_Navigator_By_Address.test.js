import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SettingsProvider } from '../contexts/SettingsContext';
import AddressShelterScreen from '../screens/AddressShelterScreen';
import axios from 'axios';
import { Alert, View, TextInput } from 'react-native';

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

// simulate the Alert module (mock)
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// simulate the translations module (mock)
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key, // Return the key itself instead of translated value
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
      hasLanguageSomeTranslations: () => true,
    },
  }),
}));

// simulate the navigation prop (mock)
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// simulate the route prop (mock)
const mockRoute = {
  params: {
    user: {
      Name: 'Test User',
      Gmail: 'test@example.com',
    },
  },
};

// simulate the AddressAutocomplete (mock)
jest.mock('../components/AddressAutocomplete', () => {
  const React = require('react');
  const { View, TextInput } = require('react-native');
  
  return function MockAddressAutocomplete({ onSelectAddress }) {
    return React.createElement(View, null,
      React.createElement(TextInput, {
        testID: "address-input",
        onChangeText: (text) => {
          if (text) {
            onSelectAddress({
              address: text,
              location: {
                latitude: 31.5,
                longitude: 34.7
              }
            });
          }
        }
      })
    );
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

// Helper function to render component with providers
const renderWithProviders = (component) => {
  return render(
    <NavigationContainer>
      <SettingsProvider>
        {component}
      </SettingsProvider>
    </NavigationContainer>
  );
};

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
    // Mock successful shelters response
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        shelters: [
          { ID: 1, Name: 'Test Shelter 1', Latitude: 31.5, Longitude: 34.7 }
        ]
      }
    });

    // Mock successful route response
    axios.get.mockResolvedValueOnce({
      data: {
        status: 'OK',
        routes: [{
          legs: [{
            distance: { text: '1.2 km', value: 1200 },
            duration: { text: '15 mins', value: 900 }
          }]
        }]
      }
    });

    const { getByTestId, getByText } = renderWithProviders(
      <AddressShelterScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Find and fill the address input - this will trigger address selection
    const addressInput = getByTestId('address-input');
    fireEvent.changeText(addressInput, '123 Test Street');

    // Wait for the component to process the address selection and fetch shelters
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://10.0.2.2:3000/api/shelters');
    }, { timeout: 3000 });

    // Wait for the component to fetch the route
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('http://10.0.2.2:3000/api/directions')
      );
    }, { timeout: 3000 });

    // Verify that route info is displayed
    await waitFor(() => {
      expect(getByText('מקלט Test Shelter 1')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('should handle API error gracefully', async () => {
    // Mock failed shelters response
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch shelters'));

    const { getByTestId } = renderWithProviders(
      <AddressShelterScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Find and fill the address input - this will trigger address selection
    const addressInput = getByTestId('address-input');
    fireEvent.changeText(addressInput, 'Invalid Address');

    // Verify error alert is shown
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to fetch shelters'
      );
    }, { timeout: 3000 });
  });
}); 