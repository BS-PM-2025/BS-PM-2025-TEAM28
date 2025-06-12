import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable, Animated } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useSettings } from '../contexts/SettingsContext';

const SIDEBAR_WIDTH = 180;
const STORAGE_KEY = 'noShelterText';
const EMERGENCY_NUMBERS_KEY = 'emergencyNumbersText';
const FIRST_AID_KEY = 'firstAidText';

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
  "If You're Outside and Far from Any Building\n\n" +
  "Lie flat on the ground and cover your head with your hands.";

  const DEFAULT_EMERGENCY_NUMBERS_TEXT =
  "🚨 Emergency Numbers\n\n" +
  "🔥 Fire & Rescue Services\nPhone: 102\nCall in case of fires, smoke, building collapses, or other rescue situations.\n\n" +
  "🚑 Medical Emergency (Magen David Adom)\nPhone: 101\nCall for ambulance services, life-threatening injuries, or any urgent medical help.\n\n" +
  "🚓 Police\nPhone: 100\nCall to report crimes, accidents, suspicious activity, or personal safety concerns.\n\n" +
  "📞 Home Front Command Information Center\nPhone: 104\nGet real-time instructions during rocket attacks, earthquakes, or other national emergencies.\n\n" +
  "🆘 Municipal Hotline\nPhone: 106\nLocal city hotline for reporting infrastructure problems, shelter access issues, or public hazards.\n\n" +
  "📲 Child Emergency Hotline (Eran)\nPhone: 105\nFor reporting child abuse, online threats, or receiving help related to child protection.\n\n" +
  "💬 Mental Health Support (Eran Organization)\nPhone: 1201\nFree emotional support in times of stress, anxiety, or trauma.\n\n" +
  "🛡️ Stay Safe. Stay Informed.\nUse our app to quickly locate the nearest shelter when an alert is received.";

const DEFAULT_FIRST_AID_TEXT = 
  "🆘 First Aid in Case of Rocket/Missile Strike\n\n" +
  "In the event of a rocket or missile strike, act quickly and wisely to save lives:\n\n" +
  "1. 📞 Call for Help\n" +
  "- Immediately call Magen David Adom (MDA): 101.\n" +
  "- Provide exact location, number of casualties, and injury types.\n\n" +
  "2. 👁️ Assess the Situation\n" +
  "- Make sure the area is safe before approaching.\n" +
  "- Carefully approach the injured.\n\n" +
  "3. 💨 Check Responsiveness and Breathing\n" +
  "- Check if the person responds.\n" +
  "- If not breathing – start CPR: 30 chest compressions + 2 rescue breaths.\n" +
  "- If there's heavy bleeding – proceed to the next step.\n\n" +
  "4. 🩸 Stop Bleeding\n" +
  "- Apply direct pressure to the bleeding site using a clean cloth or bandage.\n" +
  "- Raise the bleeding limb above heart level if possible.\n" +
  "- Use a tourniquet only as a last resort in life-threatening bleeding.\n\n" +
  "5. 🔥 Burn Care\n" +
  "- Rinse burns with lukewarm water only (not cold or hot).\n" +
  "- Do not apply creams or ointments.\n\n" +
  "6. 🦴 Fractures and Injuries\n" +
  "- Do not move a person if there's a suspected spinal injury.\n" +
  "- Gently stabilize injured limbs until emergency services arrive.\n\n" +
  "7. 💬 Emotional Support\n" +
  "- Stay calm and speak in a reassuring tone.\n" +
  "- Stay with the injured until help arrives.";

function AccountScreen({ route, navigation }) {
  const { user } = route.params;
  const { darkMode } = useSettings();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [noShelterVisible, setNoShelterVisible] = useState(false);
  const [noShelterText, setNoShelterText] = useState(DEFAULT_NO_SHELTER_TEXT);
  const [emergencyNumbersVisible, setEmergencyNumbersVisible] = useState(false);
  const [emergencyNumbersText, setEmergencyNumbersText] = useState(DEFAULT_EMERGENCY_NUMBERS_TEXT);
  const [firstAidVisible, setFirstAidVisible] = useState(false);
  const [firstAidText, setFirstAidText] = useState(DEFAULT_FIRST_AID_TEXT);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const isFocused = useIsFocused();
  

 useEffect(() => {
  (async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    setNoShelterText(stored || DEFAULT_NO_SHELTER_TEXT);

    const storedEmergency = await AsyncStorage.getItem(EMERGENCY_NUMBERS_KEY);
    setEmergencyNumbersText(storedEmergency || DEFAULT_EMERGENCY_NUMBERS_TEXT);

    const storedFirstAid = await AsyncStorage.getItem(FIRST_AID_KEY);
    setFirstAidText(storedFirstAid || DEFAULT_FIRST_AID_TEXT);
  })();
}, [isFocused]);

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
            <TouchableOpacity
  style={[styles.sidebarButton, styles.sidebarButtonBlue]}
  onPress={() => {
    closeSidebar();
    setEmergencyNumbersVisible(true);
  }}
