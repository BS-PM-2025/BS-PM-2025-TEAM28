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
import Settings from './screens/Settings';
import ResetPassword from './screens/ResetPassword';
import ManageUsersScreen from './screens/ManageUsersScreen';
import Shelters from './screens/Shelters';
import ShelterMapScreen from './screens/ShelterMapScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Home');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedPassword = await AsyncStorage.getItem('userPassword');
      
      if (savedEmail && savedPassword) {
        try {
          const response = await axios.post('http://10.0.2.2:3000/api/login', {
            email: savedEmail,
            password: savedPassword,
          });

          if (response.data.success) {
            const user = response.data.user;
            setUserData(user);
            
            if (user.IsAdmin) {
              setInitialRoute('AdminScreen');
            } else {
              setInitialRoute('AccountScreen');
            }
          } else {
            await AsyncStorage.removeItem('userEmail');
            await AsyncStorage.removeItem('userPassword');
            setInitialRoute('Home');
          }
        } catch (error) {
          console.error('Auto-login error:', error);
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
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Login" component={Login} /> 
        <Stack.Screen 
          name="ShelterMap" 
          component={ShelterMapScreen}
          options={{
            title: 'Find Nearest Shelter'
          }}
        />
        
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
            headerLeft: null 
          }}
        />
         <Stack.Screen name="Shelters" component={Shelters} />
        <Stack.Screen 
          name="Settings" 
          component={Settings}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="ResetPassword" 
          component={ResetPassword}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="ManageUsers" 
          component={ManageUsersScreen}
          options={{
            title: 'Manage Users',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}