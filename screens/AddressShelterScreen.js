import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { useSettings } from '../contexts/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';



function AddressShelterScreen({ navigation, route }) {
  const user = route?.params?.user;
  const mapRef = useRef(null);
  const { mapType, formatDistance, darkMode } = useSettings();
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
 const [routeData, setRouteData] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [addressLocation, setAddressLocation] = useState(null);
 const passedAddress = route?.params?.address;
 const geocodeAddress = async (addressText) => {
  try {
    const res = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressText)}&key=AIzaSyDbv7vak9FAXNNZTPyqfIaxY9R2TGvy99o`
    );
    if (res.data.results && res.data.results.length > 0) {
      const location = res.data.results[0].geometry.location;
      handleAddressSelect({
        address: addressText,
        location: {
          latitude: location.lat,
          longitude: location.lng,
        },
      });
    }
  } catch (err) {
    console.error('Geocoding failed:', err);
  }
};

 useEffect(() => {
  if (passedAddress) {
    setAddress(passedAddress);
    // Geocode the address to get coordinates, then trigger handleAddressSelect
    geocodeAddress(passedAddress);
  }
}, [passedAddress]);


  const isLoadedFromSaved = !!route?.params?.routeData;
   const passedAddressLocation = route?.params?.addressLocation;
  const passedSelectedShelter = route?.params?.selectedShelter;
  const passedRouteData = route?.params?.routeData;

 useEffect(() => {
  if (passedAddressLocation) setAddressLocation(passedAddressLocation);
  if (passedSelectedShelter) setSelectedShelter(passedSelectedShelter);
  if (passedRouteData) setRouteData(passedRouteData);

  if (isLoadedFromSaved && passedRouteData && passedSelectedShelter && passedAddressLocation) {
    const distance = calculateDistance(
      passedAddressLocation.latitude,
      passedAddressLocation.longitude,
      parseFloat(passedSelectedShelter.Latitude),
      parseFloat(passedSelectedShelter.Longitude)
    );
    setRouteInfo({
      distance: formatDistance(distance * 1000),
      duration: '', // Optional: estimate or leave blank
    });

    // Center map on route
    if (passedRouteData.length > 0) {
      const lats = passedRouteData.map(p => p.latitude);
      const lngs = passedRouteData.map(p => p.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      setRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(0.01, (maxLat - minLat) * 1.5),
        longitudeDelta: Math.max(0.01, (maxLng - minLng) * 1.5),
      });
    }
  }
}, [route]);

  useEffect(() => {
  if (selectedShelter && addressLocation && !isLoadedFromSaved) {
    // Only fetch route if not loaded from saved
    const timeout = setTimeout(() => {
      fetchRoute(addressLocation, {
        latitude: parseFloat(selectedShelter.Latitude),
        longitude: parseFloat(selectedShelter.Longitude)
      });
    }, 50);
    return () => clearTimeout(timeout);
  }
}, [selectedShelter, addressLocation, isLoadedFromSaved]);
  

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
          distance: formatDistance(parseInt(route.distance.value)),
          duration: formatDuration(route.duration.text)
        });

        setRouteData(decodedPoints);
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
const handleSaveRoute = async () => {
  try {
    const savedRoute = {
      userId: user.ID,
      from: addressLocation,
      to: {
        id: selectedShelter.ID,
        name: selectedShelter.Name,
        latitude: selectedShelter.Latitude,
        longitude: selectedShelter.Longitude,
      },
      route: routeData,
      addressText: address, // <-- Add this line
    };
    await axios.post('http://10.0.2.2:3000/api/saved-routes', savedRoute);
    Alert.alert('הצלחה', 'המסלול נשמר!');
  } catch (err) {
    Alert.alert('שגיאה', 'לא ניתן לשמור את המסלול');
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
    
    <View style={[styles.container, darkMode && styles.containerDark]}>
      {user?.UserType === 'Tourist' && routeData && addressLocation && selectedShelter && (
  <TouchableOpacity
    style={styles.saveRouteButton}
    onPress={handleSaveRoute}
  >
    <MaterialIcons name="bookmark" size={20} color="#fff" />
    <Text style={styles.saveRouteButtonText}>שמור מסלול זה</Text>
  </TouchableOpacity>
)}
      <View style={[styles.searchContainer, darkMode && styles.searchContainerDark]}>
        <AddressAutocomplete
        value={address} 
          onSelectAddress={handleAddressSelect}
          placeholder="Enter address..."
          darkMode={darkMode}
        />
        {loading && <ActivityIndicator style={styles.loader} color={darkMode ? '#fff' : '#000'} />}
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
        mapType={mapType === 'satellite' ? 'satellite' : 'standard'}
      >
        {addressLocation && (
          <Marker
            coordinate={addressLocation}
            anchor={{ x: 0.5, y: 0.5 }} 
            flat={true} 
            zIndex={5} 
          >
            <View style={styles.userLocationOuterCircle}>
              <View style={styles.userLocationInnerCircle} />
            </View>
          </Marker>
        )}
        {shelters.map((shelter) => {
          const isSelected = selectedShelter && String(selectedShelter.ID) === String(shelter.ID);
          console.log('Comparing', String(selectedShelter?.ID), 'to', String(shelter.ID), '=>', isSelected);
          return (
            <Marker
              key={`${shelter.ID}-${isSelected}`}
              coordinate={{
                latitude: parseFloat(shelter.Latitude),
                longitude: parseFloat(shelter.Longitude),
              }}
              title={`מקלט ${shelter.Name}`}
              pinColor={isSelected ? "#E53935" : "#0055D1"}
              onPress={() => {
                setSelectedShelter(shelter);
              }}
            />
          );
        })}
        {routeData && (
          <Polyline
            coordinates={routeData}
            strokeWidth={4}
            strokeColor="#4285F4"
            zIndex={2}
          />
        )}
      </MapView>

      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={[styles.fabButton, darkMode && styles.fabButtonDark]}
          onPress={getCurrentLocation}
        >
          <MaterialIcons name="my-location" size={28} color="#e74c3c" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.fabButton, darkMode && styles.fabButtonDark]}
          onPress={handleZoomIn}
        >
          <MaterialIcons name="add" size={28} color={darkMode ? '#fff' : '#333'} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.fabButton, darkMode && styles.fabButtonDark]}
          onPress={handleZoomOut}
        >
          <MaterialIcons name="remove" size={28} color={darkMode ? '#fff' : '#333'} />
        </TouchableOpacity>
      </View>

      {routeInfo && selectedShelter && (
        <View style={[styles.routeInfoContainer, darkMode && styles.routeInfoContainerDark]}>
          <Text style={[styles.shelterName, darkMode && styles.textDark]}>
            מקלט {selectedShelter.Name}
          </Text>
          <View style={styles.routeDetailsContainer}>
            <MaterialIcons name="directions-walk" size={24} color={darkMode ? '#fff' : '#333'} style={styles.routeIcon} />
            <View>
              <Text style={[styles.routeInfoText, darkMode && styles.textDark]}>
                <Text style={[styles.routeInfoLabel, darkMode && styles.textDark]}>מרחק : </Text>
                {routeInfo.distance}
              </Text>
              <Text style={[styles.routeInfoText, darkMode && styles.textDark]}>
                <Text style={[styles.routeInfoLabel, darkMode && styles.textDark]}>זמן הליכה משוער : </Text>
                {routeInfo.duration}
              </Text>
            </View>
          </View>
        </View>
      )}

     
    </View>
  );
}

const styles = StyleSheet.create({
  userLocationOuterCircle: { // This view creates the white stroke and applies shadow
    width: 22, //
    height: 22,
    borderRadius: 11, 
    backgroundColor: 'white', // color of the stroke
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow properties for iOS
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 3,   
    
    elevation: 4,
  },
  userLocationInnerCircle: { 
    width: 16, 
    height: 16,
    borderRadius: 8, 
    backgroundColor: '#6F9CDE', // 
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
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
  searchContainerDark: {
    backgroundColor: '#2c2c2c',
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
  routeInfoContainerDark: {
    backgroundColor: 'rgba(44, 44, 44, 0.95)',
  },
  textDark: {
    color: '#fff',
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
  fabContainer: {
    position: 'absolute',
    right: 20,
    top: 160,
    zIndex: 2,
    alignItems: 'center',
  },
  fabButton: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabButtonDark: {
    backgroundColor: '#2c2c2c',
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
  routeInfoLabel: {
    fontWeight: 'bold',
  },
   saveRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066e6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  saveRouteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
});

export default AddressShelterScreen; 