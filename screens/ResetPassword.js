import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
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

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleResetPassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
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
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      const loginResponse = await axios.post('http://192.168.56.1:3000/api/login', {
        email: user.Gmail,
        password: currentPassword,
      });

      if (!loginResponse.data.success) {
        Alert.alert('Error', 'Current password is incorrect');
        return;
      }

      const response = await axios.post('http://192.168.56.1:3000/api/reset-password', {
        email: user.Gmail,
        currentPassword,
        newPassword,
      });

      Alert.alert('Success', 'Password has been reset successfully', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          }
        }
      ]);
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <View style={styles.container}>
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

        <TouchableOpacity 
          style={styles.button}
          onPress={handleResetPassword}
        >
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  button: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  requirements: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ResetPassword; 