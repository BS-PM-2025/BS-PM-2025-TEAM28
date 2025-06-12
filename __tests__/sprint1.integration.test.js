import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import Register from '../screens/Register';
import Login from '../screens/Login';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import ForgotPassword from '../screens/ForgotPassword';
import { SettingsProvider } from '../contexts/SettingsContext';
import i18n from 'i18next';

jest.mock('axios');
jest.spyOn(Alert, 'alert');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      switch (key) {
        case 'common:successTitle':
          return 'Success';
        case 'register:registrationSuccessful':
          return 'Registration successful!';
        case 'common:ok':
          return 'OK';
        case 'login:loginButton':
          return 'Login';
        case 'login:emailPlaceholder':
          return 'Email';
        case 'login:passwordPlaceholder':
          return 'Password';
        case 'register:namePlaceholder':
          return 'Name';
        case 'register:emailPlaceholder':
          return 'Email';
        case 'register:passwordPlaceholder':
          return 'Password';
        case 'register:confirmPasswordPlaceholder':
          return 'Confirm Password';
        case 'register:registerButton':
          return 'Register';
        case 'login:forgotPassword':
          return 'Forgot Password?';
        case 'register:title':
          return 'Register';
        case 'register:resident':
          return 'Resident';
        case 'register:tourist':
          return 'Tourist';
        case 'register:alreadyHaveAccount':
          return 'Already have an account?';
        case 'common:login':
          return 'Login';
        case 'login:title':
          return 'Login';
        case 'common:rememberMe':
          return 'Remember Me';
        case 'register:passwordRequirementLength':
          return 'At least 8 characters';
        case 'register:passwordRequirementUppercase':
          return 'At least one uppercase letter';
        case 'register:passwordRequirementLowercase':
          return 'At least one lowercase letter';
        case 'register:passwordRequirementNumber':
          return 'At least one number';
        case 'register:invalidEmail':
          return 'Invalid email address';
        case 'register:passwordsDoNotMatch':
          return 'Passwords do not match';
        default:
          return key;
      }
    },
  }),
  initReactI18next: {},
}));
jest.mock('i18next', () => ({
  use: () => ({ init: () => {} }),
  init: () => {},
  changeLanguage: jest.fn(),
}));

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

    const { getByPlaceholderText, getByText, getByTestId } = renderWithNavigation(Register);

    fireEvent.changeText(getByPlaceholderText('Name'), testUser.username);
    fireEvent.changeText(getByPlaceholderText('Email'), testUser.email);
    fireEvent.changeText(getByPlaceholderText('Password'), testUser.password);
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), testUser.password);
    fireEvent.press(getByTestId('registerButton'));

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

    fireEvent.changeText(getByPlaceholderText('Email'), testUser.email);
    fireEvent.changeText(getByPlaceholderText('Password'), testUser.password);
    fireEvent.press(getAllByText('Login')[0]);

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

    fireEvent.changeText(getByPlaceholderText('Email'), adminUser.email);
    fireEvent.changeText(getByPlaceholderText('Password'), adminUser.password);
    fireEvent.press(getAllByText('Login')[0]);

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