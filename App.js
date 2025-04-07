/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  useColorScheme,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1, // Ensures the view takes up the full screen
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
  };

  const handleRegister = () => {
    console.log('Register button pressed');
    // Add navigation or functionality for registration here
  };

  const handleLogin = () => {
    console.log('Login button pressed');
    // Add navigation or functionality for login here
  };

  return (
    <View style={backgroundStyle}>
      <Text style={styles.title}>FMS</Text>
      <View style={styles.buttonContainer}>
        <Button title="Register" onPress={handleRegister} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20, // Adds spacing between the title and buttons
    color: Colors.black,
  },
  buttonContainer: {
    marginVertical: 10, // Adds spacing between buttons
    width: '80%', // Makes buttons take up 80% of the screen width
  },
});

export default App;