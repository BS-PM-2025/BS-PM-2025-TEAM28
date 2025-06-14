// Mock the Picker module BEFORE any imports
jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');

  // Create a proper Picker component with Item as a static property
  const Picker = ({ selectedValue, onValueChange, children, testID, style, dropdownIconColor }) => {
    const items = React.Children.toArray(children);
    const selectedItem = items.find(item => item.props.value === selectedValue);
    
    return (
      <View testID={testID} style={style}>
        <TouchableOpacity
          onPress={() => {
            const firstNonEmptyItem = items.find(item => item.props.value !== '');
            if (firstNonEmptyItem) {
              onValueChange(firstNonEmptyItem.props.value);
            }
          }}
        >
          <Text style={{ color: dropdownIconColor }}>
            {selectedItem?.props?.label || 'Select a shelter...'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Define Item as a static property BEFORE returning the Picker
  Picker.Item = ({ label, value, color }) => {
    // Return a simple object that will be used by the parent Picker
    return { label, value, color };
  };

  return Picker;
});

// Mock navigation stack
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Now import everything else
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, View, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../contexts/SettingsContext';
import ShelterReportScreen from '../screens/ShelterReportScreen';
import { NavigationContainer } from '@react-navigation/native';

// Mock axios
jest.mock('axios');

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock translations
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'shelterReport:selectAShelter': 'Select a shelter...',
        'shelterReport:selectShelter': 'Select Shelter *',
        'shelterReport:location': 'Location:',
        'shelterReport:issueDescription': 'Issue Description *',
        'shelterReport:describeIssuePlaceholder': 'Describe the issue (e.g., shelter is closed, damaged, etc.)',
        'shelterReport:submitReport': 'Submit Report',
        'shelterReport:missingInfoTitle': 'Missing Information',
        'shelterReport:missingInfoMessage': 'Please select a shelter and describe the issue',
        'shelterReport:reportSubmittedTitle': 'Report Submitted',
        'shelterReport:reportSubmittedMessage': 'Thank you for your report. We will investigate the issue.',
        'shelterReport:failedToSubmitReport': 'Failed to submit report',
        'shelterReport:failedToLoadShelters': 'Failed to load shelters. Please try again later.',
        'common:error': 'Error',
        'shelterMap:ok': 'OK'
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
      hasLanguageSomeTranslations: () => true,
    },
  }),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
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

describe('Shelter Report Feature', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should render the shelter report form correctly', async () => {
    // Mock successful shelters response
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        shelters: [
          { ID: 1, Name: 'Test Shelter 1' },
          { ID: 2, Name: 'Test Shelter 2' }
        ]
      }
    });

    const { getByTestId, getByText } = renderWithProviders(
      <ShelterReportScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Verify the form elements are rendered
    expect(getByTestId('mock-picker')).toBeTruthy();
    expect(getByText('Select a shelter...')).toBeTruthy();
  });

  it('should show error when submitting without selecting shelter and description', async () => {
    // Mock successful shelters response
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        shelters: [
          { ID: 1, Name: 'Test Shelter 1' }
        ]
      }
    });

    const { getByText } = renderWithProviders(
      <ShelterReportScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Try to submit without selecting shelter
    const submitButton = getByText('Submit Report');
    fireEvent.press(submitButton);

    // Verify error alert is shown
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Please select a shelter and provide a description'
      );
    });
  });

  it('should successfully submit a report', async () => {
    // Mock successful shelters response
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        shelters: [
          { ID: 1, Name: 'Test Shelter 1' }
        ]
      }
    });

    // Mock successful report submission
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Report submitted successfully'
      }
    });

    const { getByTestId, getByText } = renderWithProviders(
      <ShelterReportScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Select a shelter
    const pickerTrigger = getByTestId('picker-trigger');
    fireEvent.press(pickerTrigger);

    // Fill in description
    const descriptionInput = getByTestId('description-input');
    fireEvent.changeText(descriptionInput, 'Test report description');

    // Submit the report
    const submitButton = getByText('Submit Report');
    fireEvent.press(submitButton);

    // Verify success alert and navigation
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Report submitted successfully'
      );
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  it('should handle failed report submission', async () => {
    // Mock successful shelters response
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        shelters: [
          { ID: 1, Name: 'Test Shelter 1' }
        ]
      }
    });

    // Mock failed report submission
    axios.post.mockRejectedValueOnce(new Error('Failed to submit report'));

    const { getByTestId, getByText } = renderWithProviders(
      <ShelterReportScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Select a shelter
    const pickerTrigger = getByTestId('picker-trigger');
    fireEvent.press(pickerTrigger);

    // Fill in description
    const descriptionInput = getByTestId('description-input');
    fireEvent.changeText(descriptionInput, 'Test report description');

    // Submit the report
    const submitButton = getByText('Submit Report');
    fireEvent.press(submitButton);

    // Verify error alert
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to submit report'
      );
    });
  });
});
