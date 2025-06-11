import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';

// Storage keys
const STORAGE_KEYS = {
  DARK_MODE: '@settings_dark_mode',
  NOTIFICATIONS: '@settings_notifications',
  MAP_TYPE: '@settings_map_type',
  LANGUAGE: '@settings_language',
  DISTANCE_UNIT: '@settings_distance_unit',
};

function Settings({ navigation, route }) {
  const { user } = route.params;
  const { t, i18n } = useTranslation();
  const {
    darkMode,
    notifications,
    mapType,
    distanceUnit,
    updateDarkMode,
    updateNotifications,
    updateMapType,
    updateDistanceUnit,
  } = useSettings();

  // Load saved settings
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

      updateDarkMode(savedDarkMode === 'true');
      updateNotifications(savedNotifications !== 'false');
      updateMapType(savedMapType || 'standard');
      updateDistanceUnit(savedDistanceUnit || 'km');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error('Error saving setting:', error);
      Alert.alert('Error', 'Failed to save setting');
    }
  };

  const handleDarkModeToggle = (value) => {
    updateDarkMode(value);
    saveSetting(STORAGE_KEYS.DARK_MODE, value);
    // TODO: Implement theme change logic
  };

  const handleNotificationsToggle = (value) => {
    updateNotifications(value);
    saveSetting(STORAGE_KEYS.NOTIFICATIONS, value);
    // TODO: Implement notification permission logic
  };

  const handleMapTypeChange = (type) => {
    updateMapType(type);
    saveSetting(STORAGE_KEYS.MAP_TYPE, type);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    saveSetting(STORAGE_KEYS.LANGUAGE, lang);
  };

  const handleDistanceUnitChange = (unit) => {
    updateDistanceUnit(unit);
    saveSetting(STORAGE_KEYS.DISTANCE_UNIT, unit);
  };

  return (
    <ScrollView style={[styles.container, darkMode && styles.containerDark]}>
      <View style={[styles.header, darkMode && styles.headerDark]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={darkMode ? '#fff' : '#2c3e50'} />
        </TouchableOpacity>
        <Text style={[styles.title, darkMode && styles.titleDark]}>{t('title')}</Text>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
          {t('account')}
        </Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, darkMode && styles.settingItemDark]}
          onPress={() => navigation.navigate('ResetPassword', { user })}
        >
          <MaterialIcons name="lock-reset" size={24} color={darkMode ? '#fff' : '#2c3e50'} />
          <Text style={[styles.settingText, darkMode && styles.settingTextDark]}>
            {t('resetPassword')}
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={darkMode ? '#95a5a6' : '#95a5a6'} />
        </TouchableOpacity>
      </View>

      {/* App Preferences */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
          {t('appPreferences')}
        </Text>

        <View style={[styles.settingItem, darkMode && styles.settingItemDark]}>
          <MaterialIcons name="dark-mode" size={24} color={darkMode ? '#fff' : '#2c3e50'} />
          <Text style={[styles.settingText, darkMode && styles.settingTextDark]}>
            {t('darkMode')}
          </Text>
          <Switch
            value={darkMode}
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={darkMode ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingItem, darkMode && styles.settingItemDark]}>
          <MaterialIcons name="notifications" size={24} color={darkMode ? '#fff' : '#2c3e50'} />
          <Text style={[styles.settingText, darkMode && styles.settingTextDark]}>
            {t('notifications')}
          </Text>
          <Switch
            value={notifications}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notifications ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Language Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
          {t('language')}
        </Text>

        <TouchableOpacity 
          style={[styles.settingItem, darkMode && styles.settingItemDark]}
          onPress={() => handleLanguageChange('he')}
        >
          <MaterialIcons name="language" size={24} color={darkMode ? '#fff' : '#2c3e50'} />
          <Text style={[styles.settingText, darkMode && styles.settingTextDark]}>
            עברית {i18n.language === 'he' && '✓'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingItem, darkMode && styles.settingItemDark]}
          onPress={() => handleLanguageChange('en')}
        >
          <MaterialIcons name="language" size={24} color={darkMode ? '#fff' : '#2c3e50'} />
          <Text style={[styles.settingText, darkMode && styles.settingTextDark]}>
            English {i18n.language === 'en' && '✓'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
          {t('mapSettings')}
        </Text>

        <TouchableOpacity 
          style={[styles.settingItem, darkMode && styles.settingItemDark]}
          onPress={() => handleMapTypeChange('standard')}
        >
          <MaterialIcons name="map" size={24} color={darkMode ? '#fff' : '#2c3e50'} />
          <Text style={[styles.settingText, darkMode && styles.settingTextDark]}>
            {t('standardMap')} {mapType === 'standard' && '✓'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingItem, darkMode && styles.settingItemDark]}
          onPress={() => handleMapTypeChange('satellite')}
        >
          <MaterialIcons name="satellite" size={24} color={darkMode ? '#fff' : '#2c3e50'} />
          <Text style={[styles.settingText, darkMode && styles.settingTextDark]}>
            {t('satelliteMap')} {mapType === 'satellite' && '✓'}
          </Text>
        </TouchableOpacity>

        <View style={[styles.settingItem, darkMode && styles.settingItemDark]}>
          <MaterialIcons name="straighten" size={24} color={darkMode ? '#fff' : '#2c3e50'} />
          <Text style={[styles.settingText, darkMode && styles.settingTextDark]}>
            {t('distanceUnit')}
          </Text>
          <View style={styles.unitSelector}>
            <TouchableOpacity 
              style={[styles.unitButton, distanceUnit === 'km' && styles.unitButtonActive]}
              onPress={() => handleDistanceUnitChange('km')}
            >
              <Text style={[styles.unitButtonText, distanceUnit === 'km' && styles.unitButtonTextActive]}>
                km
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.unitButton, distanceUnit === 'mi' && styles.unitButtonActive]}
              onPress={() => handleDistanceUnitChange('mi')}
            >
              <Text style={[styles.unitButtonText, distanceUnit === 'mi' && styles.unitButtonTextActive]}>
                mi
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerDark: {
    backgroundColor: '#2c2c2c',
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 20,
  },
  titleDark: {
    color: '#fff',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  sectionTitleDark: {
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
  },
  settingItemDark: {
    backgroundColor: '#2c2c2c',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 15,
  },
  settingTextDark: {
    color: '#fff',
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    padding: 2,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  unitButtonActive: {
    backgroundColor: '#007bff',
  },
  unitButtonText: {
    color: '#495057',
    fontSize: 14,
  },
  unitButtonTextActive: {
    color: '#fff',
  },
});

export default Settings; 