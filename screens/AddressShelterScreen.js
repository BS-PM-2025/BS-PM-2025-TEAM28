import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';

function AddressShelterScreen({ navigation }) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: 31.2600,
    longitude: 34.7693,
    latitudeDelta: 0.0222,
    longitudeDelta: 0.0121,
  });
  const [shelters, setShelters] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [addressLocation, setAddressLocation] = useState(null);

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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRad = (value) => {
    return value * Math.PI / 180;
  };

  const handleSearch = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }

    setLoading(true);
    try {
      // First, get the coordinates for the address
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyDbv7vak9FAXNNZTPyqfIaxY9R2TGvy99o`
      );

      if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
        const location = geocodeResponse.data.results[0].geometry.location;
        const addressLoc = {
          latitude: location.lat,
          longitude: location.lng
        };
        setAddressLocation(addressLoc);

        // Update map region to show the address location
        setRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.0222,
          longitudeDelta: 0.0121,
        });

        // Fetch shelters
        const sheltersResponse = await axios.get('http://10.0.2.2:3000/api/shelters');
        if (sheltersResponse.data.success && sheltersResponse.data.shelters) {
          const formattedShelters = sheltersResponse.data.shelters.map(shelter => ({
            ...shelter,
            Latitude: parseFloat(shelter.Latitude),
            Longitude: parseFloat(shelter.Longitude)
          }));
          setShelters(formattedShelters);

          // Find nearest shelter
          const nearest = findNearestShelter(addressLoc, formattedShelters);
          if (nearest) {
            setSelectedShelter(nearest);
            fetchRoute(addressLoc, {
              latitude: parseFloat(nearest.Latitude),
              longitude: parseFloat(nearest.Longitude)
            });
          }
        }
      } else {
        Alert.alert('Error', 'Could not find the address');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to process the address');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoute = async (origin, destination) => {
    try {
      const originStr = `${origin.latitude},${origin.longitude}`;
      const destinationStr = `${destination.latitude},${destination.longitude}`;
      
      const response = await axios.get(
        `http://10.0.2.2:3000/api/directions?origin=${originStr}&destination=${destinationStr}&mode=walking`
      );

      if (response.data.success && response.data.route.status === 'OK') {
        const points = response.data.route.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points);
        
        const route = response.data.route.routes[0].legs[0];
        setRouteInfo({
          distance: formatDistance(route.distance.text),
          duration: formatDuration(route.duration.text)
        });

        setRoute(decodedPoints);
      }
    } catch (err) {
      console.error('Error fetching route:', err);
      Alert.alert('Error', 'Failed to fetch route information');
    }
  };

  const decodePolyline = (encoded) => {
    if (!encoded) return [];

    let poly = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({
        latitude: lat * 1e-5,
        longitude: lng * 1e-5,
      });
    }

    return poly;
  };

  const formatDuration = (duration) => {
    const match = duration.match(/(\d+)/);
    if (match) {
      const minutes = parseInt(match[0]);
      if (minutes === 1) {
        return 'דקה אחת';
      } else {
        return `${minutes} דקות`;
      }
    }
    return duration;
  };

  const formatDistance = (distance) => {
    const kmMatch = distance.match(/(\d+\.?\d*)\s*km/);
    const mMatch = distance.match(/(\d+)\s*m/);
    
    if (kmMatch) {
      return `${kmMatch[1]} ק"מ`;
    } else if (mMatch) {
      return `${mMatch[1]} מטר`;
    }
    return distance;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter address"
          value={address}
          onChangeText={setAddress}
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <MaterialIcons name="search" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        loadingEnabled={true}
        moveOnMarkerPress={false}
      >
        {addressLocation && (
          <Marker
            coordinate={addressLocation}
            title="Your Location"
            pinColor="blue"
          />
        )}
        {shelters.map((shelter) => (
          <Marker
            key={shelter.ID}
            coordinate={{
              latitude: parseFloat(shelter.Latitude),
              longitude: parseFloat(shelter.Longitude),
            }}
            title={`מקלט ${shelter.Name}`}
            pinColor={selectedShelter?.ID === shelter.ID ? "red" : "green"}
          />
        ))}
        {route && (
          <Polyline
            coordinates={route}
            strokeWidth={4}
            strokeColor="#4285F4"
            zIndex={2}
          />
        )}
      </MapView>

      {routeInfo && selectedShelter && (
        <View style={styles.routeInfoContainer}>
          <Text style={styles.shelterName}>מקלט {selectedShelter.Name}</Text>
          <View style={styles.routeDetailsContainer}>
            <MaterialIcons name="directions-walk" size={24} color="#333" style={styles.routeIcon} />
            <View>
              <Text style={styles.routeInfoText}>מרחק: {routeInfo.distance}</Text>
              <Text style={styles.routeInfoText}>זמן הליכה: {routeInfo.duration}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f8f9fa',
  },
  searchButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  map: {
    flex: 1,
  },
  routeInfoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  shelterName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'right',
  },
  routeInfoText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 2,
    textAlign: 'right',
  },
  routeDetailsContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 8,
  },
  routeIcon: {
    marginLeft: 12,
  },
});

export default AddressShelterScreen; 