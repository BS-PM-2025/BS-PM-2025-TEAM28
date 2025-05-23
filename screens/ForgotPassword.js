// screens/ForgotPassword.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import sendIcon from '../assets/send.png';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
    { label: 'At least one uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
    { label: 'At least one lowercase letter', test: (pw) => /[a-z]/.test(pw) },
    { label: 'At least one number', test: (pw) => /[0-9]/.test(pw) },
  ];

  const unmetRequirements = passwordRequirements.filter(r => !r.test(newPassword));
  const passwordValid = unmetRequirements.length === 0;
  const passwordsMatch = newPassword === confirmPassword;

  const handleSendCode = async () => {
    try {
      const res = await axios.post('http://10.0.2.2:3000/api/send-reset-code', { email });
      Alert.alert('Success', res.data.message);
      setStep(2);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleResetPassword = async () => {
    if (
      !email.trim() ||
      !code.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    if (!passwordValid) {
      Alert.alert(
        'Invalid Password',
        'Password must be at least 8 characters long and contain:\n\n' +
        '• At least one uppercase letter\n' +
        '• At least one lowercase letter\n' +
        '• At least one number'
      );
      return;
    }

    if (!passwordsMatch) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const res = await axios.post('http://10.0.2.2:3000/api/reset-password', {
        email,
        code,
        newPassword,
      });
      Alert.alert('Success', res.data.message);
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      {step === 2 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="6-digit Code"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="New Password"
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
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <MaterialIcons
                name={showConfirmPassword ? "visibility-off" : "visibility"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {newPassword.length > 0 && (passwordFocused || passwordTouched) && (
            <View style={styles.requirementsBox}>
              {passwordRequirements.map((req, idx) => (
                <Text
                  key={idx}
                  style={req.test(newPassword) ? styles.requirementMet : styles.requirementUnmet}
                >
                  {req.test(newPassword) ? '✓' : '•'} {req.label}
                </Text>
              ))}
            </View>
          )}
        </>
      )}

      <TouchableOpacity
        style={styles.buttonBlue}
        onPress={step === 1 ? handleSendCode : handleResetPassword}
      >
        {step === 1 ? (
          <>
            <Image source={sendIcon} style={styles.sendIcon} />
            <Text style={styles.buttonBlueText}>Send Code</Text>
          </>
        ) : (
          <>
            <MaterialIcons name="lock-reset" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonBlueText}>Reset Password</Text>
          </>
        )}
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
  title: {
    fontSize: 32,
    marginBottom: 40,
    textAlign: 'center',
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    fontSize: 16,
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
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  showPasswordButton: {
    padding: 15,
  },
  requirementsBox: {
    marginTop: 10,
    marginBottom: 10,
  },
  requirementMet: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
  requirementUnmet: {
    color: '#1565c0',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 'bold',
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
  buttonBlueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'normal',
  },
  sendIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain',
  },
});
