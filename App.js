// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import Register from './screens/Register';
import Login from './screens/Login';
import AccountScreen from './screens/AccountScreen';
import ForgotPassword from './screens/ForgotPassword';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Login" component={Login} /> 
        <Stack.Screen name="AccountScreen" component={AccountScreen} /> 
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
