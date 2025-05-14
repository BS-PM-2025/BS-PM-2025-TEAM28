import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import AddressAutocomplete from '../components/AddressAutocomplete';

function AddressShelterScreen({ navigation }) {
  const mapRef = useRef(null);
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
    const R = 6371; 
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

  const handleAddressSelect = ({ address, location }) => {
    setAddress(address);
    setAddressLocation(location);
    setRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.0222,
      longitudeDelta: 0.0121,
    });
    
    // Fetch shelters after address selection
    fetchShelters(location);
  };

  const fetchShelters = async (location) => {
    setLoading(true);
    try {
      const sheltersResponse = await axios.get('http://10.0.2.2:3000/api/shelters');
      if (sheltersResponse.data.success && sheltersResponse.data.shelters) {
        const formattedShelters = sheltersResponse.data.shelters.map(shelter => ({
          ...shelter,
          Latitude: parseFloat(shelter.Latitude),
          Longitude: parseFloat(shelter.Longitude)
        }));
        setShelters(formattedShelters);

        // Find nearest shelter
        const nearest = findNearestShelter(location, formattedShelters);
        if (nearest) {
          setSelectedShelter(nearest);
          fetchRoute(location, {
            latitude: parseFloat(nearest.Latitude),
            longitude: parseFloat(nearest.Longitude)
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to fetch shelters');
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
        return '1 minute';
      } else {
        return `${minutes} minutes`;
      }
    }
    return duration;
  };

  const formatDistance = (distance) => {
    const kmMatch = distance.match(/(\d+\.?\d*)\s*km/);
    const mMatch = distance.match(/(\d+)\s*m/);
    
    if (kmMatch) {
      return `${kmMatch[1]} km`;
    } else if (mMatch) {

      const meters = parseInt(mMatch[1]);
      if (meters >= 1000) {
        return `${(meters / 1000).toFixed(2)} km`;
      } else {
        return `${meters} m`;
      }
    }
    return distance;
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      const newDelta = Math.max(region.latitudeDelta * 0.7, 0.002); // Prevent max zoom in
      const newRegion = {
        ...region,
        latitudeDelta: newDelta,
        longitudeDelta: newDelta * 0.5,
      };
      setRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const newDelta = Math.min(region.latitudeDelta * 1.3, 0.1); // Limit max zoom out
      const newRegion = {
        ...region,
        latitudeDelta: newDelta,
        longitudeDelta: newDelta * 0.5,
      };
      setRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Precise Location Permission',
            message: 'This app needs access to your precise location to find the nearest shelter.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Error requesting location permission:', err);
        return false;
      }
    }
    return true;
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('הרשאה נדחתה', 'נדרשת הרשאת מיקום כדי להציג את מיקומך על המפה.');
      return;
    }

    const config = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
      distanceFilter: 5,
      useSignificantChanges: false,
      interval: 1000,
      fastestInterval: 1000
    };

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userLoc = { latitude, longitude };
        setAddressLocation(userLoc);
        
        const zoomLevel = 0.008;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: zoomLevel,
          longitudeDelta: zoomLevel * 0.5,
        });

        if (shelters.length > 0) {
          const nearest = findNearestShelter(userLoc, shelters);
          if (nearest) {
            setSelectedShelter(nearest);
            fetchRoute(userLoc, {
              latitude: parseFloat(nearest.Latitude),
              longitude: parseFloat(nearest.Longitude)
            });
          }
        }
      },
      (error) => {
        console.error('Location error:', error);
        Alert.alert(
          'שגיאת מיקום',
          'לא הצלחנו לקבל את מיקומך. אנא ודא שהגישה למיקום מופעלת.'
        );
      },
      config
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <AddressAutocomplete
          onSelectAddress={handleAddressSelect}
          placeholder="Enter address..."
        />
        {loading && <ActivityIndicator style={styles.loader} />}
      </View>

      <MapView
        ref={mapRef}
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

      <View style={styles.zoomButtonsContainer}>
        <TouchableOpacity 
          style={styles.zoomButton}
          onPress={handleZoomIn}
        >
          <MaterialIcons name="add" size={28} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.zoomButton}
          onPress={handleZoomOut}
        >
          <MaterialIcons name="remove" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.myLocationButton}
        onPress={getCurrentLocation}
      >
        <MaterialIcons name="my-location" size={28} color="#e74c3c" />
      </TouchableOpacity>

      {routeInfo && selectedShelter && (
        <View style={styles.routeInfoContainer}>
          <Text style={styles.shelterName}>מקלט {selectedShelter.Name}</Text>
          <View style={styles.routeDetailsContainer}>
            <MaterialIcons name="directions-walk" size={24} color="#333" style={styles.routeIcon} />
            <View>
              <Text style={styles.routeInfoText}>Distance: {routeInfo.distance}</Text>
              <Text style={styles.routeInfoText}>Estimated walking time: {routeInfo.duration}</Text>
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
    elevation: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
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
  myLocationButton: {
    position: 'absolute',
    right: 20,
    top: 160,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  zoomButtonsContainer: {
    position: 'absolute',
    right: 20,
    top: 220,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  zoomButton: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddressShelterScreen; 