// screens/AccountScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function AccountScreen({ route }) {
  const { user } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user.Name}!</Text>
      <Text style={styles.text}>Email: {user.Gmail}</Text>
      <Text style={styles.text}>User Type: {user.UserType}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default AccountScreen;
