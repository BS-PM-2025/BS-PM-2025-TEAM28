import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

function ShelterReportScreen({ navigation, route }) {
  const { user } = route.params;
  const { darkMode } = useSettings();
  const { t } = useTranslation();

  console.log('ShelterReportScreen - Dark Mode:', darkMode);

  const [loading, setLoading] = useState(false);
  const [shelters, setShelters] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [report, setReport] = useState({
    shelterName: '',
    shelterAddress: '',
    issueDescription: '',
    reporterName: user.Name,
    reporterEmail: user.Gmail,
  });

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:3000/api/shelters');
      if (response.data.success && response.data.shelters) {
        setShelters(response.data.shelters);
      }
    } catch (error) {
      console.error('Error fetching shelters:', error);
      Alert.alert(t('common:error'), t('shelterReport:failedToLoadShelters'));
    }
  };

  const handleShelterSelect = (shelterId) => {
    const shelter = shelters.find(s => s.ID.toString() === shelterId);
    if (shelter) {
      setSelectedShelter(shelter);
      setReport({
        ...report,
        shelterName: shelter.Name,
        shelterAddress: `${shelter.Latitude}, ${shelter.Longitude}`,
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedShelter || !report.issueDescription.trim()) {
      Alert.alert(t('shelterReport:missingInfoTitle'), t('shelterReport:missingInfoMessage'));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://10.0.2.2:3000/api/send-shelter-report', {
        ...report,
        to: 'onlinelibrary6565@gmail.com',
        subject: `${t('shelterReport:title')}: ${report.shelterName}`,
      });

      if (response.data.success) {
        Alert.alert(
          t('shelterReport:reportSubmittedTitle'),
          t('shelterReport:reportSubmittedMessage'),
          [{ text: t('shelterMap:ok'), onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error(response.data.message || t('shelterReport:failedToSubmitReport'));
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert(
        t('common:error'),
        t('shelterReport:failedToSubmitReport')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, darkMode && styles.containerDark]}>
      
      <View style={styles.form}>
        <Text style={[styles.label, darkMode && styles.labelDark]}>
          {t('shelterReport:selectShelter')}
        </Text>
        <View style={[styles.pickerContainer, darkMode && styles.pickerContainerDark]}>
          <Picker
            selectedValue={selectedShelter?.ID?.toString()}
            onValueChange={handleShelterSelect}
            style={[styles.picker, darkMode && styles.pickerDark]}
            dropdownIconColor={darkMode ? '#fff' : '#2c3e50'}
          >
            <Picker.Item label={t('shelterReport:selectAShelter')} value="" color={darkMode ? '#333333' : '#999'} />
            {shelters.map((shelter) => (
              <Picker.Item
                key={shelter.ID}
                label={shelter.Name}
                value={shelter.ID.toString()}
                color={darkMode ? '#333333' : '#2c3e50'}
              />
            ))}
          </Picker>
        </View>

        {selectedShelter && (
          <View style={[styles.shelterInfo, darkMode && styles.shelterInfoDark]}>
            <Text style={[styles.shelterInfoText, darkMode && styles.shelterInfoTextDark]}>
              {t('shelterReport:location')} {selectedShelter.Latitude}, {selectedShelter.Longitude}
            </Text>
          </View>
        )}

        <Text style={[styles.label, darkMode && styles.labelDark]}>
          {t('shelterReport:issueDescription')}
        </Text>
        <TextInput
          style={[styles.input, styles.textArea, darkMode && styles.inputDark]}
          value={report.issueDescription}
          onChangeText={(text) => setReport({ ...report, issueDescription: text })}
          placeholder={t('shelterReport:describeIssuePlaceholder')}
          placeholderTextColor={darkMode ? '#888' : '#999'}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            loading && styles.submitButtonDisabled,
            darkMode && styles.submitButtonDark
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>{t('shelterReport:submitReport')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerDark: {
    backgroundColor: '#2c2c2c',
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  titleDark: {
    color: '#fff',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  labelDark: {
    color: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  },
  pickerContainerDark: {
    backgroundColor: '#2c2c2c',
    borderColor: '#404040',
  },
  picker: {
    height: 50,
    color: '#2c3e50',
  },
  pickerDark: {
    color: '#fff',
    backgroundColor: '#2c2c2c',
  },
  shelterInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  shelterInfoDark: {
    backgroundColor: '#2c2c2c',
    borderColor: '#404040',
  },
  shelterInfoText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  shelterInfoTextDark: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 20,
    color: '#2c3e50',
  },
  inputDark: {
    backgroundColor: '#2c2c2c',
    borderColor: '#404040',
    color: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#0066e6',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonDark: {
    backgroundColor: '#0052cc',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ShelterReportScreen; 