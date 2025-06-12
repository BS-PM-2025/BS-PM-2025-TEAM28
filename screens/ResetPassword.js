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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

function ResetPassword({ navigation, route }) {
  const { user } = route.params;
  const { darkMode } = useSettings();
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const passwordRequirements = [
    { label: t('resetPassword:passwordRequirementLength'), test: (pw) => pw.length >= 8 },
    { label: t('resetPassword:passwordRequirementUppercase'), test: (pw) => /[A-Z]/.test(pw) },
    { label: t('resetPassword:passwordRequirementLowercase'), test: (pw) => /[a-z]/.test(pw) },
    { label: t('resetPassword:passwordRequirementNumber'), test: (pw) => /[0-9]/.test(pw) },
  ];

  const unmetRequirements = passwordRequirements.filter(r => !r.test(newPassword));
  const passwordValid = unmetRequirements.length === 0;
  const passwordsMatch = newPassword === confirmPassword;

  const handleResetPassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert(t('resetPassword:missingFieldsTitle'), t('resetPassword:missingFieldsMessage'));
      return;
    }

    if (!passwordValid) {
      Alert.alert(
        t('resetPassword:invalidPasswordTitle'),
        t('resetPassword:invalidPasswordMessage')
      );
      return;
    }

    if (!passwordsMatch) {
      Alert.alert(t('common:error'), t('resetPassword:newPasswordsDoNotMatch'));
      return;
    }

    try {
      const loginResponse = await axios.post('http://10.0.2.2:3000/api/login', {
        email: user.Gmail,
        password: currentPassword,
      });

      if (!loginResponse.data.success) {
        Alert.alert(t('common:error'), t('resetPassword:currentPasswordIncorrect'));
        return;
      }

      await axios.post('http://10.0.2.2:3000/api/reset-password', {
        email: user.Gmail,
        currentPassword,
        newPassword,
      });

      Alert.alert(t('common:successTitle'), t('resetPassword:passwordResetSuccess'), [
        { text: t('common:ok'), onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert(t('common:error'), error.response?.data?.message || t('resetPassword:failedToResetPassword'));
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, darkMode && styles.containerDark]}>
      <View style={[styles.header, darkMode && styles.headerDark]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={darkMode ? '#fff' : '#2c3e50'} />
        </TouchableOpacity>
        <Text style={[styles.title, darkMode && styles.titleDark]}>{t('resetPassword:title')}</Text>
      </View>

      <View style={styles.form}>
        <View style={[styles.passwordContainer, darkMode && styles.passwordContainerDark]}>
          <TextInput
            style={[styles.passwordInput, darkMode && styles.passwordInputDark]}
            placeholder={t('resetPassword:currentPasswordPlaceholder')}
            placeholderTextColor={darkMode ? '#999' : '#666'}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrentPassword}
          />
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            <MaterialIcons
              name={showCurrentPassword ? "visibility-off" : "visibility"}
              size={24}
              color={darkMode ? '#999' : '#666'}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.passwordContainer, darkMode && styles.passwordContainerDark]}>
          <TextInput
            style={[styles.passwordInput, darkMode && styles.passwordInputDark]}
            placeholder={t('resetPassword:newPasswordPlaceholder')}
            placeholderTextColor={darkMode ? '#999' : '#666'}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setPasswordTouched(true);
            }}
            secureTextEntry={!showNewPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            <MaterialIcons
              name={showNewPassword ? "visibility-off" : "visibility"}
              size={24}
              color={darkMode ? '#999' : '#666'}
            />
          </TouchableOpacity>
        </View>

        {newPassword.length > 0 && (passwordFocused || passwordTouched) && (
          <View style={[styles.requirementsBox, darkMode && styles.requirementsBoxDark]}>
            {passwordRequirements.map((req, idx) => (
              <Text
                key={idx}
                style={[
                  req.test(newPassword) ? styles.requirementMet : styles.requirementUnmet,
                  darkMode && (req.test(newPassword) ? styles.requirementMetDark : styles.requirementUnmetDark)
                ]}
              >
                {req.test(newPassword) ? '✓' : '•'} {req.label}
              </Text>
            ))}
          </View>
        )}

        <View style={[styles.passwordContainer, darkMode && styles.passwordContainerDark]}>
          <TextInput
            style={[styles.passwordInput, darkMode && styles.passwordInputDark]}
            placeholder={t('resetPassword:confirmNewPasswordPlaceholder')}
            placeholderTextColor={darkMode ? '#999' : '#666'}
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
              color={darkMode ? '#999' : '#666'}
            />
          </TouchableOpacity>
        </View>

        {confirmPasswordFocused && confirmPassword.length > 0 && confirmPassword !== newPassword && (
          <Text style={[styles.requirementUnmet, darkMode && styles.requirementUnmetDark]}>
            {t('resetPassword:passwordsDoNotMatch')}
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.buttonBlue,
            darkMode && !(!passwordValid || !passwordsMatch || !currentPassword) && styles.buttonBlueDark,
            (!passwordValid || !passwordsMatch || !currentPassword) && styles.buttonBlueDisabled
          ]}
          onPress={handleResetPassword}
          disabled={!passwordValid || !passwordsMatch || !currentPassword}
        >
          <Text style={styles.buttonBlueText}>{t('resetPassword:resetPasswordButton')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
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
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  titleDark: {
    color: '#fff',
  },
  form: {
    padding: 20,
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
    backgroundColor: '#2c2c2c',
    borderColor: '#404040',
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
  buttonBlue: {
    backgroundColor: '#1565c0',
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
  buttonBlueDark: {
    backgroundColor: '#0d47a1',
  },
  buttonBlueDisabled: {
    backgroundColor: '#b0bec5',
  },
  buttonBlueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'normal',
    marginLeft: 8,
  },
  requirementsBox: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  requirementsBoxDark: {
    backgroundColor: '#2c2c2c',
  },
  requirementMet: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
  requirementMetDark: {
    color: '#999',
  },
  requirementUnmet: {
    color: '#1565c0',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 'bold',
  },
  requirementUnmetDark: {
    color: '#64b5f6',
  },
});

export default ResetPassword;
