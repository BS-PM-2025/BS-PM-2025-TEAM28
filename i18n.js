import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

import en from './translations/en.json';
import he from './translations/he.json';

const LANGUAGES = {
  en,
  he,
};

const LANG_CODES = Object.keys(LANGUAGES);

const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const savedLanguage = await AsyncStorage.getItem('@settings_language');
      if (savedLanguage) {
        return callback(savedLanguage);
      }
      
      // If no saved language, use device language if supported
      const deviceLanguage = RNLocalize.getLocales()[0].languageCode;
      const supportedLanguage = LANG_CODES.includes(deviceLanguage) ? deviceLanguage : 'he';
      return callback(supportedLanguage);
    } catch (error) {
      console.error('Error reading language', error);
      callback('he'); // Default to Hebrew
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem('@settings_language', language);
    } catch (error) {
      console.error('Error saving language', error);
    }
  }
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: LANGUAGES,
    react: {
      useSuspense: false
    },
    interpolation: {
      escapeValue: false
    },
    ns: ['common', 'home', 'login', 'account', 'admin', 'settings'],
    defaultNS: 'common'
  });

export default i18n; 