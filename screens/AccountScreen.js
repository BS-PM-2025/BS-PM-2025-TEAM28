// screens/AccountScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AccountScreen({ route, navigation }) {
  const { user } = route.params;

  const handleLogout = async () => {
    try {
      // Clear saved login credentials
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userPassword');
      // Navigate to Home screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user.Name}!</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={24} color="#2c3e50" />
          <Text style={styles.infoText}>Email: {user.Gmail}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={24} color="#2c3e50" />
          <Text style={styles.infoText}>User Type: {user.UserType}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  logoutButton: {
    padding: 10,
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#2c3e50',
  },
});

export default AccountScreen;
