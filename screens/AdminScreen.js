import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, Pressable, Animated, TextInput } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SIDEBAR_WIDTH = 150;
const STORAGE_KEY = 'noShelterText';

const DEFAULT_NO_SHELTER_TEXT =
  "🚨 No Shelter Nearby? Follow These Steps:\n" +
  "\n" +
  "Find the Nearest Safe Spot Indoors\n\n" +
  "Go to the innermost room of your home or building.\n" +
  "Preferably choose a room with the least number of external walls, windows, and openings.\n\n" +
  "Stay Away from Windows\n\n" +
  "If possible, close curtains or cover windows to protect from shattered glass.\n\n" +
  "Lie Down and Cover Your Head\n\n" +
  "Use your hands or an object like a backpack or pillow for protection.\n\n" +
  "Stay Inside for at Least 10 Minutes\n\n" +
  "Unless instructed otherwise by official alerts, remain where you are for 10 minutes after the alert sounds.\n\n" +
  "Listen for Official Updates\n\n" +
  "Follow updates from local authorities via emergency apps, radio, or news channels.\n\n" +
  "Avoid Using Elevators\n\n" +
  "In case of another alert or a power outage, elevators may become dangerous.\n\n" +
  "If You’re Outside and Far from Any Building\n\n" +
  "Lie flat on the ground and cover your head with your hands.";

function AdminScreen({ route, navigation }) {
  const { user } = route.params;
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [noShelterVisible, setNoShelterVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [noShelterText, setNoShelterText] = useState(DEFAULT_NO_SHELTER_TEXT);
  const [editText, setEditText] = useState(noShelterText);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  // Load the text from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNoShelterText(stored);
        setEditText(stored);
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

  // Save to AsyncStorage and update state
  const handleEditSave = async () => {
    setNoShelterText(editText);
    setEditMode(false);
    await AsyncStorage.setItem(STORAGE_KEY, editText);
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
          <Animated.View style={[
            styles.sidebar,
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
              <Text style={styles.sidebarButtonText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sidebarButton, styles.sidebarButtonBlue]}
              onPress={() => {
                closeSidebar();
                handleLogout();
              }}
            >
              <Text style={styles.sidebarButtonText}>Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sidebarButton, styles.sidebarButtonBlue]}
              onPress={() => {
                closeSidebar();
                setNoShelterVisible(true);
              }}
            >
              <Text style={styles.sidebarNoShelterButtonText}>No Shelter Nearby?</Text>
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
        <View style={styles.noShelterOverlay}>
          <View style={styles.noShelterModal}>
            <Text style={styles.noShelterTitle}>🚨 No Shelter Nearby? Follow These Steps:</Text>
            <ScrollView>
              {editMode ? (
                <TextInput
                  style={styles.noShelterEditInput}
                  multiline
                  value={editText}
                  onChangeText={setEditText}
                  textAlignVertical="top"
                />
              ) : (
                <Text style={styles.noShelterText}>{noShelterText}</Text>
              )}
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              {editMode ? (
                <>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginRight: 5 }]}
                    onPress={handleEditSave}
                  >
                    <Text style={styles.noShelterCloseButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginLeft: 5, backgroundColor: '#aaa' }]}
                    onPress={() => setEditMode(false)}
                  >
                    <Text style={styles.noShelterCloseButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginRight: 5 }]}
                    onPress={() => setNoShelterVisible(false)}
                  >
                    <Text style={styles.noShelterCloseButtonText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.noShelterCloseButton, { flex: 1, marginLeft: 5, backgroundColor: '#0066e6' }]}
                    onPress={() => setEditMode(true)}
                  >
                    <Text style={styles.noShelterCloseButtonText}>Edit</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          {/* Sidebar icon on the left */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={openSidebar}
          >
            <MaterialIcons name="menu" size={28} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.title}>Admin Dashboard</Text>
          <View style={styles.headerButtons} />
        </View>

        <Text style={styles.welcomeText}>Welcome, {user.Name}!</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Controls</Text>

          <TouchableOpacity
            style={[styles.button, styles.blueButton]}
            onPress={() => navigation.navigate('Shelters')}
          >
            <Image source={require('../assets/shield.png')} style={styles.shieldIcon} />
            <Text style={styles.buttonText}>Manage Shelters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.blueButton]}
            onPress={() => navigation.navigate('ManageUsers', { adminId: user.ID })}
          >
            <Image source={require('../assets/settings_account_box.png')} style={styles.shieldIcon} />
            <Text style={styles.buttonText}>Manage Users</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={() => navigation.navigate('AddressShelter')}
          >
            <Image source={require('../assets/policy.png')} style={styles.shieldIcon} />
            <Text style={styles.outlineButtonText}>Search shelter by address</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 20,
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
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
  shieldIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  // Sidebar styles
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 }, // shadow on right side for left sidebar
    shadowOpacity: 0.2,
    shadowRadius: 8,
    position: 'absolute',
    left: 0, // move sidebar to left
    top: 0,
    bottom: 0,
  },
  sidebarButton: {
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
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
  sidebarNoShelterButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  // No Shelter Modal styles
  noShelterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noShelterModal: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    elevation: 8,
  },
  noShelterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e53935',
    marginBottom: 18,
    textAlign: 'center',
  },
  noShelterText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 16,
  },
  noShelterStep: {
    fontWeight: 'bold',
    color: '#1565c0',
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
});

export default AdminScreen;