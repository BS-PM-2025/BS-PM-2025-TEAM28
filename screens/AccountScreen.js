// screens/AccountScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AccountScreen({ route, navigation }) {
  const { user } = route.params;

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userPassword');
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
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('Settings', { user })}
          >
            <MaterialIcons name="settings" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>
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

        <TouchableOpacity 
          style={styles.shelterButton}
          onPress={() => navigation.navigate('ShelterMap')}
        >
          <MaterialIcons name="my-location" size={24} color="white" />
          <Text style={styles.shelterButtonText}>Find Closest Shelter</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.blueShelterButton}
          onPress={() => navigation.navigate('AddressShelter')}
        >
          <MaterialIcons name="location-on" size={24} color="white" />
          <Text style={styles.shelterButtonText}>Find Shelter by Address</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 10,
  },
  infoContainer: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  shelterButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    gap: 10,
  },
  shelterButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  blueShelterButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    gap: 10,
  },
});

export default AccountScreen;