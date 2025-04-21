// screens/ForgotPassword.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSendCode = async () => {
    try {
      const res = await axios.post('http://192.168.1.140:3000/api/send-reset-code', { email });
      Alert.alert('Success', res.data.message);
      setStep(2);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        'Invalid Password', 
        'Password must be at least 8 characters long and contain:\n\n' +
        '• At least one uppercase letter\n' +
        '• At least one lowercase letter\n' +
        '• At least one number'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const res = await axios.post('http://192.168.1.249:3000/api/reset-password', {
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
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
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

          <Text style={styles.requirements}>
            Password must contain:{'\n'}
            • At least 8 characters{'\n'}
            • At least one uppercase letter{'\n'}
            • At least one lowercase letter{'\n'}
            • At least one number
          </Text>
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={step === 1 ? handleSendCode : handleResetPassword}>
        <MaterialIcons 
          name={step === 1 ? "send" : "lock-reset"} 
          size={24} 
          color="white" 
        />
        <Text style={styles.buttonText}>{step === 1 ? 'Send Code' : 'Reset Password'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center', 
    backgroundColor: '#fff' 
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
  requirements: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  button: { 
    backgroundColor: '#27ae60', 
    padding: 15, 
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
});
