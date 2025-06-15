import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SettingsProvider } from '../contexts/SettingsContext';
import ShelterMapScreen from '../screens/ShelterMapScreen';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import { Alert } from 'react-native';

jest.mock('axios');
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn()
}));
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View, TouchableOpacity, Text } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Marker: ({ onPress, title }) =>
      React.createElement(
        TouchableOpacity,
        { testID: `marker-${title}`, onPress },
        React.createElement(Text, {}, title)
      ),
    Polyline: View,
    PROVIDER_GOOGLE: 'google'
  };
});
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock translations
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key, 
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
      hasLanguageSomeTranslations: () => true,
    },
  }),
}));

// Mock navigation
const mockNavigation = {
  goBack: jest.fn(),
};

// Mock route
const mockRoute = {
  params: {
    user: {
      Name: 'Test User',
      Gmail: 'test@example.com',
    },
  },
};

const mockPosition = { coords: { latitude: 31.26, longitude: 34.7693 } };

beforeEach(() => {
  jest.clearAllMocks();
  Geolocation.getCurrentPosition.mockImplementation(success => success(mockPosition));
  Geolocation.watchPosition.mockReturnValue(1);
  axios.get.mockImplementation(url => {
    if (url.includes('/api/shelters')) {
      return Promise.resolve({
        data: {
          success: true,
          shelters: [
            { ID: 1, Name: 'Test Shelter', Latitude: '31.26', Longitude: '34.7693' }
          ]
        }
      });
    }
    if (url.includes('/api/directions')) {
      return Promise.resolve({
        data: {
          success: true,
          route: {
            status: 'OK',
            routes: [
              {
                overview_polyline: { points: 'test_points' },
                legs: [
                  { distance: { text: '1.2 km' }, duration: { text: '15 mins' } }
                ]
              }
            ]
          }
        }
      });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  });
});

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

describe('ShelterMapScreen', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock successful shelter fetch
    axios.get.mockResolvedValue({
      data: {
        success: true,
        shelters: [
          { ID: 1, Name: 'Test Shelter 1', Latitude: 31.5, Longitude: 34.7 },
          { ID: 2, Name: 'Test Shelter 2', Latitude: 31.6, Longitude: 34.8 },
        ],
      },
    });
  });

  it('fetches shelters on mount', async () => {
    renderWithProviders(
      <ShelterMapScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Verify that shelters were fetched
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://10.0.2.2:3000/api/shelters');
    });
  });

  it('pressing marker fetches route and displays info', async () => {
    // Mock successful route fetch
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/shelters')) {
        return Promise.resolve({
          data: {
            success: true,
            shelters: [
              { ID: 1, Name: 'Test Shelter 1', Latitude: 31.5, Longitude: 34.7 },
            ],
          },
        });
      }
      if (url.includes('/api/directions')) {
        return Promise.resolve({
          data: {
            success: true,
            route: {
              status: 'OK',
              routes: [{
                overview_polyline: { points: '_p~iF~ps|U_ulLnnqC_mqNvxq`@' }, // Valid polyline points
                legs: [{
                  distance: { text: '1.2 km', value: 1200 },
                  duration: { text: '5 mins', value: 300 }
                }]
              }]
            }
          },
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    const { getByTestId, getByText } = renderWithProviders(
      <ShelterMapScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Wait for shelters to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://10.0.2.2:3000/api/shelters');
    });

    // Simulate pressing a marker using the actual test ID format
    const marker = getByTestId('marker-מקלט Test Shelter 1');
    fireEvent.press(marker);

    // Verify route was fetched with the full URL
    await waitFor(() => {
      const calls = axios.get.mock.calls;
      const directionsCall = calls.find(call => 
        call[0].includes('/api/directions') && 
        call[0].includes('origin=31.26,34.7693') && 
        call[0].includes('destination=31.5,34.7')
      );
      expect(directionsCall).toBeTruthy();
    });

    // Verify distance and duration are displayed using the actual text content
    await waitFor(() => {
      // The distance text should contain both the label and the value
      expect(getByText(/shelterMap:distanceLabel/)).toBeTruthy();
      expect(getByText(/shelterMap:estimatedWalkingTimeLabel/)).toBeTruthy();
    });
  });

  it('finds and displays the closest shelter to the user location', async () => {
    // Mock user location
    const userLocation = { coords: { latitude: 31.26, longitude: 34.7693 } };
    Geolocation.getCurrentPosition.mockImplementation(success => success(userLocation));

    // Mock multiple shelters
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/shelters')) {
        return Promise.resolve({
          data: {
            success: true,
            shelters: [
              { ID: 1, Name: 'Test Shelter 1', Latitude: 31.26, Longitude: 34.7693 }, // Closest
              { ID: 2, Name: 'Test Shelter 2', Latitude: 32.0, Longitude: 35.0 }
            ],
          },
        });
      }
      if (url.includes('/api/directions')) {
        return Promise.resolve({
          data: {
            success: true,
            route: {
              status: 'OK',
              routes: [{
                overview_polyline: { points: '_p~iF~ps|U_ulLnnqC_mqNvxq`@' },
                legs: [{
                  distance: { text: '0.1 km', value: 100 },
                  duration: { text: '1 min', value: 60 }
                }]
              }]
            }
          },
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    const { getByTestId, getByText } = renderWithProviders(
      <ShelterMapScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Wait for shelters to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://10.0.2.2:3000/api/shelters');
    });

    // Simulate pressing the marker for the closest shelter
    const marker = getByTestId('marker-מקלט Test Shelter 1');
    fireEvent.press(marker);

    // Verify route was fetched to the closest shelter
    await waitFor(() => {
      const calls = axios.get.mock.calls;
      const directionsCall = calls.find(call =>
        call[0].includes('/api/directions') &&
        call[0].includes('origin=31.26,34.7693') &&
        call[0].includes('destination=31.26,34.7693')
      );
      expect(directionsCall).toBeTruthy();
    });

    // Verify distance and duration are displayed
    await waitFor(() => {
      expect(getByText(/shelterMap:distanceLabel/)).toBeTruthy();
      expect(getByText(/shelterMap:estimatedWalkingTimeLabel/)).toBeTruthy();
    });
  });

  it('handles shelters fetch error', async () => {
    // Mock failed shelter fetch
    axios.get.mockRejectedValue(new Error('Network error'));

    renderWithProviders(
      <ShelterMapScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Verify error alert is shown with the translation key
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'common:error',
        'shelterReport:failedToLoadShelters'
      );
    });
  });
});