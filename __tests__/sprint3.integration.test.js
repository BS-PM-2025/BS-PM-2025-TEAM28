jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
}));
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AdminScreen from '../screens/AdminScreen';
import AccountScreen from '../screens/AccountScreen';
import Settings from '../screens/Settings';
import ShelterReportScreen from '../screens/ShelterReportScreen';
import AddressShelterScreen from '../screens/AddressShelterScreen';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import axios from 'axios';
import { SettingsProvider } from '../contexts/SettingsContext';

jest.mock('axios');
jest.spyOn(Alert, 'alert');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
  initReactI18next: {},
}));
jest.mock('i18next', () => ({
  use: () => ({ init: () => {} }),
  init: () => {},
  changeLanguage: jest.fn(),
}));

function renderWithNavigation(Component, { routeParams = {}, userType = 'Resident' } = {}) {
  const navigation = { navigate: jest.fn(), goBack: jest.fn(), replace: jest.fn() };
  const user = {
    ID: 1,
    Name: userType + 'User',
    Gmail: userType.toLowerCase() + '@example.com',
    UserType: userType,
    IsAdmin: userType === 'Admin'
  };
  const route = { params: { ...routeParams, user } };
  return render(
    <NavigationContainer>
      <SettingsProvider>
        <Component navigation={navigation} route={route} />
      </SettingsProvider>
    </NavigationContainer>
  );
}

// Add more integration tests based on the existing structure and common user flows

describe('Sprint 3 Integration - Additional', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Admin', () => {
        it('renders admin controls', () => {
            const { getByText } = renderWithNavigation(AdminScreen, { userType: 'Admin' });
            expect(getByText(/admin:adminControls/i)).toBeTruthy();
            expect(getByText(/common:manageShelters/i)).toBeTruthy();
            expect(getByText(/common:manageUsers/i)).toBeTruthy();
        });

        it('shows welcome message for admin', () => {
            const { getByText } = renderWithNavigation(AdminScreen, { userType: 'Admin' });
            expect(getByText(/admin:welcome/i)).toBeTruthy();
        });
    });

    describe('Resident', () => {
        it('renders settings sections', () => {
            const { getByText } = renderWithNavigation(Settings, { userType: 'Resident' });
            expect(getByText(/settings:account/i)).toBeTruthy();
            expect(getByText(/settings:appPreferences/i)).toBeTruthy();
            expect(getByText(/settings:language/i)).toBeTruthy();
            expect(getByText(/settings:mapSettings/i)).toBeTruthy();
        });

        it('shows language options', () => {
            const { getByText } = renderWithNavigation(Settings, { userType: 'Resident' });
            fireEvent.press(getByText(/language/i));
            expect(getByText(/עברית/i)).toBeTruthy();
            expect(getByText(/English/i)).toBeTruthy();
        });

        it('shows map type options', () => {
            const { getByText } = renderWithNavigation(Settings, { userType: 'Resident' });
            expect(getByText(/settings:standardMap/i)).toBeTruthy();
            expect(getByText(/settings:satelliteMap/i)).toBeTruthy();
        });
    });

    describe('Tourist', () => {
        it('renders address input for shelter search', () => {
            const { getByPlaceholderText } = renderWithNavigation(AddressShelterScreen, { userType: 'Tourist' });
            expect(getByPlaceholderText(/address/i)).toBeTruthy();
        });


        it('shows notification toggle', () => {
            const { getByText } = renderWithNavigation(Settings, { userType: 'Tourist' });
            expect(getByText(/settings:notifications/i)).toBeTruthy();
        });
    });

    describe('General', () => {
        it('renders SettingsProvider context', () => {
            const { getByText } = renderWithNavigation(Settings, { userType: 'Resident' });
            expect(getByText(/settings:title/i)).toBeTruthy();
        });


    });
});
