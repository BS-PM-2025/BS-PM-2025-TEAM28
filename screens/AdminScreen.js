import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, Pressable, Animated, TextInput } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';

const SIDEBAR_WIDTH = 150;
const STORAGE_KEY = 'noShelterText';
const EMERGENCY_NUMBERS_KEY = 'emergencyNumbersText';
const FIRST_AID_KEY = 'firstAidText';

function AdminScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { darkMode } = useSettings();
  const { user } = route.params;
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [noShelterVisible, setNoShelterVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [noShelterText, setNoShelterText] = useState(t('common:noShelterContent'));
  const [editText, setEditText] = useState(t('common:noShelterContent'));
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const [emergencyVisible, setEmergencyVisible] = useState(false);
  const [emergencyEditMode, setEmergencyEditMode] = useState(false);
  const [emergencyNumbersText, setEmergencyNumbersText] = useState(t('common:emergencyNumbersContent'));
  const [emergencyEditText, setEmergencyEditText] = useState(t('common:emergencyNumbersContent'));
  const [firstAidVisible, setFirstAidVisible] = useState(false);
  const [firstAidEditMode, setFirstAidEditMode] = useState(false);
  const [firstAidText, setFirstAidText] = useState(t('common:firstAidContent'));
  const [firstAidEditText, setFirstAidEditText] = useState(t('common:firstAidContent'));

  useEffect(() => {
    (async () => {
      const storedNoShelter = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedNoShelter) {
        setNoShelterText(storedNoShelter);
        setEditText(storedNoShelter);
      }
      const storedEmergency = await AsyncStorage.getItem(EMERGENCY_NUMBERS_KEY);
      if (storedEmergency) {
        setEmergencyNumbersText(storedEmergency);
        setEmergencyEditText(storedEmergency);
      }
      const storedFirstAid = await AsyncStorage.getItem(FIRST_AID_KEY);
      if (storedFirstAid) {
        setFirstAidText(storedFirstAid);
        setFirstAidEditText(storedFirstAid);
      }
    })();
  }, []);

  const openSidebar = () => {
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

  const handleEditSave = async () => {
    setNoShelterText(editText);
    setEditMode(false);
    await AsyncStorage.setItem(STORAGE_KEY, editText);
  };

  const handleEmergencyEditSave = async () => {
    setEmergencyNumbersText(emergencyEditText);
    setEmergencyEditMode(false);
    await AsyncStorage.setItem(EMERGENCY_NUMBERS_KEY, emergencyEditText);
  };

  const handleFirstAidEditSave = async () => {
    setFirstAidText(firstAidEditText);
    setFirstAidEditMode(false);
    await AsyncStorage.setItem(FIRST_AID_KEY, firstAidEditText);
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      {/* Sidebar Modal */}
      <Modal
        visible={sidebarVisible}
        transparent
        animationType="none"
        onRequestClose={closeSidebar}
      >
        <Pressable style={styles.sidebarOverlay} onPress={closeSidebar}>
          <Animated.View style={[
            styles.sidebar,
            darkMode && styles.sidebarDark,
            {
              left: 0,
              right: undefined,
              transform: [{ translateX: slideAnim }],
            }
          ]}>
            <TouchableOpacity
              style={[styles.sidebarButton, styles.sidebarButtonBlue]}
              onPress={() => {
                closeSidebar();
                navigation.navigate('Settings', { user });
              }}
            >
              <Text style={[styles.sidebarButtonText, darkMode && styles.sidebarButtonTextDark]}>{t('common:settings')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sidebarButton, styles.sidebarButtonBlue]}
              onPress={() => {
                closeSidebar();
                setNoShelterVisible(true);
              }}
            >
              <Text style={[styles.sidebarNoShelterButtonText, darkMode && styles.sidebarNoShelterButtonTextDark]}>{t('common:noShelterNearby')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sidebarButton, styles.sidebarButtonBlue]}
              onPress={() => {
                closeSidebar();
                setEmergencyVisible(true);
              }}
            >
              <Text style={[styles.sidebarNoShelterButtonText, darkMode && styles.sidebarNoShelterButtonTextDark]}>{t('common:emergencyNumbers')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sidebarButton, styles.sidebarButtonBlue]}
              onPress={() => {
                closeSidebar();
                setFirstAidVisible(true);
              }}
            >
              <Text style={[styles.sidebarButtonText, darkMode && styles.sidebarButtonTextDark]}>{t('common:firstAid')}</Text>
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
              <Text style={[styles.sidebarButtonText, darkMode && styles.sidebarButtonTextDark]}>{t('common:logout')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* No Shelter Nearby Modal */}
      <Modal
        visible={noShelterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setNoShelterVisible(false);
          setEditMode(false);
        }}
      >
        <View style={[styles.noShelterOverlay, darkMode && styles.noShelterOverlayDark]}>
          <View style={[styles.noShelterModal, darkMode && styles.noShelterModalDark]}>
            <Text style={[styles.noShelterTitle, darkMode && styles.noShelterTitleDark]}>🚨 No Shelter Nearby? Follow These Steps:</Text>
            <ScrollView>
              {editMode ? (
                <TextInput
                  style={[styles.noShelterEditInput, darkMode && styles.noShelterEditInputDark]}
                  multiline
                  value={editText}
                  onChangeText={setEditText}
                  textAlignVertical="top"
                  placeholderTextColor={darkMode ? '#999' : '#666'}
                />
              ) : (
                <Text style={[styles.noShelterText, darkMode && styles.noShelterTextDark]}>{noShelterText}</Text>
              )}
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              {editMode ? (
                <>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginRight: 5 }]}
                    onPress={handleEditSave}
                  >
                    <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginLeft: 5, backgroundColor: '#aaa' }]}
                    onPress={() => setEditMode(false)}
                  >
                    <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginRight: 5 }]}
                    onPress={() => setNoShelterVisible(false)}
                  >
                    <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginLeft: 5, backgroundColor: '#0066e6' }]}
                    onPress={() => setEditMode(true)}
                  >
                    <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>Edit</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Emergency Numbers Modal */} 
      <Modal
        visible={emergencyVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setEmergencyVisible(false);
          setEmergencyEditMode(false);
        }}
      >
        <View style={[styles.noShelterOverlay, darkMode && styles.noShelterOverlayDark]}>
          <View style={[styles.noShelterModal, darkMode && styles.noShelterModalDark]}>
            <Text style={[styles.noShelterTitle, darkMode && styles.noShelterTitleDark]}>🚨 Emergency Numbers</Text>
            <ScrollView>
              {emergencyEditMode ? (
                <TextInput
                  style={[styles.noShelterEditInput, darkMode && styles.noShelterEditInputDark]}
                  multiline
                  value={emergencyEditText}
                  onChangeText={setEmergencyEditText}
                  textAlignVertical="top"
                  placeholderTextColor={darkMode ? '#999' : '#666'}
                />
              ) : (
                <Text style={[styles.noShelterText, darkMode && styles.noShelterTextDark]}>{emergencyNumbersText}</Text>
              )}
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              {emergencyEditMode ? (
                <>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginRight: 5 }]}
                    onPress={handleEmergencyEditSave}
                  >
                    <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginLeft: 5, backgroundColor: '#aaa' }]}
                    onPress={() => setEmergencyEditMode(false)}
                  >
                    <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginRight: 5 }]}
                    onPress={() => setEmergencyVisible(false)}
                  >
                    <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginLeft: 5, backgroundColor: '#0066e6' }]}
                    onPress={() => setEmergencyEditMode(true)}
                  >
                    <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>Edit</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* First Aid Modal */}
      <Modal
        visible={firstAidVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setFirstAidVisible(false);
          setFirstAidEditMode(false);
        }}
      >
        <View style={[styles.noShelterOverlay, darkMode && styles.noShelterOverlayDark]}>
          <View style={[styles.noShelterModal, darkMode && styles.noShelterModalDark]}>
            <Text style={[styles.noShelterTitle, darkMode && styles.noShelterTitleDark]}>🚑 First Aid Information</Text>
            <ScrollView>
              {firstAidEditMode ? (
                <TextInput
                  style={[styles.noShelterEditInput, darkMode && styles.noShelterEditInputDark]}
                  multiline
                  value={firstAidEditText}
                  onChangeText={setFirstAidEditText}
                  textAlignVertical="top"
                  placeholderTextColor={darkMode ? '#999' : '#666'}
                />
              ) : (
                <Text style={[styles.noShelterText, darkMode && styles.noShelterTextDark]}>{firstAidText}</Text>
              )}
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              {firstAidEditMode ? (
                <>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginRight: 5 }]}
                    onPress={handleFirstAidEditSave}
                  >
                    <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginLeft: 5, backgroundColor: '#aaa' }]}
                    onPress={() => setFirstAidEditMode(false)}
                  >
                    <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginRight: 5 }]}
                    onPress={() => setFirstAidVisible(false)}
                  >
                    <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginLeft: 5, backgroundColor: '#0066e6' }]}
                    onPress={() => setFirstAidEditMode(true)}
                  >
                    <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>Edit</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={[styles.content, darkMode && styles.contentDark]}>
        <View style={[styles.header, darkMode && styles.headerDark]}>
          {/* Sidebar icon on the left */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={openSidebar}
          >
            <MaterialIcons name="menu" size={28} color={darkMode ? '#fff' : '#2c3e50'} />
          </TouchableOpacity>
          <Text style={[styles.title, darkMode && styles.titleDark]}>{t('admin:title')}</Text>
          <View style={styles.headerButtons} />
        </View>

        <Text style={[styles.welcomeText, darkMode && styles.welcomeTextDark]}>
          {t('admin:welcome', { name: user.Name })}
        </Text>

        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
            {t('admin:adminControls')}
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.blueButton]}
            onPress={() => navigation.navigate('ShelterMap')}
          >
            <MaterialIcons name="my-location" size={24} color="white" />
            <Text style={[styles.buttonText, darkMode && styles.buttonTextDark]}>{t('common:findClosestShelter')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.blueButton]}
            onPress={() => navigation.navigate('Shelters')}
          >
            <Image source={require('../assets/shield.png')} style={styles.shieldIcon} />
            <Text style={[styles.buttonText, darkMode && styles.buttonTextDark]}>{t('common:manageShelters')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.blueButton]}
            onPress={() => navigation.navigate('ManageUsers', { adminId: user.ID })}
          >
            <Image source={require('../assets/settings_account_box.png')} style={styles.shieldIcon} />
            <Text style={[styles.buttonText, darkMode && styles.buttonTextDark]}>{t('common:manageUsers')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.blueButton]}
            onPress={() => navigation.navigate('AddressShelter', { user })}
          >
            <MaterialIcons name="location-on" size={24} color="white" />
            <Text style={[styles.buttonText, darkMode && styles.buttonTextDark]}>{t('common:findShelterByAddress')}</Text>
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
  content: {
    flex: 1,
  },
  contentDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
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
  },
  titleDark: {
    color: '#fff',
  },
  welcomeText: {
    fontSize: 18,
    color: '#2c3e50',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  welcomeTextDark: {
    color: '#fff',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionDark: {
    backgroundColor: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  sectionTitleDark: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  blueButton: {
    backgroundColor: '#0066e6',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0066e6',
  },
  outlineButtonText: {
    color: '#0066e6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextDark: {
    color: '#fff',
  },
  shieldIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
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
    backgroundColor: '#2c2c2c',
  },
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  noShelterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noShelterOverlayDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  noShelterModal: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    elevation: 8,
  },
  noShelterModalDark: {
    backgroundColor: '#2c2c2c',
  },
  noShelterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e53935',
    marginBottom: 18,
    textAlign: 'center',
  },
  noShelterTitleDark: {
    color: '#ff6b6b',
  },
  noShelterText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 16,
  },
  noShelterTextDark: {
    color: '#fff',
  },
  noShelterEditInput: {
    fontSize: 16,
    color: '#2c3e50',
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  noShelterEditInputDark: {
    backgroundColor: '#333',
    borderColor: '#404040',
    color: '#fff',
  },
  noShelterCloseButton: {
    backgroundColor: '#1565c0',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 0,
    alignItems: 'center',
    marginBottom: 0,
  },
  noShelterCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noShelterCloseButtonTextDark: {
    color: '#fff',
  },
  sidebarButton: {
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    width: '100%',
  },
  sidebarButtonBlue: {
    backgroundColor: '#0066e6',
  },
  sidebarButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  sidebarButtonTextDark: {
    color: '#fff',
  },
  sidebarNoShelterButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sidebarNoShelterButtonTextDark: {
    color: '#fff',
  },
});

export default AdminScreen;