import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

function ManageUsersScreen({ navigation, route }) {
  const [users, setUsers] = useState([]);
  const { adminId } = route.params;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:3000/api/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users.');
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`http://10.0.2.2:3000/api/users/${userId}`);
      setUsers(users.filter((u) => u.ID !== userId));
      Alert.alert('Success', 'User deleted successfully.');
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Manage Users</Text>
      {users.map((u) => (
        <View key={u.ID} style={styles.userItem}>
          <View>
            <Text style={styles.userText}>Username: {u.Name}</Text>
            <Text style={styles.userText}>Email: {u.Gmail}</Text>
          </View>
          {u.ID !== adminId && ( 
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteUser(u.ID)}
            >
              <MaterialIcons name="delete" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  userText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
  },
});

export default ManageUsersScreen;