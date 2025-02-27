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
import Button from "../../components/Button";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import COLORS from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { login } from "../../apis/api";
import colors from "../../constants/colors";

const LoginScreen = ({ navigation, route }) => {
  const { setIsAuthenticated } = route.params;

  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [error, setError] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const isValidEmail = (email) => {
    // Basic email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPassword = (password) => {
    return password.length > 5 && /\d/.test(password);
  };

  const storeData = async (value, user) => {
    try {
      await AsyncStorage.setItem("token", JSON.stringify(value));
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    if (!isValidEmail(email) || !isValidPassword(password)) {
      setError("Invalid email or password");
      setErrorModalVisible(true);
      return;
    }

    setLoading(true);

    const data = { email, password };
    try {
      const res = await login(data);
      if (res.data.status.trim() !== "success" || res.statusCode === 401) {
        setError(res.data.message || "An error occurred during login");
        setErrorModalVisible(true);
      } else {
        await storeData(res.data.token, res.data.data.user);
        setLoading(false);
        setSuccessModalVisible(true);
        const dataFromLocal = await AsyncStorage.getItem("token");
        const token = JSON.parse(dataFromLocal);
        setIsAuthenticated(true);
        navigation.navigate("Home");
        setSuccessModalVisible(false);
      }
    } catch (error) {
      setError("An error occurred during login");
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.logo}>
          <Image
            source={require("../../../assets/LOGO_TT_.jpeg")}
            style={styles.logoImage}
          />
        </View>
        <Text style={styles.title}>BIENVENUE! 👋</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email address</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Enter your email address"
              placeholderTextColor={COLORS.black}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor={COLORS.black}
              secureTextEntry={!isPasswordShown}
              autoCapitalize="none"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordShown(!isPasswordShown)}
              style={styles.eyeIconContainer}
            >
              <Ionicons
                name={isPasswordShown ? "eye-off" : "eye"}
                size={24}
                color={COLORS.black}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.checkboxContainer}>
          <Checkbox
            style={styles.checkbox}
            value={isChecked}
            onValueChange={setIsChecked}
            color={isChecked ? COLORS.primary : undefined}
          />
          <Text style={styles.checkboxLabel}>Souvenir de moi</Text>
        </View>

        <Button
          title="Login"
          filled
          style={styles.loginButton}
          loading={loading}
          onPress={fetchData}
        />

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Vous n'avez pas un compte ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")}>
            <Text style={styles.link}>Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linkContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.link}>Oublié ton mot de passe ?</Text>
          </TouchableOpacity>
        </View>

        {/* Error Modal */}
        <Modal
          visible={errorModalVisible}
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
          visible={successModalVisible}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: 22,
    marginTop: 30,
  },
  logo: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: 120,
    height: 140,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 12,
    color: COLORS.black,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 22,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 8,
    paddingLeft: 22,
  },
  input: {
    flex: 1,
    height: 48,
  },
  eyeIconContainer: {
    position: "absolute",
    right: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: colors.primary,
    marginTop: 18,
    marginBottom: 4,
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  linkText: {
    fontSize: 16,
    color: COLORS.black,
  },
  link: {
    fontSize: 16,
    color: "darkblue",
    fontWeight: "bold",
    marginLeft: 6,
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

export default LoginScreen;
