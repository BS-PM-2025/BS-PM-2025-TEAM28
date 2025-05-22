import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, Platform, PermissionsAndroid, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ShelterMapScreen = () => {
  const mapRef = useRef(null);
  const [region, setRegion] = useState({
    latitude: 31.2600,
    longitude: 34.7693,
    latitudeDelta: 0.0222,
    longitudeDelta: 0.0121,
  });

  const [userLocation, setUserLocation] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

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
        console.log('Got location:', position);
        const { latitude, longitude } = position.coords;
        
        if (latitude >= 29.5 && latitude <= 33.3 && longitude >= 34.2 && longitude <= 35.9) {
          const userLoc = { latitude, longitude };
          setUserLocation(userLoc);
          
          // Adjusted zoom level to show more area
          const zoomLevel = 0.008; // Less zoom for wider view
          setRegion({
            latitude,
            longitude,
            latitudeDelta: zoomLevel,
            longitudeDelta: zoomLevel * 0.5,
          });

          // Find and route to nearest shelter
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
        } else {
          console.warn('Location outside Israel bounds:', { latitude, longitude });
          Alert.alert(
            'אזהרת מיקום',
            'נראה שאתה מחוץ לישראל. המפה תתמקד בבאר שבע.'
          );
          setRegion({
            latitude: 31.2600,
            longitude: 34.7693,
            latitudeDelta: 0.0222,
            longitudeDelta: 0.0121,
          });
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

    // Start watching position for continuous updates
    Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
      },
      (error) => console.log('Location watch error:', error),
      config
    );
  };

  const fitToRoute = (points) => {
    if (!points || points.length === 0) return;

    const coords = points.map(point => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }));

    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: {
        top: 100,
        right: 100,
        bottom: 100,
        left: 100
      },
      animated: true,
    });

    // Add a slight delay then zoom in a bit for better view
    setTimeout(() => {
      if (mapRef.current) {
        const currentRegion = mapRef.current.__lastRegion;
        if (currentRegion) {
          const newRegion = {
            ...currentRegion,
            latitudeDelta: currentRegion.latitudeDelta * 0.8, // Zoom in by 20%
            longitudeDelta: currentRegion.latitudeDelta * 0.8 * 0.5,
          };
          mapRef.current.animateToRegion(newRegion, 300);
        }
      }
    }, 1000);
  };

  const formatDuration = (duration) => {
    // Convert "X mins" to "X דקות"
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
    // Convert "X km" or "X m" to Hebrew format
    const kmMatch = distance.match(/(\d+\.?\d*)\s*km/);
    const mMatch = distance.match(/(\d+)\s*m/);
    
    if (kmMatch) {
      return `${kmMatch[1]} ק"מ`;
    } else if (mMatch) {
      return `${mMatch[1]} מטר`;
    }
    return distance;
  };

  const fetchRoute = async (origin, destination) => {
    try {
      console.log('=== FETCHING ROUTE ===');
      console.log('Origin:', origin);
      console.log('Destination:', destination);

      if (!origin || !destination) {
        console.error('Missing coordinates:', { origin, destination });
        Alert.alert('שגיאה', 'חסרים נתוני מיקום');
        return;
      }

      const originStr = `${origin.latitude},${origin.longitude}`;
      const destinationStr = `${destination.latitude},${destination.longitude}`;
      
      console.log('=== API REQUEST ===');
      console.log('Origin string:', originStr);
      console.log('Destination string:', destinationStr);
      
      const url = `http://10.0.2.2:3000/api/directions?origin=${originStr}&destination=${destinationStr}&mode=walking`;
      console.log('Request URL:', url);
      
      const response = await axios.get(url);
      console.log('=== API RESPONSE ===');
      console.log('Status:', response.data.status);

      if (response.data.success && response.data.route.status === 'OK') {
        const points = response.data.route.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points);
        
        console.log('=== DECODED ROUTE ===');
        console.log('First point:', decodedPoints[0]);
        console.log('Last point:', decodedPoints[decodedPoints.length - 1]);
        
        const route = response.data.route.routes[0].legs[0];
        setRouteInfo({
          distance: formatDistance(route.distance.text),
          duration: formatDuration(route.duration.text)
        });

        setRoute(decodedPoints);
        
        if (mapRef.current && decodedPoints.length > 0) {
          const edgePadding = {
            top: 100,    // Increased padding
            right: 100,  // Increased padding
            bottom: 100, // Increased padding
            left: 100    // Increased padding
          };
          
          // Add some extra points around the route to ensure wider view
          const routePoints = [...decodedPoints];
          const firstPoint = routePoints[0];
          const lastPoint = routePoints[routePoints.length - 1];
          
          // Add points slightly outside the route bounds
          const padding = 0.001; // Adjust this value to change how much extra area to show
          routePoints.push({
            latitude: firstPoint.latitude + padding,
            longitude: firstPoint.longitude + padding
          });
          routePoints.push({
            latitude: lastPoint.latitude - padding,
            longitude: lastPoint.longitude - padding
          });
          
          mapRef.current.fitToCoordinates(routePoints, {
            edgePadding,
            animated: true
          });
        }
      } else {
        const errorMessage = response.data.message || response.data.error || 'שגיאה לא ידועה';
        console.error('Route API error:', errorMessage);
        Alert.alert('שגיאת מסלול', `לא ניתן למצוא מסלול: ${errorMessage}`);
      }
    } catch (err) {
      console.error('=== ERROR ===');
      console.error('Error details:', err);
      Alert.alert('שגיאה', 'לא הצלחנו למצוא מסלול. בדוק את הלוג לפרטים נוספים.');
    }
  };

  const decodePolyline = (encoded) => {
    if (!encoded) return [];

    let poly = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    try {
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

        const finalLat = lat * 1e-5;
        const finalLng = lng * 1e-5;

        if (isValidCoordinate(finalLat, finalLng)) {
          poly.push({
            latitude: finalLat,
            longitude: finalLng,
          });
        }
      }
    } catch (error) {
      console.error('Error decoding polyline:', error);
      return [];
    }

    return poly;
  };

  const isValidCoordinate = (lat, lng) => {
    // Validate coordinates are within reasonable bounds for Israel
    const isLatValid = lat >= 29.5 && lat <= 33.3;
    const isLngValid = lng >= 34.2 && lng <= 35.9;
    
    if (!isLatValid || !isLngValid) {
      console.warn('Coordinate out of bounds:', { lat, lng });
      return false;
    }
    
    return true;
  };

  const handleMarkerPress = (shelter) => {
    setRoute(null);
    setSelectedShelter(shelter);
    if (userLocation) {
      const origin = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      };
      
      const destination = {
        latitude: parseFloat(shelter.Latitude),
        longitude: parseFloat(shelter.Longitude)
      };

      fetchRoute(origin, destination);
    } else {
      Alert.alert('נדרש מיקום', 'אנא אפשר גישה למיקום כדי לראות את המסלול למקלט.');
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      const newDelta = Math.max(region.latitudeDelta * 0.7, 0.002); // Prevent over-zooming
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

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        console.log('Fetching shelters...');
        const response = await axios.get('http://10.0.2.2:3000/api/shelters');
        console.log('Shelters response:', response.data);
        
        if (response.data.success && response.data.shelters) {
          const formattedShelters = response.data.shelters.map(shelter => ({
            ...shelter,
            Latitude: parseFloat(shelter.Latitude),
            Longitude: parseFloat(shelter.Longitude)
          }));
          console.log('Formatted shelters:', formattedShelters);
          setShelters(formattedShelters);
          
          // If we have user location, find and route to nearest shelter
          if (userLocation) {
            const nearest = findNearestShelter(userLocation, formattedShelters);
            if (nearest) {
              setSelectedShelter(nearest);
              fetchRoute(userLocation, {
                latitude: parseFloat(nearest.Latitude),
                longitude: parseFloat(nearest.Longitude)
              });
            }
          }
        } else {
          setError('התקבל פורמט נתונים לא תקין מהשרת');
        }
      } catch (err) {
        console.error('Error details:', err);
        setError(err.message);
        Alert.alert(
          'שגיאה',
          'לא הצלחנו לטעון את המקלטים. אנא בדוק את החיבור לאינטרנט ונסה שוב.'
        );
      } finally {
        setLoading(false);
      }
    };

    // Get location first, then fetch shelters
    getCurrentLocation().then(() => {
      fetchShelters();
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>טוען מקלטים...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>שגיאה: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        loadingEnabled={true}
        moveOnMarkerPress={false}
        followsUserLocation={false}
        userLocationUpdateInterval={1000}
        userLocationFastestInterval={1000}
        showsPointsOfInterest={false}
        toolbarEnabled={false}
        userLocationCalloutEnabled={true}
        userLocationPriority="high"
        userLocationAnnotationTitle=""
        onMapReady={() => {
          console.log('Map is ready');
          getCurrentLocation();
        }}
        customMapStyle={[
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ]}
      >
        {shelters.map((shelter) => (
          <Marker
            key={shelter.ID}
            coordinate={{
              latitude: parseFloat(shelter.Latitude),
              longitude: parseFloat(shelter.Longitude),
            }}
            title={`מקלט ${shelter.Name}`}
            onPress={() => handleMarkerPress(shelter)}
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
          <Icon name="add" size={28} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.zoomButton}
          onPress={handleZoomOut}
        >
          <Icon name="remove" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.myLocationButton}
        onPress={getCurrentLocation}
      >
        <Icon name="my-location" size={28} color="#e74c3c" />
      </TouchableOpacity>

      {routeInfo && selectedShelter && (
        <View style={styles.routeInfoContainer}>
          <Text style={styles.shelterName}>מקלט {selectedShelter.Name}</Text>
          <View style={styles.routeDetailsContainer}>
            <Icon name="directions-walk" size={24} color="#333" style={styles.routeIcon} />
            <View>
              <Text style={styles.routeInfoText}>מרחק: {routeInfo.distance}</Text>
              <Text style={styles.routeInfoText}>זמן הליכה: {routeInfo.duration}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
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
  myLocationButton: {
    position: 'absolute',
    right: 20,
    top: 20,
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
  routeDetailsContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 8,
  },
  routeIcon: {
    marginLeft: 12,
  },
  zoomButtonsContainer: {
    position: 'absolute',
    right: 20,
    top: 80,
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
});

export default ShelterMapScreen; 