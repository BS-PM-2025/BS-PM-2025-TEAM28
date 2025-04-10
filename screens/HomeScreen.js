// screens/HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Find My Shelter</Text>
        <Text style={styles.subtitle}>Your Safety is Our Priority</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Register')}
          >
            <MaterialIcons name="person-add" size={24} color="white" />
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => navigation.navigate('Login')}
          >
            <MaterialIcons name="login" size={24} color="white" />
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    color: 'white',
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#cccccc',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 20,
  },
  button: {
    backgroundColor: '#2c3e50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loginButton: {
    backgroundColor: '#27ae60',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
