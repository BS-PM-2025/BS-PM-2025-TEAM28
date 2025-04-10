import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AdminScreen({ route, navigation }) {
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.welcomeText}>Welcome, {user.Name}!</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Controls</Text>
        
        <TouchableOpacity style={styles.button}>
          <MaterialIcons name="people" size={24} color="white" />
          <Text style={styles.buttonText}>Manage Users</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button}>
          <MaterialIcons name="location-on" size={24} color="white" />
          <Text style={styles.buttonText}>Manage Shelters</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  logoutButton: {
    padding: 10,
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 30,
    color: '#666',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#444',
  },
  button: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminScreen; 