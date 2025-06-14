import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

function Shelters({ navigation, route }) {
  const { darkMode } = useSettings();
  const { t } = useTranslation();
  const [shelters, setShelters] = useState([]);

  // Use useFocusEffect to refresh when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchShelters();
    }, [])
  );

  // Also check for refresh parameter from navigation
  useEffect(() => {
    if (route.params?.refresh) {
      fetchShelters();
      // Clear the refresh parameter
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);

  const fetchShelters = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:3000/api/shelters');
      setShelters(response.data.shelters);
    } catch (error) {
      console.error('Error fetching shelters:', error);
      Alert.alert('Error', 'Failed to fetch shelters. Please try again.');
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
    <View style={[styles.shelterItem, darkMode && styles.shelterItemDark]}>
      <View style={styles.shelterInfo}>
        <Text style={[styles.shelterName, darkMode && styles.shelterNameDark]}>Name: {item.Name}</Text>
        <Text style={[styles.shelterDetails, darkMode && styles.shelterDetailsDark]}>Lat: {item.Latitude}</Text>
        <Text style={[styles.shelterDetails, darkMode && styles.shelterDetailsDark]}>Lon: {item.Longitude}</Text>
      </View>
      <TouchableOpacity
        onPress={() => deleteShelter(item.ID)}
        style={{ padding: 10 }}
        testID={`delete-shelter-${item.ID}`}
      >
        <Icon name="delete" size={24} color={darkMode ? '#fff' : '#000'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <Text style={[styles.title, darkMode && styles.titleDark]}>Shelters</Text>

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
        style={styles.list}
      />

      <TouchableOpacity
        style={[styles.button, styles.outlineButton, darkMode && styles.outlineButtonDark]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.outlineButtonText, darkMode && styles.outlineButtonTextDark]}>Back</Text>
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
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  titleDark: {
    color: '#fff',
  },
  list: {
    flex: 1,
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
  outlineButtonDark: {
    borderColor: '#fff',
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
  outlineButtonTextDark: {
    color: '#fff',
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
  shelterItemDark: {
    backgroundColor: '#2c2c2c',
    borderColor: '#404040',
  },
  shelterInfo: {
    flex: 1,
  },
  shelterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  shelterNameDark: {
    color: '#fff',
  },
  shelterDetails: {
    fontSize: 14,
    color: '#555',
  },
  shelterDetailsDark: {
    color: '#ccc',
  },
});

export default Shelters;