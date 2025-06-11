import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const SettingsContext = createContext();

// Storage keys
export const STORAGE_KEYS = {
  DARK_MODE: '@settings_dark_mode',
  NOTIFICATIONS: '@settings_notifications',
  MAP_TYPE: '@settings_map_type',
  LANGUAGE: '@settings_language',
  DISTANCE_UNIT: '@settings_distance_unit',
};

export const SettingsProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [mapType, setMapType] = useState('standard');
  const [distanceUnit, setDistanceUnit] = useState('km');

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE);
      const savedNotifications = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const savedMapType = await AsyncStorage.getItem(STORAGE_KEYS.MAP_TYPE);
      const savedDistanceUnit = await AsyncStorage.getItem(STORAGE_KEYS.DISTANCE_UNIT);

      // If no saved dark mode preference, use device theme
      if (savedDarkMode === null) {
        setDarkMode(deviceTheme === 'dark');
      } else {
        setDarkMode(savedDarkMode === 'true');
      }

      setNotifications(savedNotifications !== 'false');
      setMapType(savedMapType || 'standard');
      setDistanceUnit(savedDistanceUnit || 'km');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const updateDarkMode = (value) => {
    setDarkMode(value);
    saveSetting(STORAGE_KEYS.DARK_MODE, value);
  };

  const updateNotifications = (value) => {
    setNotifications(value);
    saveSetting(STORAGE_KEYS.NOTIFICATIONS, value);
  };

  const updateMapType = (type) => {
    setMapType(type);
    saveSetting(STORAGE_KEYS.MAP_TYPE, type);
  };

  const updateDistanceUnit = (unit) => {
    setDistanceUnit(unit);
    saveSetting(STORAGE_KEYS.DISTANCE_UNIT, unit);
  };

  // Helper function to format distance based on selected unit
  const formatDistance = (distanceInMeters) => {
    if (distanceUnit === 'km') {
      if (distanceInMeters >= 1000) {
        return `${(distanceInMeters / 1000).toFixed(1)} ק"מ`;
      }
      return `${distanceInMeters} מטר`;
    } else {
      const miles = distanceInMeters * 0.000621371;
      if (miles >= 1) {
        return `${miles.toFixed(1)} mi`;
      }
      return `${Math.round(distanceInMeters * 3.28084)} ft`;
    }
  };

  const value = {
    darkMode,
    notifications,
    mapType,
    distanceUnit,
    updateDarkMode,
    updateNotifications,
    updateMapType,
    updateDistanceUnit,
    formatDistance,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 