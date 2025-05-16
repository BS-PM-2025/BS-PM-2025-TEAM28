import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import ShelterMapScreen from '../screens/ShelterMapScreen';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';

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

describe('ShelterMapScreen', () => {
  it('fetches shelters on mount', async () => {
    render(<ShelterMapScreen />);
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith('http://10.0.2.2:3000/api/shelters')
    );
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('pressing marker fetches route and displays info', async () => {
    const { getByTestId, getByText } = render(<ShelterMapScreen />);
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith('http://10.0.2.2:3000/api/shelters')
    );
    axios.get.mockClear();
    axios.get.mockImplementation(url => {
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
    fireEvent.press(getByTestId('marker-מקלט Test Shelter'));
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/directions'))
    );
    await waitFor(() => expect(getByText('מרחק: 1.2 ק"מ')).toBeTruthy());
    await waitFor(() => expect(getByText('זמן הליכה: 15 דקות')).toBeTruthy());
  });

  it('handles shelters fetch error', async () => {
    axios.get.mockRejectedValueOnce(new Error('Shelter Error'));
    const { getByText } = render(<ShelterMapScreen />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => expect(getByText(/שגיאה:/)).toBeTruthy());
  });
});
