// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import HomeScreen from './screens/HomeScreen';
import Register from './screens/Register';
import Login from './screens/Login';
import AccountScreen from './screens/AccountScreen';
import ForgotPassword from './screens/ForgotPassword';
import AdminScreen from './screens/AdminScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Home');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedPassword = await AsyncStorage.getItem('userPassword');
      
      if (savedEmail && savedPassword) {
        // Attempt to login with saved credentials
        try {
          const response = await axios.post('http://192.168.1.249:3000/api/login', {
            email: savedEmail,
            password: savedPassword,
          });

          if (response.data.success) {
            const user = response.data.user;
            setUserData(user);
            
            // Set initial route based on user type
            if (user.IsAdmin) {
              setInitialRoute('AdminScreen');
            } else {
              setInitialRoute('AccountScreen');
            }
          } else {
            // If login fails, clear saved credentials
            await AsyncStorage.removeItem('userEmail');
            await AsyncStorage.removeItem('userPassword');
            setInitialRoute('Home');
          }
        } catch (error) {
          console.error('Auto-login error:', error);
          // If there's an error, clear saved credentials
          await AsyncStorage.removeItem('userEmail');
          await AsyncStorage.removeItem('userPassword');
          setInitialRoute('Home');
        }
      } else {
        setInitialRoute('Home');
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setInitialRoute('Home');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Login" component={Login} /> 
        <Stack.Screen 
          name="AccountScreen" 
          component={AccountScreen}
          initialParams={{ user: userData }}
        /> 
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen 
          name="AdminScreen" 
          component={AdminScreen}
          initialParams={{ user: userData }}
          options={{
            title: 'Admin Dashboard',
            headerLeft: null // This prevents going back to login screen
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
