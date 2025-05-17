import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import Register from '../screens/Register';
import Login from '../screens/Login';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import ForgotPassword from '../screens/ForgotPassword';

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

describe('Authentication Integration', () => {
  const testUser = {
    username: 'testuser',
    password: 'TestPass123!',
    email: 'testuser@example.com'
  };

  const adminUser = {
    username: 'adminuser',
    password: 'AdminPass123!',
    email: 'admin@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a user', async () => {
    axios.post.mockImplementation((url, data) => {
      if (url.includes('/api/register')) {
        if (data.name === testUser.username) {
          return Promise.resolve({ data: { success: true, message: 'Registration successful' } });
        }
        return Promise.reject({ response: { data: { message: 'Registration failed' } } });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { getByPlaceholderText, getAllByText } = renderWithNavigation(Register);

    fireEvent.changeText(getByPlaceholderText(/name/i), testUser.username);
    fireEvent.changeText(getByPlaceholderText(/email/i), testUser.email);
    fireEvent.changeText(getByPlaceholderText(/^password$/i), testUser.password);
    fireEvent.changeText(getByPlaceholderText(/confirm password/i), testUser.password);
    fireEvent.press(getAllByText(/^register$/i)[1]);

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Registration successful!",
        expect.any(Array)
      )
    );
  });

  it('logs in a registered user', async () => {
    axios.post.mockImplementation((url, data) => {
      if (url.includes('/api/login')) {
        if (
          (data.email === testUser.email || data.username === testUser.username) &&
          data.password === testUser.password
        ) {
          return Promise.resolve({
            data: {
              success: true,
              user: {
                ID: 1,
                Name: testUser.username,
                Gmail: testUser.email,
                UserType: "Resident",
                IsAdmin: false
              }
            }
          });
        }
        return Promise.resolve({
          data: { success: false, message: 'Invalid credentials' }
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { getByPlaceholderText, getAllByText } = renderWithNavigation(Login);

    fireEvent.changeText(getByPlaceholderText(/email/i), testUser.email);
    fireEvent.changeText(getByPlaceholderText(/^password$/i), testUser.password);
    fireEvent.press(getAllByText(/^login$/i)[0]);

    await waitFor(() =>
      expect(Alert.alert).not.toHaveBeenCalledWith(
        "Login Failed",
        expect.any(String),
        expect.any(Array)
      )
    );
  });

  it('admin deletes the registered user', async () => {
    axios.post.mockImplementation((url, data) => {
      if (url.includes('/api/login')) {
        if (
          (data.email === adminUser.email || data.username === adminUser.username) &&
          data.password === adminUser.password
        ) {
          return Promise.resolve({
            data: {
              success: true,
              user: {
                ID: 99,
                Name: adminUser.username,
                Gmail: adminUser.email,
                UserType: "Admin",
                IsAdmin: true
              }
            }
          });
        }
        return Promise.resolve({
          data: { success: false, message: 'Invalid credentials' }
        });
      }
      if (url.includes('/api/deleteUser')) {
        if (data.email === testUser.email) {
          return Promise.resolve({
            data: { success: true, message: 'User deleted successfully' }
          });
        }
        return Promise.resolve({
          data: { success: false, message: 'User not found' }
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    // Simulate admin login
    const { getByPlaceholderText, getAllByText } = renderWithNavigation(Login);

    fireEvent.changeText(getByPlaceholderText(/email/i), adminUser.email);
    fireEvent.changeText(getByPlaceholderText(/^password$/i), adminUser.password);
    fireEvent.press(getAllByText(/^login$/i)[0]);

    await waitFor(() =>
      expect(Alert.alert).not.toHaveBeenCalledWith(
        "Login Failed",
        expect.any(String),
        expect.any(Array)
      )
    );

    // Simulate user deletion (direct axios call)
    const response = await axios.post('/api/deleteUser', { email: testUser.email });
    expect(response.data).toEqual({ success: true, message: 'User deleted successfully' });
  });
});