import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnBoardingScreen from "./src/screens/onBoardingScreen/OnBoardingScreen";
import Welcome from "./src/screens/Welcome";
import LoginScreen from "./src/screens/auth/LoginScreen";
import SignupScreen from "./src/screens/auth/SignupScreen";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "./src/screens/auth/ResetPasswordScreen";
import DrawerNavigator from "./src/navigations/DrawerNavigator";
import Home from "./src/screens/layout/Home";
import { AwaitedPlacesProvider } from "./src/context/AwaitedPlacesContext";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem("token");
      setIsAuthenticated(!!token);
    };

    checkAuthentication();
  }, []);

  const AppStack = () => (
    <Stack.Navigator>
      <Stack.Screen
        name="OnBoardingScreen"
        component={OnBoardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Welcome"
        component={Welcome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
        initialParams={{ setIsAuthenticated: setIsAuthenticated }}
      />
      <Stack.Screen
        name="SignupScreen"
        component={SignupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );

  return (
    <AwaitedPlacesProvider>
      <NavigationContainer>
        {isAuthenticated ? (
          <DrawerNavigator setIsAuthenticated={setIsAuthenticated} />
        ) : (
          <AppStack />
        )}
      </NavigationContainer>
    </AwaitedPlacesProvider>
  );
}
