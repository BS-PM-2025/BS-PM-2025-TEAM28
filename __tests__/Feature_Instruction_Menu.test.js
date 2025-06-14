import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AccountScreen from '../screens/AccountScreen';
import { useTranslation } from 'react-i18next';
import { NavigationContainer } from '@react-navigation/native';
import { SettingsProvider } from '../contexts/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';

// Mock i18next
jest.mock('i18next', () => ({
  init: jest.fn(),
  use: jest.fn(),
  changeLanguage: jest.fn(),
  language: 'en',
  t: (key) => key,
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'common:noShelterNearby': 'No Shelter Nearby?',
        'common:emergencyNumbers': 'Emergency Numbers',
        'common:firstAid': 'First Aid',
        'common:noShelterTitle': 'No Shelter Nearby? Follow These Steps:',
        'common:emergencyNumbersTitle': 'Emergency Numbers',
        'common:firstAidTitle': 'First Aid',
        'common:close': 'Close',
        'common:noShelterContent': 'Test no shelter content',
        'common:emergencyNumbersContent': 'Test emergency numbers content',
        'common:firstAidContent': 'Test first aid content',
        'account:title': 'Account',
        'account:welcome': 'Welcome',
        'account:accountInfo': 'Account Information',
        'common:email': 'Email',
        'common:userType': 'User Type',
        'common:findClosestShelter': 'Find Closest Shelter',
        'common:findShelterByAddress': 'Find Shelter by Address',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
}));

// Mock the navigation prop
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock the route params
const mockRoute = {
  params: {
    user: {
      ID: 1,
      Name: 'Test User',
      Gmail: 'test@example.com',
      UserType: 'Resident',
    },
  },
};

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

describe('Instruction Menu Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock AsyncStorage getItem to return null for all keys
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  const openSidebar = async (getByTestId) => {
    // Find and press the menu button to open sidebar
    const menuButton = getByTestId('menu-button');
    fireEvent.press(menuButton);
    // Wait for sidebar animation
    await waitFor(() => {
      expect(getByTestId('sidebar')).toBeTruthy();
    });
  };

  it('should open and display No Shelter Nearby modal', async () => {
    const { getByText, getByTestId, queryByText } = renderWithProviders(
      <AccountScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Open sidebar first
    await openSidebar(getByTestId);

    // Find and press the No Shelter Nearby button
    const menuButton = getByText('No Shelter Nearby?');
    fireEvent.press(menuButton);

    // Wait for modal to appear
    await waitFor(() => {
      expect(queryByText('No Shelter Nearby? Follow These Steps:')).toBeTruthy();
      expect(queryByText('Test no shelter content')).toBeTruthy();
    });

    // Close modal
    const closeButton = getByText('Close');
    fireEvent.press(closeButton);

    // Verify modal is closed
    await waitFor(() => {
      expect(queryByText('No Shelter Nearby? Follow These Steps:')).toBeNull();
    });
  });

  it('should open and display Emergency Numbers modal', async () => {
    const { getByText, getByTestId, queryByText } = renderWithProviders(
      <AccountScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Open sidebar first
    await openSidebar(getByTestId);

    // Find and press the Emergency Numbers button
    const menuButton = getByText('Emergency Numbers');
    fireEvent.press(menuButton);

    // Wait for modal to appear
    await waitFor(() => {
      expect(queryByText('Emergency Numbers')).toBeTruthy();
      expect(queryByText('Test emergency numbers content')).toBeTruthy();
    });

    // Close modal
    const closeButton = getByText('Close');
    fireEvent.press(closeButton);

    // Verify modal is closed
    await waitFor(() => {
      expect(queryByText('Emergency Numbers')).toBeNull();
    });
  });

  it('should open and display First Aid modal', async () => {
    const { getByText, getByTestId, queryByText } = renderWithProviders(
      <AccountScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Open sidebar first
    await openSidebar(getByTestId);

    // Find and press the First Aid button
    const menuButton = getByText('First Aid');
    fireEvent.press(menuButton);

    // Wait for modal to appear
    await waitFor(() => {
      expect(queryByText('First Aid')).toBeTruthy();
      expect(queryByText('Test first aid content')).toBeTruthy();
    });

    // Close modal
    const closeButton = getByText('Close');
    fireEvent.press(closeButton);

    // Verify modal is closed
    await waitFor(() => {
      expect(queryByText('First Aid')).toBeNull();
    });
  });
});
