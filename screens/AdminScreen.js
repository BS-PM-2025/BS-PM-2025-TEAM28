import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AdminScreen({ route, navigation }) {
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
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
      
      <Text style={styles.welcomeText}>Welcome, {user.Name}!</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Controls</Text>
    
        <TouchableOpacity style={styles.button}>
          <MaterialIcons name="location-on" size={24} color="white" />
          <Text style={styles.buttonText}>Manage Shelters</Text>
        </TouchableOpacity>
        <TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate('ManageUsers', { adminId: user.ID })}
>
  <MaterialIcons name="people" size={24} color="white" />
  <Text style={styles.buttonText}>Manage Users</Text>
</TouchableOpacity>
      </View>
    </ScrollView>
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
  welcomeText: {
    fontSize: 18,
    color: '#2c3e50',
    padding: 20,
    paddingBottom: 0,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdminScreen;