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

function Register() {
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
      label: 'At least 8 characters',
      test: (pw) => pw.length >= 8,
    },
    {
      label: 'At least one uppercase letter',
      test: (pw) => /[A-Z]/.test(pw),
    },
    {
      label: 'At least one lowercase letter',
      test: (pw) => /[a-z]/.test(pw),
    },
    {
      label: 'At least one number',
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
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }
    if (!passwordsMatch) {
      Alert.alert('Error', 'Passwords do not match');
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
        Alert.alert('Success', 'Registration successful!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login', { prefillEmail: email })
          }
        ]);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>

      {/* User Type Buttons on top, bold text, blue/gray scheme */}
      <View style={styles.userTypeButtonsRow}>
        <TouchableOpacity
          style={[
            styles.userTypeButtonBlue,
            userType === 'Resident' ? styles.userTypeButtonBlueActive : styles.userTypeButtonBlueOutline
          ]}
          onPress={() => setUserType('Resident')}
        >
          <Text style={[
            styles.userTypeButtonText,
            userType === 'Resident' ? styles.userTypeButtonTextActive : styles.userTypeButtonTextOutline
          ]}>
            {userType === 'Resident' ? '✓ ' : ''}Resident
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.userTypeButtonBlue,
            userType === 'Tourist' ? styles.userTypeButtonBlueActive : styles.userTypeButtonBlueOutline
          ]}
          onPress={() => setUserType('Tourist')}
        >
          <Text style={[
            styles.userTypeButtonText,
            userType === 'Tourist' ? styles.userTypeButtonTextActive : styles.userTypeButtonTextOutline
          ]}>
            {userType === 'Tourist' ? '✓ ' : ''}Tourist
          </Text>
        </TouchableOpacity>
      </View>

      {/* Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        onFocus={() => setEmailFocused(true)}
        onBlur={() => { setEmailFocused(false); setEmailTouched(true); }}
      />
      {/* Show email warning only after blur if not valid and not empty */}
      {email.length > 0 && !emailValid && emailTouched && (
        <Text style={styles.requirementUnmet}>Please enter a valid email address.</Text>
      )}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
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
            color="#666" 
          />
        </TouchableOpacity>
      </View>

      {/* Show password requirements as hint while typing and not valid, or if touched and not valid */}
      {password.length > 0 && !passwordValid && (passwordFocused || passwordTouched) && (
        <View style={styles.requirementsBox}>
          {passwordRequirements.map((req, idx) => (
            <Text
              key={idx}
              style={req.test(password) ? styles.requirementMet : styles.requirementUnmet}
            >
              • {req.label}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
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
            color="#666" 
          />
        </TouchableOpacity>
      </View>
      {/* Show mismatch hint for confirm password */}
      {confirmPasswordFocused && confirmPassword.length > 0 && confirmPassword !== password && (
        <Text style={styles.requirementUnmet}>Passwords do not match.</Text>
      )}

      <TouchableOpacity
        style={[styles.buttonBlue, !canRegister && styles.buttonBlueDisabled]}
        onPress={handleRegister}
        disabled={!canRegister}
      >
        <MaterialIcons name="person-add" size={24} color="#fff" />
        <Text style={styles.buttonBlueText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLink}>Login</Text>
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
  title: {
    fontSize: 32,
    marginBottom: 40,
    textAlign: 'center',
    color: '#2c3e50',
    fontWeight: 'bold',
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
    backgroundColor: '#1565c0',
    borderColor: '#1565c0',
  },
  userTypeButtonBlueOutline: {
    backgroundColor: '#fff',
    borderColor: '#1565c0',
  },
  userTypeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userTypeButtonTextActive: {
    color: '#fff',
  },
  userTypeButtonTextOutline: {
    color: '#1565c0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#f8f9fa',
    marginBottom: 15,
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
  buttonBlueDisabled: {
    backgroundColor: '#b0bec5',
  },
  buttonBlueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'normal',
  },
  loginText: {
    marginTop: 20,
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  loginLink: {
    fontWeight: 'bold',
  },
});

export default Register;