>
  <Text style={styles.sidebarButtonText}>Emergency Numbers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sidebarButton, styles.sidebarButtonBlue]}
              onPress={() => {
                closeSidebar();
                setFirstAidVisible(true);
              }}
            >
              <Text style={styles.sidebarButtonText}>First Aid</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sidebarButton, styles.sidebarButtonBlue]}
              onPress={() => {
                closeSidebar();
                navigation.navigate('ShelterReport', { user });
              }}
            >
              <Text style={styles.sidebarButtonText}>Shelter Report</Text>
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
            <Text style={[styles.noShelterTitle, darkMode && styles.noShelterTitleDark]}>🚨 No Shelter Nearby? Follow These Steps:</Text>
            <ScrollView>
              <Text style={[styles.noShelterText, darkMode && styles.noShelterTextDark]}>{noShelterText}</Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.noShelterCloseButton, darkMode && styles.noShelterCloseButtonDark]}
              onPress={() => setNoShelterVisible(false)}
            >
              <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>Close</Text>
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
        🚨 Emergency Numbers
      </Text>
      <ScrollView>
        <Text style={[styles.noShelterText, darkMode && styles.noShelterTextDark]}>
  {emergencyNumbersText}
</Text>
      </ScrollView>
      <TouchableOpacity
        style={[styles.noShelterCloseButton, darkMode && styles.noShelterCloseButtonDark]}
        onPress={() => setEmergencyNumbersVisible(false)}
      >
        <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>
          Close
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
              🚑 First Aid Information
            </Text>
            <ScrollView>
              <Text style={[styles.noShelterText, darkMode && styles.noShelterTextDark]}>
                {firstAidText}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.noShelterCloseButton, darkMode && styles.noShelterCloseButtonDark]}
              onPress={() => setFirstAidVisible(false)}
            >
              <Text style={[styles.noShelterCloseButtonText, darkMode && styles.noShelterCloseButtonTextDark]}>
                Close
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
  <Text style={[styles.title, darkMode && styles.titleDark]}>Account</Text>
  {/* Empty view for spacing */}
  <View style={{ width: 40 }} />
</View>

        <Text style={[styles.welcomeText, darkMode && styles.welcomeTextDark]}>Welcome, {user.Name}!</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Account Info</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={24} color={darkMode ? '#fff' : '#2c3e50'} />
            <Text style={[styles.infoText, darkMode && styles.infoTextDark]}>
              Email: <Text style={[styles.bold, darkMode && styles.boldDark]}>{user.Gmail}</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={24} color={darkMode ? '#fff' : '#2c3e50'} />
            <Text style={[styles.infoText, darkMode && styles.infoTextDark]}>
              User Type: <Text style={[styles.bold, darkMode && styles.boldDark]}>{user.UserType}</Text>
            </Text>
          </View>

          {/* Show only for Tourist */}
          {user.UserType === 'Tourist' && (
            <TouchableOpacity
              style={[styles.button, styles.blueButton]}
              onPress={() => navigation.navigate('SavedRoute', { user })}
            >
              <MaterialIcons name="map" size={24} color="white" />
              <Text style={styles.buttonText}>My Saved Route</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.blueButton]}
            onPress={() => navigation.navigate('ShelterMap')}
          >
            <MaterialIcons name="my-location" size={24} color="white" />
            <Text style={styles.buttonText}>Find Closest Shelter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.outlineButton, darkMode && styles.outlineButtonDark]}
            onPress={() => navigation.navigate('AddressShelter', { user })}
          >
            <MaterialIcons name="location-on" size={24} color={darkMode ? '#fff' : '#0066e6'} />
            <Text style={[styles.outlineButtonText, darkMode && styles.outlineButtonTextDark]}>Find Shelter by Address</Text>
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