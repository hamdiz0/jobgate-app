import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableHighlight,
} from "react-native";
import colors from "../../constants/colors";
import { AntDesign } from "@expo/vector-icons";
import { forgotPassword } from "../../apis/api";

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter a valid email");
      return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const response = await forgotPassword(email);
      console.log('response', response);

      setLoading(false);

      if (response && response.resetToken) {
        setSuccessModalVisible(true);
        navigation.navigate("ResetPasswordScreen", { email, resetToken: response.resetToken });
      } else {
        
        setError(
          "Failed to send reset password email. Please try again later."
        );
      }
    } catch (error) {
      setLoading(false);
      console.error("Error sending reset password email:", error);
      setError("Failed to send reset password email. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity
      style={styles.goBack}
      onPress={() => navigation.goBack()}
    >
      <AntDesign name="arrowleft" size={15} color="white" />
    </TouchableOpacity>
      </View>

      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.title2}>Entrez votre addresse email</Text>
      <TextInput
        style={styles.input}
        placeholder="Entrez votre email"
        placeholderTextColor={colors.gray}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        //placeholderTextColor="#cc9900"
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={handleForgotPassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>token envoyé à votre addresse</Text>
            <Text style={styles.modalText}>
              s'il ya une address email existante
            </Text>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 15,
    backgroundColor: "#0A96E7",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  goBack: {
    position: "absolute",
    bottom: 140 ,
    right: 120,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#0A96E7",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: colors.primary,
  },
  title2: {
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 70,
    color: colors.gray,
  },
  input: {
    width: "80%",
    height: 40,
    borderWidth: 1,
    borderColor: colors.grayLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: colors.black,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
  },
  errorText: {
    color: "red",
    marginBottom: 20,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    width: 300,
    elevation: 5,
    height: 150,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.primary,
  },
  modalText: {
    fontSize: 16,
    color: colors.gray,
  },
});

export default ForgotPassword;
