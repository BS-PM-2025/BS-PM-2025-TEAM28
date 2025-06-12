import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';

function Register() {
  const { t } = useTranslation();
  const { darkMode } = useSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('Resident');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [attemptedRegister, setAttemptedRegister] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const navigation = useNavigation();

  // Password requirements
  const passwordRequirements = [
    {
      label: t('register:passwordRequirementLength'),
      test: (pw) => pw.length >= 8,
    },
    {
      label: t('register:passwordRequirementUppercase'),
      test: (pw) => /[A-Z]/.test(pw),
    },
    {
      label: t('register:passwordRequirementLowercase'),
      test: (pw) => /[a-z]/.test(pw),
    },
    {
      label: t('register:passwordRequirementNumber'),
      test: (pw) => /[0-9]/.test(pw),
    },
  ];
  const unmetRequirements = passwordRequirements.filter(r => !r.test(password));
  const allFieldsFilled = name && email && password && confirmPassword && userType;
  const passwordsMatch = password === confirmPassword;
  const passwordValid = unmetRequirements.length === 0;
  const canRegister = allFieldsFilled && passwordsMatch && passwordValid;

  // Email validation
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async () => {
    setAttemptedRegister(true);
    if (!allFieldsFilled) {
      Alert.alert(t('register:missingFieldsTitle'), t('register:missingFieldsMessage'));
      return;
    }
    if (!passwordsMatch) {
      Alert.alert(t('common:error'), t('register:passwordsDoNotMatch'));
      return;
    }
    if (!passwordValid) {
      setShowPasswordRequirements(true);
      return;
    }
    setShowPasswordRequirements(false);
    try {
      const response = await axios.post('http://10.0.2.2:3000/api/register', {
        userType,
        name,
        email,
        password,
        userType,
      });
      if (response.data.success) {
        Alert.alert(t('common:successTitle'), t('register:registrationSuccessful'), [
          {
            text: t('common:ok'),
            onPress: () => navigation.navigate('Login', { prefillEmail: email })
          }
        ]);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(t('common:error'), error.response?.data?.message || t('register:failedToRegister'));
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, darkMode && styles.containerDark]}>
      <Text style={[styles.title, darkMode && styles.titleDark]}>{t('register:title')}</Text>

      <View style={styles.userTypeButtonsRow}>
        <TouchableOpacity
          style={[
            styles.userTypeButtonBlue,
            userType === 'Resident'
              ? styles.userTypeButtonBlueActive
              : (darkMode ? styles.userTypeButtonOutlineDark : styles.userTypeButtonBlueOutline)
          ]}
          onPress={() => setUserType('Resident')}
        >
          <Text style={[
            styles.userTypeButtonText,
            userType === 'Resident'
              ? styles.userTypeButtonTextActive
              : (darkMode ? styles.userTypeButtonTextOutlineDark : styles.userTypeButtonTextOutline)
          ]}>
            {userType === 'Resident' ? '✓ ' : ''}{t('register:resident')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.userTypeButtonBlue,
            userType === 'Tourist'
              ? styles.userTypeButtonBlueActive
              : (darkMode ? styles.userTypeButtonOutlineDark : styles.userTypeButtonBlueOutline)
          ]}
          onPress={() => setUserType('Tourist')}
        >
          <Text style={[
            styles.userTypeButtonText,
            userType === 'Tourist'
              ? styles.userTypeButtonTextActive
              : (darkMode ? styles.userTypeButtonTextOutlineDark : styles.userTypeButtonTextOutline)
          ]}>
            {userType === 'Tourist' ? '✓ ' : ''}{t('register:tourist')}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, darkMode && styles.inputDark]}
        placeholder={t('register:namePlaceholder')}
        placeholderTextColor={darkMode ? '#95a5a6' : '#666'}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, darkMode && styles.inputDark]}
        placeholder={t('register:emailPlaceholder')}
        placeholderTextColor={darkMode ? '#95a5a6' : '#666'}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        onFocus={() => setEmailFocused(true)}
        onBlur={() => { setEmailFocused(false); setEmailTouched(true); }}
      />
      {email.length > 0 && !emailValid && emailTouched && (
        <Text style={[styles.requirementUnmet, darkMode && styles.requirementUnmetDark]}>{t('register:invalidEmail')}</Text>
      )}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.passwordInput, darkMode && styles.inputDark]}
          placeholder={t('register:passwordPlaceholder')}
          placeholderTextColor={darkMode ? '#95a5a6' : '#666'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          onFocus={() => { setPasswordFocused(true); setPasswordTouched(true); }}
          onBlur={() => { setPasswordFocused(false); setPasswordTouched(true); }}
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

      {password.length > 0 && !passwordValid && (passwordFocused || passwordTouched) && (
        <View style={[styles.requirementsBox, darkMode && styles.requirementsBoxDark]}>
          {passwordRequirements.map((req, idx) => (
            <Text
              key={idx}
              style={[
                req.test(password)
                  ? (darkMode ? styles.requirementMetDark : styles.requirementMet)
                  : (darkMode ? styles.requirementUnmetDark : styles.requirementUnmet),
              ]}
            >
              • {req.label}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.passwordInput, darkMode && styles.inputDark]}
          placeholder={t('register:confirmPasswordPlaceholder')}
          placeholderTextColor={darkMode ? '#95a5a6' : '#666'}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          onFocus={() => setConfirmPasswordFocused(true)}
          onBlur={() => setConfirmPasswordFocused(false)}
        />
        <TouchableOpacity 
          style={styles.showPasswordButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <MaterialIcons 
            name={showConfirmPassword ? "visibility-off" : "visibility"} 
            size={24} 
            color={darkMode ? '#95a5a6' : '#666'} 
          />
        </TouchableOpacity>
      </View>
      {confirmPasswordFocused && confirmPassword.length > 0 && confirmPassword !== password && (
        <Text style={[styles.requirementUnmet, darkMode && styles.requirementUnmetDark]}>{t('register:passwordsDoNotMatch')}</Text>
      )}

      <TouchableOpacity
        style={[
          styles.buttonBlue,
          !canRegister && styles.buttonBlueDisabled,
          darkMode && styles.buttonBlueDark
        ]}
        onPress={handleRegister}
        disabled={!canRegister}
      >
        <Text style={[styles.buttonBlueText, darkMode && styles.buttonBlueTextDark]}>{t('register:registerButton')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.loginText, darkMode && styles.loginTextDark]}>
          {t('register:alreadyHaveAccount')} <Text style={[styles.loginLink, darkMode && styles.loginLinkDark]}>{t('common:login')}</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
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
  userTypeButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    justifyContent: 'center',
  },
  userTypeButtonBlue: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    marginHorizontal: 2,
  },
  userTypeButtonBlueActive: {
    backgroundColor: '#0066e6',
    borderColor: '#0066e6',
  },
  userTypeButtonBlueOutline: {
    backgroundColor: '#fff',
    borderColor: '#0066e6',
  },
  userTypeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userTypeButtonTextActive: {
    color: '#fff',
  },
  userTypeButtonTextOutline: {
    color: '#2c3e50',
  },
  userTypeButtonTextOutlineDark: {
    color: '#fff',
  },
  userTypeButtonOutlineDark: {
    backgroundColor: '#2c2c2c',
    borderColor: '#444',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  inputDark: {
    backgroundColor: '#2c2c2c',
    borderColor: '#444',
    color: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  showPasswordButton: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  requirementsBox: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  requirementsBoxDark: {
    backgroundColor: '#2c2c2c',
    borderColor: '#444',
  },
  requirementMet: {
    color: '#27ae60',
    marginBottom: 4,
  },
  requirementMetDark: {
    color: '#3498db',
  },
  requirementUnmet: {
    color: '#e74c3c',
    marginBottom: 4,
  },
  requirementUnmetDark: {
    color: '#95a5a6',
  },
  buttonBlue: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonBlueDark: {
    backgroundColor: '#2980b9',
  },
  buttonBlueDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonBlueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonBlueTextDark: {
    color: '#fff',
  },
  loginText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#7f8c8d',
  },
  loginTextDark: {
    color: '#95a5a6',
  },
  loginLink: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  loginLinkDark: {
    color: '#3498db',
  },
  userTypeButtonDark: {
    borderColor: '#444',
    backgroundColor: '#2c2c2c',
  },
  userTypeButtonTextDark: {
    color: '#fff',
  },
});

export default Register;
