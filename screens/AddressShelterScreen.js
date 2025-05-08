import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const AddressShelterScreen = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Copy from ShelterMapScreen.js
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const toRad = (value) => value * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearestShelter = (location, shelterList) => {
    if (!location || !shelterList || shelterList.length === 0) return null;
    return shelterList.reduce((nearest, shelter) => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        parseFloat(shelter.Latitude),
        parseFloat(shelter.Longitude)
      );
      if (!nearest || distance < nearest.distance) {
        return { shelter, distance };
      }
      return nearest;
    }, null)?.shelter;
  };

  const findShelterByAddress = async () => {
    if (!address.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס כתובת');
      return;
    }
    setLoading(true);
    try {
      // 1. Geocode the address
      const geocodeResponse = await axios.get(
        `http://10.0.2.2:3000/api/geocode?address=${encodeURIComponent(address)}`
      );
      if (!geocodeResponse.data.success) {
        throw new Error(geocodeResponse.data.error || 'שגיאה בהמרת הכתובת');
      }
      const { lat, lng } = geocodeResponse.data;
      if (lat < 29.5 || lat > 33.3 || lng < 34.2 || lng > 35.9) {
        Alert.alert('אזהרה', 'הכתובת שנכנסה נמצאת מחוץ לגבולות ישראל');
        setLoading(false);
        return;
      }
      // 2. Fetch shelters
      const sheltersResponse = await axios.get('http://10.0.2.2:3000/api/shelters');
      if (!sheltersResponse.data.success || !sheltersResponse.data.shelters) {
        throw new Error('שגיאה בטעינת רשימת המקלטים');
      }
      const shelters = sheltersResponse.data.shelters.map(shelter => ({
        ...shelter,
        Latitude: parseFloat(shelter.Latitude),
        Longitude: parseFloat(shelter.Longitude)
      }));
      // 3. Find nearest shelter
      const addressLocation = { latitude: lat, longitude: lng };
      const nearest = findNearestShelter(addressLocation, shelters);
      if (!nearest) {
        Alert.alert('שגיאה', 'לא נמצא מקלט קרוב לכתובת זו');
        setLoading(false);
        return;
      }
      // 4. Navigate to map with both locations
      navigation.navigate('ShelterMap', {
        initialLocation: addressLocation,
        searchByAddress: true,
        nearestShelter: {
          latitude: parseFloat(nearest.Latitude),
          longitude: parseFloat(nearest.Longitude),
          Name: nearest.Name,
          ID: nearest.ID
        }
      });
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('שגיאה', 'לא הצלחנו למצוא את הכתובת או את המקלט הקרוב. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const findShelterByCoordinates = async (lat, lng) => {
    setLoading(true);
    try {
      // 1. Fetch shelters
      const sheltersResponse = await axios.get('http://10.0.2.2:3000/api/shelters');
      if (!sheltersResponse.data.success || !sheltersResponse.data.shelters) {
        throw new Error('שגיאה בטעינת רשימת המקלטים');
      }
      const shelters = sheltersResponse.data.shelters.map(shelter => ({
        ...shelter,
        Latitude: parseFloat(shelter.Latitude),
        Longitude: parseFloat(shelter.Longitude)
      }));
      // 2. Find nearest shelter
      const addressLocation = { latitude: lat, longitude: lng };
      const nearest = findNearestShelter(addressLocation, shelters);
      if (!nearest) {
        Alert.alert('שגיאה', 'לא נמצא מקלט קרוב לכתובת זו');
        setLoading(false);
        return;
      }
      // 3. Navigate to map with both locations
      navigation.navigate('ShelterMap', {
        initialLocation: addressLocation,
        searchByAddress: true,
        nearestShelter: {
          latitude: parseFloat(nearest.Latitude),
          longitude: parseFloat(nearest.Longitude),
          Name: nearest.Name,
          ID: nearest.ID
        }
      });
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('שגיאה', 'לא הצלחנו למצוא את המקלט הקרוב. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.title}>חיפוש מקלט לפי כתובת</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="הכנס כתובת..."
          value={address}
          onChangeText={setAddress}
          textAlign="right"
          writingDirection="rtl"
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={findShelterByAddress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Icon name="search" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  inputContainer: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default AddressShelterScreen; 