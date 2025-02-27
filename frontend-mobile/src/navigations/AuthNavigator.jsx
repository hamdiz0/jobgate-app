import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  LoginScreen,
  ForgotPassword,
  SignupScreen,
  ResetPasswordScreen,
} from "../index";
import { COLORS } from "../constants/colors";

const Stack = createNativeStackNavigator();
// Navigator, Screen, Group

function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
      />
    </Stack.Navigator>
  );
}

export default AuthNavigator;
