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
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !userType) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://192.168.56.1:3000/api/register', {
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
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
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
            color="#666" 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
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

      <View style={styles.userTypeContainer}>
        <Text style={styles.userTypeLabel}>User Type:</Text>
        <View style={styles.userTypeButtons}>
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === 'Resident' && styles.selectedUserType,
            ]}
            onPress={() => setUserType('Resident')}
          >
            <Text
              style={[
                styles.userTypeText,
                userType === 'Resident' && styles.selectedUserTypeText,
              ]}
            >
              Resident
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === 'Tourist' && styles.selectedUserType,
            ]}
            onPress={() => setUserType('Tourist')}
          >
            <Text
              style={[
                styles.userTypeText,
                userType === 'Tourist' && styles.selectedUserTypeText,
              ]}
            >
              Tourist
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <MaterialIcons name="person-add" size={24} color="white" />
        <Text style={styles.buttonText}>Register</Text>
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
  requirements: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  userTypeContainer: {
    marginBottom: 20,
  },
  userTypeLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#2c3e50',
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  userTypeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  selectedUserType: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  userTypeText: {
    color: '#2c3e50',
    fontSize: 16,
  },
  selectedUserTypeText: {
    color: '#fff',
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
    fontWeight: 'bold',
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
