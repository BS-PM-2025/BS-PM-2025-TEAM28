import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

function AddShelterScreen({ navigation }) {
  const [newShelter, setNewShelter] = useState({ name: '', latitude: '', longitude: '' });

  const allFieldsFilled =
    newShelter.name.trim() &&
    newShelter.latitude.trim() &&
    newShelter.longitude.trim();

  const addShelter = async () => {
    if (!allFieldsFilled) return;
    try {
      const response = await axios.post('http://10.0.2.2:3000/api/shelters', {
        Name: newShelter.name,
        Latitude: parseFloat(newShelter.latitude),
        Longitude: parseFloat(newShelter.longitude),
      });
      Alert.alert('Success', response.data.message);
      navigation.goBack();
    } catch (error) {
      console.error('Error adding shelter:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add shelter. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Shelter</Text>
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
      <TouchableOpacity
        style={[
          styles.saveButton,
          { backgroundColor: allFieldsFilled ? '#00e6a6' : '#bdbdbd' }
        ]}
        onPress={addShelter}
        disabled={!allFieldsFilled}
      >
        <Icon name="add" size={20} color="#fff" />
        <Text style={styles.saveButtonText}>Add</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: '#fff' },
  saveButton: {
    backgroundColor: '#00e6a6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0066e6',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#0066e6',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AddShelterScreen;