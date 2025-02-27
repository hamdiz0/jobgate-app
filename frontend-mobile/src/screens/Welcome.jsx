import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import colors from "../constants/colors";

const Welcome = ({ navigation }) => {
  const handleLoginPress = () => {
    navigation.navigate("LoginScreen");
  };

  const handleSignUpPress = () => {
    navigation.navigate("SignupScreen");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue </Text>
      <Text style={styles.title2}>Choisiseez Ce Que Vous Voulez</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={handleLoginPress}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.signUpButton]}
          onPress={handleSignUpPress}
        >
          <Text style={styles.buttonText}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 100,
    color: colors.primary,
  },
  title2: {
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 100,
    color: colors.gray,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginHorizontal: 10,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  loginButton: {
    backgroundColor: colors.gradientForm,
  },
  signUpButton: {
    backgroundColor: colors.bgColor,
  },
});

export default Welcome;
