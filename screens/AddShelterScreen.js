import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

function AddShelterScreen({ navigation }) {
  const [newShelter, setNewShelter] = useState({ name: '', latitude: '', longitude: '' });
  const { t } = useTranslation();

  const allFieldsFilled =
    newShelter.name.trim() &&
    newShelter.latitude.trim() &&
    newShelter.longitude.trim();

  const addShelter = async () => {
    if (!allFieldsFilled) {
      Alert.alert(t('addShelter:allFieldsRequired'));
      return;
    }
    try {
      const response = await axios.post('http://10.0.2.2:3000/api/shelters', {
        Name: newShelter.name,
        Latitude: parseFloat(newShelter.latitude),
        Longitude: parseFloat(newShelter.longitude),
      });
      Alert.alert(t('addShelter:successTitle'), response.data.message);
      navigation.goBack();
    } catch (error) {
      console.error('Error adding shelter:', error);
      Alert.alert(t('common:error'), error.response?.data?.message || t('addShelter:failedToAddShelter'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('addShelter:title')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('addShelter:shelterNamePlaceholder')}
        value={newShelter.name}
        onChangeText={(text) => setNewShelter({ ...newShelter, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder={t('addShelter:latitudePlaceholder')}
        keyboardType="numeric"
        value={newShelter.latitude}
        onChangeText={(text) => setNewShelter({ ...newShelter, latitude: text })}
      />
      <TextInput
        style={styles.input}
        placeholder={t('addShelter:longitudePlaceholder')}
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
        <Text style={styles.saveButtonText}>{t('addShelter:add')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>{t('addShelter:cancel')}</Text>
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