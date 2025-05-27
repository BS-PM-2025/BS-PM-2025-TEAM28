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

function ResetPassword({ navigation, route }) {
  const { user } = route.params;
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
    { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
    { label: 'At least one uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
    { label: 'At least one lowercase letter', test: (pw) => /[a-z]/.test(pw) },
    { label: 'At least one number', test: (pw) => /[0-9]/.test(pw) },
  ];

  const unmetRequirements = passwordRequirements.filter(r => !r.test(newPassword));
  const passwordValid = unmetRequirements.length === 0;
  const passwordsMatch = newPassword === confirmPassword;

const handleResetPassword = async () => {
      if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
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
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      const loginResponse = await axios.post('http://10.0.2.2:3000/api/login', {
        email: user.Gmail,
        password: currentPassword,
      });

      if (!loginResponse.data.success) {
        Alert.alert('Error', 'Current password is incorrect');
        return;
      }

      await axios.post('http://10.0.2.2:3000/api/reset-password', {
        email: user.Gmail,
        currentPassword,
        newPassword,
      });

      Alert.alert('Success', 'Password has been reset successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.title}>Reset Password</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Current Password"
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
              color="#666"
            />
          </TouchableOpacity>
        </View>

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

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm New Password"
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

        {confirmPasswordFocused && confirmPassword.length > 0 && confirmPassword !== newPassword && (
          <Text style={styles.requirementUnmet}>Passwords do not match.</Text>
        )}

        <TouchableOpacity
          style={[
            styles.buttonBlue,
            (!passwordValid || !passwordsMatch || !currentPassword) && styles.buttonBlueDisabled
          ]}
          onPress={handleResetPassword}
          disabled={!passwordValid || !passwordsMatch || !currentPassword}
        >
          <MaterialIcons name="lock-reset" size={24} color="#fff" />
          <Text style={styles.buttonBlueText}>Reset Password</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
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
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
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
});

export default ResetPassword;
