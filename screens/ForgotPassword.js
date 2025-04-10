// screens/ForgotPassword.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);

  const handleSendCode = async () => {
    try {
      const res = await axios.post('http://192.168.56.1:3000/api/send-reset-code', { email });
      Alert.alert('Success', res.data.message);
      setStep(2);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await axios.post('http://192.168.56.1:3000/api/reset-password', {
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
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={step === 1 ? handleSendCode : handleResetPassword}>
        <Text style={styles.buttonText}>{step === 1 ? 'Send Code' : 'Reset Password'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 26, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#aaa', borderRadius: 8, padding: 10, marginBottom: 15 },
  button: { backgroundColor: 'green', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
