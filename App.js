import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import './i18n'; // Import i18n configuration
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
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
import AddressShelterScreen from './screens/AddressShelterScreen';
import AddShelterScreen from './screens/AddShelterScreen';
import SavedRouteScreen from './screens/SavedRouteScreen';
import ShelterReportScreen from './screens/ShelterReportScreen';
import { useTranslation } from 'react-i18next';

const Stack = createStackNavigator();

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007bff',
    background: '#ffffff',
    card: '#ffffff',
    text: '#2c3e50',
    border: '#e0e0e0',
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#0d6efd',
    background: '#1a1a1a',
    card: '#2c2c2c',
    text: '#ffffff',
    border: '#404040',
  },
};

// Navigation component that uses settings
function Navigation() {
  const { darkMode } = useSettings();
  const { t, i18n } = useTranslation();
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

  if (isLoading || !i18n.isInitialized) {
    return null;
  }

  return (
    <NavigationContainer theme={darkMode ? CustomDarkTheme : CustomLightTheme}>
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: darkMode ? CustomDarkTheme.colors.card : CustomLightTheme.colors.card,
          },
          headerTintColor: darkMode ? CustomDarkTheme.colors.text : CustomLightTheme.colors.text,
          cardStyle: {
            backgroundColor: darkMode ? CustomDarkTheme.colors.background : CustomLightTheme.colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={({ navigation, route }) => ({
            title: t('home:title')
          })}
        />
        <Stack.Screen 
          name="Register" 
          component={Register}
          options={({ navigation, route }) => ({
            title: t('common:register')
          })}
        />
        <Stack.Screen 
          name="Login" 
          component={Login}
          options={({ navigation, route }) => ({
            title: t('common:login')
          })}
        />
        <Stack.Screen 
          name="ShelterMap" 
          component={ShelterMapScreen}
          options={({ navigation, route }) => ({
            title: t('common:findClosestShelter')
          })}
        />
        <Stack.Screen 
          name="AddressShelter" 
          component={AddressShelterScreen}
          options={({ navigation, route }) => ({
            title: t('common:findShelterByAddress')
          })}
        />
        <Stack.Screen 
          name="AccountScreen" 
          component={AccountScreen}
          initialParams={{ user: userData }}
          options={({ navigation, route }) => ({
            title: t('account:title')
          })}
        /> 
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen 
          name="AdminScreen" 
          component={AdminScreen}
          initialParams={{ user: userData }}
          options={({ navigation, route }) => ({
            title: t('admin:title'),
            headerLeft: null 
          })}
        />
         <Stack.Screen name="Shelters" component={Shelters} />
         <Stack.Screen name="AddShelter" component={AddShelterScreen} />
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
          options={({ navigation, route }) => ({
            title: t('common:resetPassword'),
            headerShown: false
          })}
        />
        <Stack.Screen 
          name="ManageUsers" 
          component={ManageUsersScreen}
          options={({ navigation, route }) => ({
            title: t('common:manageUsers'),
          })}
        />
        <Stack.Screen name="SavedRoute" component={SavedRouteScreen} />
        <Stack.Screen 
          name="ShelterReport" 
          component={ShelterReportScreen}
          options={({ navigation, route }) => ({
            title: t('common:shelterReport')
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Root component that provides settings context
export default function App() {
  return (
    <SettingsProvider>
      <Navigation />
    </SettingsProvider>
  );
}