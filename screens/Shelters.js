import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

function Shelters({ navigation }) {
  const [shelters, setShelters] = useState([]);

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:3000/api/shelters');
      setShelters(response.data.shelters);
    } catch (error) {
      console.error('Error fetching shelters:', error);
    }
  };

  const deleteShelter = async (id) => {
    try {
      await axios.delete(`http://10.0.2.2:3000/api/shelters/${id}`);
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
  onPress={() => deleteShelter(item.ID)}
  style={{ padding: 10 }}
  testID={`delete-shelter-${item.ID}`}
>
  <Icon name="delete" size={24} color="black" />
</TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shelters</Text>

<TouchableOpacity
  style={[styles.button, styles.blueButton]}
  onPress={() => navigation.navigate('AddShelter')}
  testID="addShelterNavButton"
>
  <Icon name="add" size={24} color="#fff" style={{ marginRight: 8 }} />
  <Text style={styles.buttonText}>Add Shelter</Text>
</TouchableOpacity>

      <FlatList
        data={shelters}
        keyExtractor={(item) => item.ID.toString()}
        renderItem={renderShelter}
      />

      <TouchableOpacity
        style={[styles.button, styles.outlineButton]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.outlineButtonText}>Back</Text>
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
  button: {
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  blueButton: {
    backgroundColor: '#0066e6',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0066e6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineButtonText: {
    color: '#0066e6',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default Shelters;