import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import axios from 'axios';

function Shelters({ navigation }) {
  const [shelters, setShelters] = useState([]);
  const [newShelter, setNewShelter] = useState({ name: '', latitude: '', longitude: '' });
  const [showAddPrompt, setShowAddPrompt] = useState(false);

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

  const addShelter = async () => {
    const { name, latitude, longitude } = newShelter;
  
    if (!name.trim() || !latitude.trim() || !longitude.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
  
    try {
      const response = await axios.post('http://10.0.2.2:3000/api/shelters', {
        Name: name,
        Latitude: parseFloat(latitude),
        Longitude: parseFloat(longitude),
      });
      Alert.alert('Success', response.data.message);
      setShowAddPrompt(false);
      setNewShelter({ name: '', latitude: '', longitude: '' });
      fetchShelters(); 
    } catch (error) {
      console.error('Error adding shelter:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add shelter. Please try again.');
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shelters</Text>

      {/*  Shelter Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddPrompt(true)}
      >
        <Text style={styles.addButtonText}>Add Shelter</Text>
      </TouchableOpacity>

      {/*  Shelter Prompt */}
      {showAddPrompt && (
        <View style={styles.addPrompt}>
          <TextInput
            style={styles.input}
            placeholder="Shelter Name"
            value={newShelter.name}
            onChangeText={(text) => setNewShelter({ ...newShelter, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Latitude"
            keyboardType="numeric"
            value={newShelter.latitude}
            onChangeText={(text) => setNewShelter({ ...newShelter, latitude: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Longitude"
            keyboardType="numeric"
            value={newShelter.longitude}
            onChangeText={(text) => setNewShelter({ ...newShelter, longitude: text })}
          />
          <TouchableOpacity style={styles.saveButton} onPress={addShelter}>
            <Text style={styles.saveButtonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowAddPrompt(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

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
  addButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addPrompt: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
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