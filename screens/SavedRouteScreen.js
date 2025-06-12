import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function SavedRouteScreen({ route, navigation }) {
  const user = route?.params?.user;
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!user || user.UserType !== 'Tourist') return;
      try {
        const res = await axios.get(`http://10.0.2.2:3000/api/saved-routes/${user.ID}`);
        if (res.data.success) setRoutes(res.data.routes);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, [user]);

  const handleDeleteRoute = async (routeId) => {
    try {
      await axios.delete(`http://10.0.2.2:3000/api/saved-routes/${routeId}`);
      setRoutes(prev => prev.filter(r => r.ID !== routeId));
    } catch (err) {
      Alert.alert(t('common:error'), t('savedRoute:failedToDeleteRoute'));
    }
  };

  if (!user || user.UserType !== 'Tourist') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{t('savedRoute:onlyTourists')}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066e6" />
      </View>
    );
  }

  if (routes.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{t('savedRoute:noSavedRoutes')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={routes}
        keyExtractor={item => item.ID?.toString()}
      renderItem={({ item }) => (
  <View style={styles.routeItemRow}>
    <TouchableOpacity
      style={{ flex: 1 }}
      activeOpacity={0.7}
      onPress={() => {
        navigation.navigate('AddressShelter', {
          user,
          address: item.AddressText,
        });
      }}
    >
      <Text style={styles.routeTitle}>{t('savedRoute:to')} {item.ToShelterName}</Text>
      <Text style={styles.routeDetails}>
        {t('savedRoute:from')} {item.FromLatitude}, {item.FromLongitude}
      </Text>
      {/* Show the address the user typed */}
      <Text style={styles.routeDetails}>
        {t('savedRoute:address')} {item.AddressText}
      </Text>
      <Text style={styles.routeDetails}>
        {t('savedRoute:date')} {new Date(item.DateSaved).toLocaleString()}
      </Text>
      <Text style={styles.routeLink}>{t('savedRoute:viewRoute')}</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.deleteButtonInline}
      activeOpacity={0.8}
      onPress={() => {
        Alert.alert(
          t('savedRoute:deleteRouteTitle'),
          t('savedRoute:deleteRouteMessage'),
          [
            { text: t('savedRoute:cancel'), style: 'cancel' },
            { text: t('savedRoute:delete'), style: 'destructive', onPress: () => handleDeleteRoute(item.ID) }
          ]
        );
      }}
      testID={`delete-route-${item.ID}`}
    >
      <Text style={styles.deleteButtonText}>{t('savedRoute:delete')}</Text>
    </TouchableOpacity>
  </View>
)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  text: { fontSize: 20, textAlign: 'center', marginTop: 40, color: '#2c3e50' },
  routeItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f2f6ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  routeTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  routeDetails: { fontSize: 14, color: '#555' },
  routeLink: { color: '#0066e6', marginTop: 8, fontWeight: 'bold', fontSize: 15 },
  deleteButtonInline: {
    padding: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});