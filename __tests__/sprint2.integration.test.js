import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import Shelters from '../screens/Shelters';
import ShelterMapScreen from '../screens/ShelterMapScreen';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

jest.mock('axios');
jest.spyOn(Alert, 'alert');
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

function renderWithNavigation(Component, { routeParams = {} } = {}) {
  const navigation = { navigate: jest.fn(), goBack: jest.fn(), replace: jest.fn() };
  const route = { params: routeParams };
  return render(
    <NavigationContainer>
      <Component navigation={navigation} route={route} />
    </NavigationContainer>
  );
}

describe('Sprint 2 Integration - Complete Shelter Flow', () => {
  const newShelter = {
    name: 'Test Shelter',
    latitude: '32.070',
    longitude: '34.826'
  };

  const mockUserLocation = {
    coords: {
      latitude: 32.080,
      longitude: 34.830
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Geolocation.getCurrentPosition.mockImplementation(success => success(mockUserLocation));
    Geolocation.watchPosition.mockReturnValue(1);
  });

  it('completes full shelter flow: add, find route, and delete', async () => {
    // Mock initial shelters fetch
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/shelters')) {
        return Promise.resolve({
          data: {
            success: true,
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

    // Mock DELETE shelter
    axios.delete.mockResolvedValueOnce({
      data: { message: 'Shelter deleted successfully' }
    });

    // 1. Add Shelter
    const sheltersScreen = renderWithNavigation(Shelters);

    // Open add prompt
    fireEvent.press(sheltersScreen.getByText(/add shelter/i));

    // Fill form
    fireEvent.changeText(sheltersScreen.getByPlaceholderText(/shelter name/i), newShelter.name);
    fireEvent.changeText(sheltersScreen.getByPlaceholderText(/latitude/i), newShelter.latitude);
    fireEvent.changeText(sheltersScreen.getByPlaceholderText(/longitude/i), newShelter.longitude);

    // Submit
    fireEvent.press(sheltersScreen.getByText(/^add$/i));

    // Verify shelter was added
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Shelter added successfully'
      )
    );

    // 2. Test Finding Route to Shelter
    const mapScreen = renderWithNavigation(ShelterMapScreen);

    // Wait for shelters to load and verify initial state
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith('http://10.0.2.2:3000/api/shelters')
    );

    // Press the shelter marker
    const marker = mapScreen.getByTestId('marker-מקלט Test Shelter');
    fireEvent.press(marker);

    // Verify route info is displayed
    await waitFor(() => expect(mapScreen.getByText('מרחק: 1.2 ק"מ')).toBeTruthy());
    await waitFor(() => expect(mapScreen.getByText('זמן הליכה: 15 דקות')).toBeTruthy());

    // 3. Delete Shelter
    const sheltersScreen2 = renderWithNavigation(Shelters);
    
    // Wait for shelters to load
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith('http://10.0.2.2:3000/api/shelters')
    );

    // Press delete button
    fireEvent.press(sheltersScreen2.getByText('Delete'));

    // Verify shelter was deleted
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Shelter deleted successfully'
      )
    );

    // Verify shelter is removed from list
    await waitFor(() =>
      expect(sheltersScreen2.queryByText(newShelter.name)).toBeNull()
    );
  });
});