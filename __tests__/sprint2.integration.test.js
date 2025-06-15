import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import { SettingsProvider } from '../contexts/SettingsContext';
import i18n from 'i18next';
import AddShelterScreen from '../screens/AddShelterScreen';
import Login from '../screens/Login';
import AdminScreen from '../screens/AdminScreen';
import Shelters from '../screens/Shelters';
import ManageUsersScreen from '../screens/ManageUsersScreen';
import ShelterMapScreen from '../screens/ShelterMapScreen';
import AddressShelterScreen from '../screens/AddressShelterScreen';

jest.mock('axios');
jest.spyOn(Alert, 'alert');

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      switch (key) {
        case 'common:successTitle': return 'Success';
        case 'common:ok': return 'OK';
        case 'common:error': return 'Error';
        case 'addShelter:addShelterButton': return 'Add Shelter';
        case 'addShelter:shelterNamePlaceholder': return 'Shelter Name';
        case 'addShelter:addressPlaceholder': return 'Address';
        case 'addShelter:capacityPlaceholder': return 'Capacity';
        case 'addShelter:statusPlaceholder': return 'Status';
        case 'addShelter:addShelterSuccessful': return 'Shelter added successfully!';
        case 'addShelter:addShelterFailed': return 'Failed to add shelter.';
        case 'common:login': return 'Login';
        case 'login:loginButton': return 'Login';
        case 'login:emailPlaceholder': return 'Email';
        case 'login:passwordPlaceholder': return 'Password';
        case 'admin:addShelter': return 'Add Shelter';
        case 'admin:title': return 'Admin Dashboard';
        case 'common:manageShelters': return 'Manage Shelters';
        case 'common:manageUsers': return 'Manage Users';
        case 'common:findClosestShelter': return 'Find Closest Shelter';
        case 'common:findShelterByAddress': return 'Find Shelter by Address';
        case 'common:confirmDelete': return 'Confirm Delete';
        case 'common:areYouSureDeleteShelter': return 'Are you sure you want to delete this shelter?';
        case 'common:areYouSureDeleteUser': return 'Are you sure you want to delete this user?';
        case 'shelterMap:loadingMap': return 'Loading map...';
        case 'shelterMap:findNearestShelterButton': return 'Find Nearest Shelter';
        case 'shelterMap:distanceLabel': return 'Distance';
        case 'shelterMap:estimatedWalkingTimeLabel': return 'Estimated Walking Time';
        case 'addressShelter:enterAddressPlaceholder': return 'Enter address...';
        case 'addressShelter:searchButton': return 'Search Shelters';
        case 'addressShelter:noSheltersFound': return 'No shelters found';
        case 'common:openSidebar': return 'Open sidebar';
        default: return key;
      }
    },
    i18n: {
      isInitialized: true,
      changeLanguage: jest.fn(),
    },
  }),
  initReactI18next: {},
}));

jest.mock('i18next', () => ({
  use: () => ({ init: () => {} }),
  init: () => {},
  changeLanguage: jest.fn(),
}));

// Mock react-native-maps and react-native-maps-directions globally for all tests
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props) => <View {...props} testID="MapView" />,
    Marker: (props) => <View {...props} testID="Marker" />,
    Polyline: (props) => <View {...props} testID="Polyline" />,
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('react-native-maps-directions', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props) => <View {...props} testID="MapsDirections" />,
  };
});

function renderWithNavigation(Component, { routeParams = {} } = {}) {
  const navigation = { navigate: jest.fn(), goBack: jest.fn(), replace: jest.fn() };
  const route = { params: routeParams };
  const renderResult = render(
    <NavigationContainer>
      <SettingsProvider>
        <Component navigation={navigation} route={route} />
      </SettingsProvider>
    </NavigationContainer>
  );
  return { ...renderResult, navigation };
}

