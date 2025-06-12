import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';

function Login({ navigation, route }) {
  const { t } = useTranslation();
  const { darkMode } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (route.params?.prefillEmail) {
      setEmail(route.params.prefillEmail);
    }
    checkSavedLogin();
  }, []);

  const checkSavedLogin = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedPassword = await AsyncStorage.getItem('userPassword');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Error checking saved login:', error);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in both fields');
      return;
    }

    try {
      const response = await axios.post('http://10.0.2.2:3000/api/login', {
        email,
        password,
      });

      if (response.data.success) {
        const user = response.data.user;

        if (rememberMe) {
          await AsyncStorage.setItem('userEmail', email);
          await AsyncStorage.setItem('userPassword', password);
        } else {
          await AsyncStorage.removeItem('userEmail');
          await AsyncStorage.removeItem('userPassword');
        }

        if (user.IsAdmin) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'AdminScreen', params: { user } }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'AccountScreen', params: { user } }],
          });
        }
      } else {
        Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to log in');
    }
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <Text style={[styles.title, darkMode && styles.titleDark]}>{t('login:title')}</Text>

      <TextInput
        style={[styles.input, darkMode && styles.inputDark]}
        placeholder={t('login:emailPlaceholder')}
        placeholderTextColor={darkMode ? '#95a5a6' : '#666'}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={[styles.passwordContainer, darkMode && styles.passwordContainerDark]}>
        <TextInput
          style={[styles.passwordInput, darkMode && styles.passwordInputDark]}
          placeholder={t('login:passwordPlaceholder')}
          placeholderTextColor={darkMode ? '#95a5a6' : '#666'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity 
          style={styles.showPasswordButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <MaterialIcons 
            name={showPassword ? "visibility-off" : "visibility"} 
            size={24} 
            color={darkMode ? '#95a5a6' : '#666'} 
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.rememberMeContainer}
        onPress={() => setRememberMe(!rememberMe)}
      >
        <MaterialIcons 
          name={rememberMe ? "check-box" : "check-box-outline-blank"} 
          size={24} 
          color={darkMode ? '#fff' : '#2c3e50'} 
        />
        <Text style={[styles.rememberMeText, darkMode && styles.rememberMeTextDark]}>{t('common:rememberMe')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonBlue} onPress={handleLogin}>
        <Text style={styles.buttonBlueText}>{t('login:loginButton')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.outlineButtonSmall, darkMode && styles.outlineButtonSmallDark]}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text style={[styles.outlineButtonSmallText, darkMode && styles.outlineButtonSmallTextDark]}>{t('login:forgotPassword')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 32,
    marginBottom: 40,
    textAlign: 'center',
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  titleDark: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#f8f9fa',
    marginBottom: 15,
    fontSize: 16,
    color: '#2c3e50',
  },
  inputDark: {
    borderColor: '#444',
    backgroundColor: '#2c2c2c',
    color: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 15,
  },
  passwordContainerDark: {
    borderColor: '#444',
    backgroundColor: '#2c2c2c',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#2c3e50',
  },
  passwordInputDark: {
    color: '#fff',
  },
  showPasswordButton: {
    padding: 15,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMeText: {
    marginLeft: 8,
    color: '#2c3e50',
    fontSize: 16,
  },
  rememberMeTextDark: {
    color: '#fff',
  },
  buttonBlue: {
    backgroundColor: '#0066e6',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonBlueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'normal',
  },
  outlineButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0066e6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 15,
    alignSelf: 'center',
  },
  outlineButtonSmallDark: {
    borderColor: '#3498db',
  },
  outlineButtonSmallText: {
    color: '#0066e6',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  outlineButtonSmallTextDark: {
    color: '#3498db',
  },
});

export default Login;
