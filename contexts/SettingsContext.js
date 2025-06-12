import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import i18n from 'i18next'; // Import i18n instance
import { useTranslation } from 'react-i18next';

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
  const [language, setLanguage] = useState('en'); // Add language state
  const { t } = useTranslation();

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE);
      const savedNotifications = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const savedMapType = await AsyncStorage.getItem(STORAGE_KEYS.MAP_TYPE);
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
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
      
      // Set initial language and change i18n instance
      const initialLanguage = savedLanguage || 'en';
      setLanguage(initialLanguage);
      i18n.changeLanguage(initialLanguage);

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

  const updateLanguage = (lang) => {
    setLanguage(lang);
    saveSetting(STORAGE_KEYS.LANGUAGE, lang);
    i18n.changeLanguage(lang);
  };

  // Helper function to format distance based on selected unit
  const formatDistance = (distanceInMeters) => {
    if (distanceUnit === 'km') {
      if (distanceInMeters >= 1000) {
        return `${(distanceInMeters / 1000).toFixed(1)} ${t('common:distanceUnitKm')}`;
      }
      return `${distanceInMeters} ${t('common:distanceUnitMeters')}`;
    } else {
      const miles = distanceInMeters * 0.000621371;
      if (miles >= 1) {
        return `${miles.toFixed(1)} ${t('common:distanceUnitMiles')}`;
      }
      return `${Math.round(distanceInMeters * 3.28084)} ${t('common:distanceUnitFeet')}`;
    }
  };

  const value = {
    darkMode,
    notifications,
    mapType,
    distanceUnit,
    language, // Expose language state
    updateDarkMode,
    updateNotifications,
    updateMapType,
    updateDistanceUnit,
    updateLanguage, // Expose updateLanguage function
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