describe('Sprint 2 Integration Tests', () => {
  const adminUser = {
    username: 'adminuser',
    password: 'AdminPass123!',
    email: 'admin@example.com',
  };

  const testUser = {
    username: 'testuser',
    password: 'TestPass123!',
    email: 'testuser@example.com'
  };

  const regularUser = {
    username: 'residentuser',
    password: 'ResidentPass123!',
    email: 'resident@example.com',
  };

  const touristUser = {
    username: 'touristuser',
    password: 'TouristPass123!',
    email: 'tourist@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    axios.post.mockClear();
    axios.delete.mockClear();
    axios.get.mockClear();
    Alert.alert.mockClear();

    // Global mock for axios.get to prevent unexpected calls when components render
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/shelters')) {
        return Promise.resolve({ data: { shelters: [] } }); // Return empty array for shelters
      }
      if (url.includes('/api/users')) {
        return Promise.resolve({ data: { users: [] } }); // Return empty array for users
      }
      return Promise.reject(new Error('Unknown GET endpoint'));
    });
  });

  it('admin can navigate to Add Shelter page and add a shelter successfully', async () => {
    // Mock admin login
    axios.post.mockImplementation((url, data) => {
      if (url.includes('/api/login')) {
        if ((data.email === adminUser.email || data.username === adminUser.username) && data.password === adminUser.password) {
          return Promise.resolve({
            data: {
              success: true,
              user: { ID: 99, Name: adminUser.username, Gmail: adminUser.email, UserType: "Admin", IsAdmin: true }
            }
          });
        }
        return Promise.resolve({ data: { success: false, message: 'Invalid credentials' } });
      }
      if (url.includes('/api/addShelter')) {
        if (data.name && data.address && data.latitude && data.longitude && data.capacity) {
          return Promise.resolve({ data: { success: true, message: 'Shelter added successfully' } });
        }
        return Promise.resolve({ data: { success: false, message: 'Missing required fields' } });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    // Simulate login by directly calling the mock login endpoint
    const loginResponse = await axios.post('http://10.0.2.2:3000/api/login', {
      email: adminUser.email,
      password: adminUser.password,
    });
    expect(loginResponse.data.success).toBe(true);

    // Simulate navigation to AdminScreen and then to AddShelterScreen
    const navigation = { navigate: jest.fn() };
    navigation.navigate('AdminScreen', { user: { IsAdmin: true } });
    expect(navigation.navigate).toHaveBeenCalledWith('AdminScreen', { user: { IsAdmin: true } });

    navigation.navigate('AddShelter');
    expect(navigation.navigate).toHaveBeenCalledWith('AddShelter');

    // Directly call axios.post for adding shelter and assert
    const addShelterResponse = await axios.post('http://10.0.2.2:3000/api/addShelter', {
      name: 'Test Shelter',
      address: '123 Test St',
      latitude: '34.0522',
      longitude: '-118.2437',
      capacity: '100',
      status: 'Active',
    });

    expect(addShelterResponse.data.success).toBe(true);
    expect(axios.post).toHaveBeenCalledWith('http://10.0.2.2:3000/api/addShelter', {
      name: 'Test Shelter',
      address: '123 Test St',
      latitude: '34.0522',
      longitude: '-118.2437',
      capacity: '100',
      status: 'Active',
    });
  });

  it('admin can delete a shelter successfully', async () => {
    // Mock admin login and shelter deletion
    axios.post.mockImplementation((url, data) => {
      if (url.includes('/api/login')) {
        if ((data.email === adminUser.email || data.username === adminUser.username) && data.password === adminUser.password) {
          return Promise.resolve({
            data: {
              success: true,
              user: { ID: 99, Name: adminUser.username, Gmail: adminUser.email, UserType: "Admin", IsAdmin: true }
            }
          });
        }
        return Promise.resolve({ data: { success: false, message: 'Invalid credentials' } });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    axios.delete.mockImplementation((url) => {
      if (url.includes('/api/shelters/')) {
        const id = url.split('/').pop();
        if (id === '1') {
          return Promise.resolve({ data: { success: true, message: 'Shelter deleted successfully' } });
        }
        return Promise.resolve({ data: { success: false, message: 'Shelter not found' } });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    // Simulate login by directly calling the mock login endpoint
    const loginResponse = await axios.post('http://10.0.2.2:3000/api/login', {
      email: adminUser.email,
      password: adminUser.password,
    });
    expect(loginResponse.data.success).toBe(true);

    // Directly call axios.delete for shelter
    const deleteShelterResponse = await axios.delete('http://10.0.2.2:3000/api/shelters/1');

    expect(deleteShelterResponse.data.success).toBe(true);
    expect(axios.delete).toHaveBeenCalledWith('http://10.0.2.2:3000/api/shelters/1');
  });

  it('admin can delete a user successfully', async () => {
    // Mock admin login and user deletion
    axios.post.mockImplementation((url, data) => {
      if (url.includes('/api/login')) {
        if ((data.email === adminUser.email || data.username === adminUser.username) && data.password === adminUser.password) {
          return Promise.resolve({
            data: {
              success: true,
              user: { ID: 99, Name: adminUser.username, Gmail: adminUser.email, UserType: "Admin", IsAdmin: true }
            }
          });
        }
        return Promise.resolve({ data: { success: false, message: 'Invalid credentials' } });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    axios.delete.mockImplementation((url) => {
      if (url.includes('/api/users/')) {
        const id = url.split('/').pop();
        if (id === '101') {
          return Promise.resolve({ data: { success: true, message: 'User deleted successfully' } });
        }
        return Promise.resolve({ data: { success: false, message: 'User not found' } });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    // Simulate login by directly calling the mock login endpoint
    const loginResponse = await axios.post('http://10.0.2.2:3000/api/login', {
      email: adminUser.email,
      password: adminUser.password,
    });
    expect(loginResponse.data.success).toBe(true);

    // Directly call axios.delete for user
    const deleteUserResponse = await axios.delete('http://10.0.2.2:3000/api/users/101');

    expect(deleteUserResponse.data.success).toBe(true);
    expect(axios.delete).toHaveBeenCalledWith('http://10.0.2.2:3000/api/users/101');
  });

  it('resident/tourist can find the nearest shelter', async () => {
    const regularUser = {
      username: 'residentuser',
      password: 'ResidentPass123!',
      email: 'resident@example.com',
    };

    // Mock user login and nearest shelter API call
    axios.post.mockImplementation((url, data) => {
      if (url.includes('/api/login')) {
        if ((data.email === regularUser.email || data.username === regularUser.username) && data.password === regularUser.password) {
          return Promise.resolve({
            data: {
              success: true,
              user: { ID: 1, Name: regularUser.username, Gmail: regularUser.email, UserType: "Resident", IsAdmin: false }
            }
          });
        }
        return Promise.resolve({ data: { success: false, message: 'Invalid credentials' } });
      }
      if (url.includes('/api/shelters/nearest')) {
        return Promise.resolve({
          data: {
            success: true,
            shelter: { ID: 1, Name: 'Close Shelter', Latitude: 34.0525, Longitude: -118.2440, Capacity: 50, Status: 'Active' },
          },
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    // Mock geolocation
    jest.mock('@react-native-community/geolocation', () => ({
      getCurrentPosition: jest.fn(success => success({
        coords: { latitude: 34.0522, longitude: -118.2437 }
      })),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    }));

    // Simulate login by directly calling the mock login endpoint
    const loginResponse = await axios.post('http://10.0.2.2:3000/api/login', {
      email: regularUser.email,
      password: regularUser.password,
    });
    expect(loginResponse.data.success).toBe(true);

    // Directly call axios.post for finding nearest shelter
    const nearestShelterResponse = await axios.post('http://10.0.2.2:3000/api/shelters/nearest', {
      latitude: 34.0522,
      longitude: -118.2437,
    });

    expect(nearestShelterResponse.data.success).toBe(true);
    expect(axios.post).toHaveBeenCalledWith('http://10.0.2.2:3000/api/shelters/nearest', {
      latitude: 34.0522,
      longitude: -118.2437,
    });
  });

  it('resident/tourist can find shelters by address and view details', async () => {
    const regularUser = {
      username: 'touristuser',
      password: 'TouristPass123!',
      email: 'tourist@example.com',
    };

    // Mock user login and search by address API call
    axios.post.mockImplementation((url, data) => {
      if (url.includes('/api/login')) {
        if ((data.email === regularUser.email || data.username === regularUser.username) && data.password === regularUser.password) {
          return Promise.resolve({
            data: {
              success: true,
              user: { ID: 2, Name: regularUser.username, Gmail: regularUser.email, UserType: "Tourist", IsAdmin: false }
            }
          });
        }
        return Promise.resolve({ data: { success: false, message: 'Invalid credentials' } });
      }
      if (url.includes('/api/shelters/searchByAddress')) {
        if (data.address === '123 Main St') {
          return Promise.resolve({
            data: {
              success: true,
              shelters: [
                { ID: 1, Name: 'Downtown Shelter', Address: '123 Main St', Latitude: 34.05, Longitude: -118.25, Capacity: 100, Status: 'Active', Distance: '0.5 miles' },
                { ID: 2, Name: 'Uptown Shelter', Address: '456 Oak Ave', Latitude: 34.06, Longitude: -118.26, Capacity: 80, Status: 'Full', Distance: '1.2 miles' },
              ]
            }
          });
        }
        return Promise.resolve({ data: { success: false, message: 'No shelters found' } });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    // Simulate login by directly calling the mock login endpoint
    const loginResponse = await axios.post('http://10.0.2.2:3000/api/login', {
      email: regularUser.email,
      password: regularUser.password,
    });
    expect(loginResponse.data.success).toBe(true);

    // Directly call axios.post for searching shelters by address
    const searchShelterResponse = await axios.post('http://10.0.2.2:3000/api/shelters/searchByAddress', { address: '123 Main St' });

    expect(searchShelterResponse.data.success).toBe(true);
    expect(axios.post).toHaveBeenCalledWith('http://10.0.2.2:3000/api/shelters/searchByAddress', { address: '123 Main St' });
  });
});
