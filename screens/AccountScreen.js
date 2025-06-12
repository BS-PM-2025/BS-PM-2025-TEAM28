import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable, Animated } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

const SIDEBAR_WIDTH = 180;
const STORAGE_KEY = 'noShelterText';
const EMERGENCY_NUMBERS_KEY = 'emergencyNumbersText';
const FIRST_AID_KEY = 'firstAidText';

function AccountScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { user } = route.params;
  const { darkMode } = useSettings();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [noShelterVisible, setNoShelterVisible] = useState(false);
  const [emergencyNumbersVisible, setEmergencyNumbersVisible] = useState(false);
  const [firstAidVisible, setFirstAidVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const isFocused = useIsFocused();
  

  // Log the current language whenever it changes
  useEffect(() => {
    console.log('Current i18n language in AccountScreen.js:', i18n.language);
  }, [i18n.language]);

  const openSidebar = () => {
    console.log('Opening sidebar');
    setSidebarVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: -SIDEBAR_WIDTH,
      duration: 200,
      useNativeDriver: false,
    }).start(() => setSidebarVisible(false));
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userPassword');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Sidebar Modal */}
      <Modal
        visible={sidebarVisible}
        transparent
        animationType="none"
        onRequestClose={closeSidebar}
      >
        <Pressable style={styles.sidebarOverlay} onPress={closeSidebar}>
          <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }, darkMode && styles.sidebarDark]}>
            <TouchableOpacity
              style={[styles.sidebarButton, styles.sidebarButtonBlue]}
              onPress={() => {
                closeSidebar();
                navigation.navigate('Settings', { user });
              }}
            >
              <Text style={styles.sidebarButtonText}>{t('common:settings')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sidebarButton, styles.sidebarButtonBlue]}
              onPress={() => {
                closeSidebar();
                setNoShelterVisible(true);
              }}
            >
              <Text style={styles.sidebarNoShelterButtonText}>{t('common:noShelterNearby')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sidebarButton, styles.sidebarButtonBlue]}
              onPress={() => {
                closeSidebar();
                setEmergencyNumbersVisible(true);
              }}
            >
              <Text style={styles.sidebarButtonText}>{t('common:emergencyNumbers')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sidebarButton, styles.sidebarButtonBlue]}
              onPress={() => {
                closeSidebar();
                setFirstAidVisible(true);
              }}
            >
              <Text style={styles.sidebarButtonText}>{t('common:firstAid')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sidebarButton, styles.sidebarButtonBlue]}
              onPress={() => {
                closeSidebar();
                navigation.navigate('ShelterReport', { user });
              }}
            >
              <Text style={styles.sidebarButtonText}>{t('common:shelterReport')}</Text>
            </TouchableOpacity>
            
            {/* Spacer to push logout to bottom */}
            <View style={{ flex: 1 }} />
            
            <TouchableOpacity
              style={[styles.sidebarButton, styles.sidebarButtonBlue]}
              onPress={() => {
                closeSidebar();
                handleLogout();
              }}
            >
              <Text style={styles.sidebarButtonText}>{t('common:logout')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* No Shelter Nearby Modal */}
      <Modal
        visible={noShelterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNoShelterVisible(false)}
      >
        <View style={[styles.noShelterOverlay, darkMode && styles.noShelterOverlayDark]}>
          <View style={[styles.noShelterModal, darkMode && styles.noShelterModalDark]}>
            <Text style={[styles.noShelterTitle, darkMode && styles.noShelterTitleDark]}>
              {t('common:noShelterTitle')}
            </Text>
            <ScrollView>
              <Text style={[styles.noShelterText, darkMode && styles.noShelterTextDark]}>
                {t('common:noShelterContent')}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.noShelterCloseButton, darkMode && styles.noShelterCloseButtonDark]}
              onPress={() => setNoShelterVisible(false)}
            >
              <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>
                {t('common:close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Emergency Numbers Modal */}
      <Modal
        visible={emergencyNumbersVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEmergencyNumbersVisible(false)}
      >
        <View style={[styles.noShelterOverlay, darkMode && styles.noShelterOverlayDark]}>
          <View style={[styles.noShelterModal, darkMode && styles.noShelterModalDark]}>
            <Text style={[styles.noShelterTitle, darkMode && styles.noShelterTitleDark]}>
              {t('common:emergencyNumbersTitle')}
            </Text>
            <ScrollView>
              <Text style={[styles.noShelterText, darkMode && styles.noShelterTextDark]}>
                {t('common:emergencyNumbersContent')}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.noShelterCloseButton, darkMode && styles.noShelterCloseButtonDark]}
              onPress={() => setEmergencyNumbersVisible(false)}
            >
              <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>
                {t('common:close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* First Aid Modal */}
      <Modal
        visible={firstAidVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFirstAidVisible(false)}
      >
        <View style={[styles.noShelterOverlay, darkMode && styles.noShelterOverlayDark]}>
          <View style={[styles.noShelterModal, darkMode && styles.noShelterModalDark]}>
            <Text style={[styles.noShelterTitle, darkMode && styles.noShelterTitleDark]}>
              {t('common:firstAidTitle')}
            </Text>
            <ScrollView>
              <Text style={[styles.noShelterText, darkMode && styles.noShelterTextDark]}>
                {t('common:firstAidContent')}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.noShelterCloseButton, darkMode && styles.noShelterCloseButtonDark]}
              onPress={() => setFirstAidVisible(false)}
            >
              <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>
                {t('common:close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={[styles.container, darkMode && styles.containerDark]}>
       <View style={[styles.header, darkMode && styles.headerDark]}>
  <TouchableOpacity
    style={styles.iconButton}
    onPress={openSidebar}
  >
    <MaterialIcons name="menu" size={32} color={darkMode ? '#fff' : '#2c3e50'} />
  </TouchableOpacity>
  <Text style={[styles.title, darkMode && styles.titleDark]}>{t('account:title')}</Text>
  {/* Empty view for spacing */}
  <View style={{ width: 40 }} />
</View>

        <Text style={[styles.welcomeText, darkMode && styles.welcomeTextDark]}>
          {t('account:welcome', { name: user.Name })}
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>{t('account:accountInfo')}</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={24} color={darkMode ? '#fff' : '#2c3e50'} />
            <Text style={[styles.infoText, darkMode && styles.infoTextDark]}>
              {t('common:email')}: <Text style={[styles.bold, darkMode && styles.boldDark]}>{user.Gmail}</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={24} color={darkMode ? '#fff' : '#2c3e50'} />
            <Text style={[styles.infoText, darkMode && styles.infoTextDark]}>
              {t('common:userType')}: <Text style={[styles.bold, darkMode && styles.boldDark]}>{user.UserType}</Text>
            </Text>
          </View>

          {/* Show only for Tourist */}
          {user.UserType === 'Tourist' && (
            <TouchableOpacity
              style={[styles.button, styles.blueButton]}
              onPress={() => navigation.navigate('SavedRoute', { user })}
            >
              <MaterialIcons name="map" size={24} color="white" />
              <Text style={styles.buttonText}>{t('common:mySavedRoute')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.blueButton]}
            onPress={() => navigation.navigate('ShelterMap')}
          >
            <MaterialIcons name="my-location" size={24} color="white" />
            <Text style={styles.buttonText}>{t('common:findClosestShelter')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.outlineButton, darkMode && styles.outlineButtonDark]}
            onPress={() => navigation.navigate('AddressShelter', { user })}
          >
            <MaterialIcons name="location-on" size={24} color={darkMode ? '#fff' : '#0066e6'} />
            <Text style={[styles.outlineButtonText, darkMode && styles.outlineButtonTextDark]}>
              {t('common:findShelterByAddress')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},
  headerDark: {
    backgroundColor: '#2c2c2c',
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 20,
  },
  titleDark: {
    color: '#fff',
  },
  headerButtons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: 8,
  },
  welcomeText: {
    fontSize: 18,
    color: '#2c3e50',
    padding: 20,
    paddingBottom: 0,
  },
  welcomeTextDark: {
    color: '#fff',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  sectionTitleDark: {
    color: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  infoTextDark: {
    color: '#ccc',
  },
  bold: {
    fontWeight: 'bold',
  },
  boldDark: {
    color: '#fff',
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
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0066e6',
  },
  outlineButtonDark: {
    borderColor: '#fff',
  },
  outlineButtonText: {
    color: '#0066e6',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  outlineButtonTextDark: {
    color: '#fff',
  },
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  noShelterOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  noShelterOverlayDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    elevation: 5,
  },
  sidebarDark: {
    backgroundColor: '#1a1a1a',
  },
  sidebarButton: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  sidebarButtonBlue: {
    backgroundColor: '#007bff',
  },
  sidebarButtonDark: {
    backgroundColor: '#333',
  },
  sidebarButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sidebarButtonTextDark: {
    color: '#eee',
  },
  sidebarNoShelterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noShelterModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
  },
  noShelterModalDark: {
    backgroundColor: '#2c2c2c',
  },
  noShelterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2c3e50',
  },
  noShelterTitleDark: {
    color: '#fff',
  },
  noShelterText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2c3e50',
    textAlign: 'left',
  },
  noShelterTextDark: {
    color: '#ccc',
  },
  noShelterCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    alignItems: 'center',
  },
  noShelterCloseButtonDark: {
    backgroundColor: '#c0392b',
  },
  noShelterCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noShelterCloseButtonTextDark: {
    color: '#eee',
  },
});

export default AccountScreen;