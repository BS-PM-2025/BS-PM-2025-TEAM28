import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

function Shelters({ navigation }) {
  const [shelters, setShelters] = useState([]);

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      const response = await axios.get('http://192.168.56.1:3000/api/shelters');
      setShelters(response.data);
    } catch (error) {
      console.error('Error fetching shelters:', error);
    }
  };

  const deleteShelter = async (id) => {
    try {
      await axios.delete(`http://192.168.56.1:3000/api/shelters/${id}`);
      Alert.alert('Success', 'Shelter deleted successfully');
      
      fetchShelters();
    } catch (error) {
      console.error('Error deleting shelter:', error);
      Alert.alert('Error', 'Failed to delete shelter. Please try again.');
    }
  };

  const renderShelter = ({ item }) => (
    <View style={styles.shelterItem}>
      <View style={styles.shelterInfo}>
        <Text style={styles.shelterName}>Name: {item.Name}</Text>
        <Text style={styles.shelterDetails}>Lat: {item.Latitude}</Text>
        <Text style={styles.shelterDetails}>Lon: {item.Longitude}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteShelter(item.ID)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shelters</Text>
      <FlatList
        data={shelters}
        keyExtractor={(item) => item.ID.toString()}
        renderItem={renderShelter}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  shelterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
  },
  shelterInfo: {
    flex: 1,
  },
  shelterName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shelterDetails: {
    fontSize: 14,
    color: '#555',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#27ae60',
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Shelters;