import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, Platform, PermissionsAndroid, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

const ShelterMapScreen = () => {
  const mapRef = useRef(null);
  const { mapType, formatDistance, darkMode, language } = useSettings();
  const { t } = useTranslation();

  useEffect(() => {
    console.log('Current language:', language);
    console.log('Translated distance label:', t('shelterMap:distanceLabel'));
    console.log('Translated estimated walking time label:', t('shelterMap:estimatedWalkingTimeLabel'));
  }, [language]);

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

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: t('shelterMap:preciseLocationPermissionTitle'),
            message: t('shelterMap:preciseLocationPermissionMessage'),
            buttonNeutral: t('shelterMap:askMeLater'),
            buttonNegative: t('shelterMap:cancel'),
            buttonPositive: t('shelterMap:ok'),
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
      Alert.alert(t('common:permissionDenied'), t('common:locationPermissionRequired'));
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
        } else {
          console.warn('Location outside Israel bounds:', { latitude, longitude });
          Alert.alert(
            t('common:locationWarning'),
            t('common:outsideIsrael')
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
          t('common:locationError'),
          t('common:failedToGetLocation')
        );
      },
      config
    );

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

    setTimeout(() => {
      if (mapRef.current) {
        const currentRegion = mapRef.current.__lastRegion;
        if (currentRegion) {
          const newRegion = {
            ...currentRegion,
            latitudeDelta: currentRegion.latitudeDelta * 0.8,
            longitudeDelta: currentRegion.latitudeDelta * 0.8 * 0.5,
          };
          mapRef.current.animateToRegion(newRegion, 300);
        }
      }
    }, 1000);
  };

  const formatDuration = (duration) => {
    const hoursMatch = duration.match(/(\d+)\s*hour/);
    const minutesMatch = duration.match(/(\d+)\s*min/);

    let hours = 0;
    let minutes = 0;

    if (hoursMatch) {
      hours = parseInt(hoursMatch[1]);
    }
    if (minutesMatch) {
      minutes = parseInt(minutesMatch[1]);
    }

    if (hours === 0 && minutes === 0) {
      return duration; // Return original if no valid duration found
    }

    let formattedString = '';
    if (hours > 0) {
      formattedString += hours === 1 ? t('common:oneHour') : t('common:hours', { count: hours });
    }

    if (minutes > 0) {
      if (formattedString !== '') {
        formattedString += ' ';
      }
      formattedString += minutes === 1 ? t('common:oneMinute') : t('common:minutes', { count: minutes });
    }

    return formattedString;
  };

  const fetchRoute = async (origin, destination) => {
    try {
      console.log('=== FETCHING ROUTE ===');
      console.log('Origin:', origin);
      console.log('Destination:', destination);

      if (!origin || !destination) {
        console.error('Missing coordinates:', { origin, destination });
        Alert.alert(t('common:error'), t('common:missingLocationData'));
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
          distance: formatDistance(parseInt(route.distance.value)),
          duration: formatDuration(route.duration.text)
        });
        console.log('Raw duration text from API:', route.duration.text);

        setRoute(decodedPoints);
        
        if (mapRef.current && decodedPoints.length > 0) {
          const edgePadding = {
            top: 100,    
            right: 100,  
            bottom: 100, 
            left: 100    
          };
          
          const routePoints = [...decodedPoints];
          const firstPoint = routePoints[0];
          const lastPoint = routePoints[routePoints.length - 1];
          
          const padding = 0.001; 
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
        const errorMessage = response.data.message || t('common:error');
        console.error('Route API error:', errorMessage);
        Alert.alert(t('common:error'), errorMessage);
      }
    } catch (err) {
      console.error('=== ERROR ===');
      console.error('Error details:', err);
      Alert.alert(t('common:error'), t('common:missingLocationData'));
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

      const finalLat = lat * 1e-5;
      const finalLng = lng * 1e-5;

      if (finalLat >= 29.5 && finalLat <= 33.3 && finalLng >= 34.2 && finalLng <= 35.9) {
        poly.push({
          latitude: finalLat,
          longitude: finalLng,
        });
      } else {
        console.warn('Invalid coordinate in polyline:', { lat: finalLat, lng: finalLng });
      }
    }

    return poly;
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
      Alert.alert(t('common:permissionDenied'), t('common:locationPermissionRequired'));
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      const newDelta = Math.max(region.latitudeDelta * 0.7, 0.002);
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
      const newDelta = Math.min(region.latitudeDelta * 1.3, 0.1);
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
          setError(t('common:error'));
        }
      } catch (err) {
        console.error('Error details:', err);
        setError(err.message);
        Alert.alert(
          t('common:error'),
          t('shelterReport:failedToLoadShelters')
        );
      } finally {
        setLoading(false);
      }
    };

    getCurrentLocation().then(() => {
      fetchShelters();
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>{t('shelterMap:loadingMap')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('common:error')}: {error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={false}
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
        mapType={mapType === 'satellite' ? 'satellite' : 'standard'}
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
        {userLocation && (
          <Marker
            coordinate={userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            zIndex={5}
          >
            <View style={styles.userLocationOuterCircle}>
              <View style={styles.userLocationInnerCircle} />
            </View>
          </Marker>
        )}
        {shelters.map((shelter) => (
          
          <Marker
          
            key={shelter.ID}
            coordinate={{
              latitude: parseFloat(shelter.Latitude),
              longitude: parseFloat(shelter.Longitude),
            }}
            
            title={`מקלט ${shelter.Name}`}
            onPress={() => handleMarkerPress(shelter)}
            pinColor= "#0051D1"
          >
            
            {selectedShelter && selectedShelter.ID === shelter.ID && (
              <Icon 
                name="location-on" 
                size={40}
                color="#E53935" 
                style={{marginBottom: 40}}
              />
            )}
          </Marker>
          
        ))}
        {route && (
            <Polyline
              coordinates={route}
              strokeWidth={5}
              strokeColor="#4285F4"
              zIndex={2}
            />
          )}
      </MapView>
      
      <View style={styles.zoomButtonsContainer}>
        <TouchableOpacity 
          style={[styles.zoomButton, darkMode && styles.zoomButtonDark]}
          onPress={handleZoomIn}
        >
          <Icon name="add" size={28} color={darkMode ? '#fff' : '#333'} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.zoomButton, darkMode && styles.zoomButtonDark]}
          onPress={handleZoomOut}
        >
          <Icon name="remove" size={28} color={darkMode ? '#fff' : '#333'} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.myLocationButton, darkMode && styles.myLocationButtonDark]}
        onPress={getCurrentLocation}
      >
        <Icon name="my-location" size={28} color="#e74c3c" />
      </TouchableOpacity>

      {selectedShelter && routeInfo && (
        <View style={[styles.routeInfoContainer, darkMode && styles.routeInfoContainerDark]}>
          <Text style={[styles.shelterName, darkMode && styles.textDark]}>
            {t('common:shelter')} {selectedShelter.Name}
          </Text>
          <View style={[styles.routeDetailsContainer, language === 'he' && styles.routeDetailsContainerRTL]}>
            <Icon name="directions-walk" size={24} color={darkMode ? '#fff' : '#333'} style={language === 'he' ? styles.routeIconRTL : styles.routeIcon} />
            <View>
              <Text style={[styles.routeInfoText, darkMode && styles.textDark, language === 'he' && styles.rtlText]}>
                <Text style={[styles.routeInfoLabel, darkMode && styles.textDark, language === 'he' && styles.rtlText]}>{t('shelterMap:distanceLabel')}</Text>
                {routeInfo.distance}
              </Text>
              <Text style={[styles.routeInfoText, darkMode && styles.textDark, language === 'he' && styles.rtlText]}>
                <Text style={[styles.routeInfoLabel, darkMode && styles.textDark, language === 'he' && styles.rtlText]}>{t('shelterMap:estimatedWalkingTimeLabel')}</Text>
                {routeInfo.duration}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  userLocationOuterCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#6F9CDE',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
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
  routeInfoContainerDark: {
    backgroundColor: 'rgba(44, 44, 44, 0.95)',
  },
  textDark: {
    color: '#fff',
  },
  routeInfoLabel: {
    fontWeight: 'bold',
  },
  shelterName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'left',
  },
  shelterNameDark: {
    color: '#fff',
  },
  routeInfoText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 2,
    textAlign: 'left',
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
  myLocationButtonDark: {
    backgroundColor: '#2c2c2c',
  },
  routeDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  routeDetailsContainerRTL: {
    flexDirection: 'row-reverse',
  },
  routeIcon: {
    marginRight: 12,
  },
  routeIconRTL: {
    marginLeft: 12,
    marginRight: 0,
  },
  zoomButtonsContainer: {
    position: 'absolute',
    right: 26,
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
  zoomButtonDark: {
    backgroundColor: '#2c2c2c',
  },
  rtlText: {
    textAlign: 'right',
  },
});

export default ShelterMapScreen;