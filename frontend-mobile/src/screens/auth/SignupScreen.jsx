import {
    View,
    Text,
    Image,
    Pressable,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
  } from "react-native";
  import React, { useState, useEffect } from "react";
  import { SafeAreaView } from "react-native-safe-area-context";
  import COLORS from "../../constants/colors";
  import { Ionicons } from "@expo/vector-icons";
  import Checkbox from "expo-checkbox";
  import Button from "../../components/Button";
  import { register } from "../../apis/api";
  
  const SignupScreen = ({ navigation }) => {
    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
    const [isErrorModalVisible, setErrorModalVisible] = useState(false);
    const [redirectToLogin, setRedirectToLogin] = useState(false);
  
    const isValidName = (name) => {
      return name.length > 3;
    };
  
    const isValidEmail = (email) => {
      return email.includes("@");
    };
  
    const isValidPassword = (password) => {
      return password.length > 5 && /\d/.test(password);
    };
  
    const handleSubmit = async () => {
      if (!name || !email || !password || !passwordConfirm) {
        setError("All fields are required");
        return;
      }
  
      if (!isValidName(name)) {
        setError("Please enter a valid name that is more than 4 characters long");
        return;
      }
  
      if (!isValidEmail(email)) {
        setError("Invalid email");
        return;
      }
  
      if (!isValidPassword(password)) {
        setError(
          "Password must be at least 5 characters long and contain at least one letter and one number"
        );
        return;
      }
  
      if (password !== passwordConfirm) {
        setError("Passwords do not match");
        return;
      }
  
      setLoading(true);
      setError(null);
  
      try {
        setLoading(true);
        const data = {
          name: name,
          email: email,
          password: password,
          passwordConfirm: passwordConfirm,
        };
  
        const response = await register(data);
        console.log("Response:", response);
  
        // Check if the response contains an error message
        if (response && response.error) {
          // If an error message is returned, set it to the state
          setError(response.error);
          setErrorModalVisible(true);
        } else {
          // If no error message is returned, it means registration was successful
          setSuccessModalVisible(true);
          setRedirectToLogin(true);
        }
      } catch (error) {
        console.error("Error", error); // Log the error response
        setLoading(false);
        setError("Failed to create account. Please try again later.");
        setErrorModalVisible(true);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      if (redirectToLogin) {
        navigation.navigate("LoginScreen");
      }
    }, [redirectToLogin]);
  
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View style={{ flex: 1, marginHorizontal: 22 }}>
          <View style={{ marginVertical: 22 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                marginVertical: 12,
                color: COLORS.black,
              }}
            >
              Créez un compte 👋
            </Text>
  
            <Text
              style={{
                fontSize: 16,
                color: COLORS.black,
              }}
            >
              Connect with us today!
            </Text>
          </View>
  
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 400,
                marginVertical: 8,
              }}
            >
              Nom et Prénom
            </Text>
  
            <View
              style={{
                width: "100%",
                height: 48,
                borderColor: COLORS.black,
                borderWidth: 1,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: 22,
              }}
            >
              <TextInput
                placeholder="Entrer votre nom"
                placeholderTextColor={COLORS.black}
                style={{
                  width: "100%",
                }}
                value={name}
                onChangeText={(text) => setName(text)}
              />
            </View>
          </View>
  
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 400,
                marginVertical: 8,
              }}
            >
              Addresse email
            </Text>
  
            <View
              style={{
                width: "100%",
                height: 48,
                borderColor: COLORS.black,
                borderWidth: 1,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: 22,
              }}
            >
              <TextInput
                placeholder="Enter your email address"
                placeholderTextColor={COLORS.black}
                keyboardType="email-address"
                style={{
                  width: "100%",
                }}
                value={email}
                onChangeText={(text) => setEmail(text)}
              />
            </View>
          </View>
  
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 400,
                marginVertical: 8,
              }}
            >
              Mot de passe
            </Text>
  
            <View
              style={{
                width: "100%",
                height: 48,
                borderColor: COLORS.black,
                borderWidth: 1,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: 22,
              }}
            >
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={COLORS.black}
                secureTextEntry={isPasswordShown}
                style={{
                  width: "100%",
                }}
                value={password}
                onChangeText={(text) => setPassword(text)}
              />
  
              <TouchableOpacity
                onPress={() => setIsPasswordShown(!isPasswordShown)}
                style={{
                  position: "absolute",
                  right: 12,
                }}
              >
                {isPasswordShown == true ? (
                  <Ionicons name="eye-off" size={24} color={COLORS.black} />
                ) : (
                  <Ionicons name="eye" size={24} color={COLORS.black} />
                )}
              </TouchableOpacity>
            </View>
          </View>
  
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 400,
                marginVertical: 8,
              }}
            >
              Confirmez votre mot de passe
            </Text>
  
            <View
              style={{
                width: "100%",
                height: 48,
                borderColor: COLORS.black,
                borderWidth: 1,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: 22,
              }}
            >
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={COLORS.black}
                secureTextEntry={isPasswordShown}
                style={{
                  width: "100%",
                }}
                value={passwordConfirm}
                onChangeText={(text) => setPasswordConfirm(text)}
              />
  
              <TouchableOpacity
                onPress={() => setIsPasswordShown(!isPasswordShown)}
                style={{
                  position: "absolute",
                  right: 12,
                }}
              >
                {isPasswordShown == true ? (
                  <Ionicons name="eye-off" size={24} color={COLORS.black} />
                ) : (
                  <Ionicons name="eye" size={24} color={COLORS.black} />
                )}
              </TouchableOpacity>
            </View>
          </View>
  
          <View
            style={{
              flexDirection: "row",
              marginVertical: 6,
            }}
          >
            <Checkbox
              style={{ marginRight: 8 }}
              value={isChecked}
              onValueChange={setIsChecked}
              color={isChecked ? COLORS.primary : undefined}
            />
  
            <Text>I aggree to the terms and conditions</Text>
          </View>
  
          <Button
            title="Sign Up"
            filled
            style={{
              marginTop: 18,
              marginBottom: 4,
            }}
            onPress={handleSubmit}
          />
  
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}> {error} </Text>
            </View>
          )}
  
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginVertical: 22,
            }}
          >
            <Text style={{ fontSize: 16, color: COLORS.black }}>
              Vous avez deja un compte ?
            </Text>
            <Pressable onPress={() => navigation.navigate("LoginScreen")}>
              <Text
                style={{
                  fontSize: 16,
                  color: COLORS.primary,
                  fontWeight: "bold",
                  marginLeft: 6,
                }}
              >
                Login
              </Text>
            </Pressable>
          </View>
  
          {/* Error Modal */}
          <Modal
            visible={isErrorModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setErrorModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Error</Text>
                <Text style={styles.modalText}>{error}</Text>
                <TouchableOpacity
                  onPress={() => setErrorModalVisible(false)}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
  
          {/* Success Modal */}
          <Modal
            visible={isSuccessModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setSuccessModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Success</Text>
                <Text style={styles.modalText}>Login successful!</Text>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    );
  };
  
  const styles = StyleSheet.create({
    errorContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginTop: 13,
    },
    errorText: {
      color: COLORS.danger,
      fontSize: 20,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: COLORS.white,
      borderRadius: 10,
      padding: 20,
      alignItems: "center",
      elevation: 5,
      width: 300,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
      color: COLORS.black,
    },
    modalText: {
      fontSize: 16,
      marginBottom: 20,
      color: COLORS.black,
    },
    modalButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: COLORS.white,
    },
  });
  
  export default SignupScreen;
  