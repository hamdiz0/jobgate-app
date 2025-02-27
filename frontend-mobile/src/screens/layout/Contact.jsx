import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  Text,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as MailComposer from "expo-mail-composer";
import colors from "../../constants/colors";

const Contact = () => {
  const [feedback, setFeedback] = useState("");

  const sendFeedback = () => {
    // Check if feedback is not empty
    if (!feedback.trim()) {
      Alert.alert("Feedback is required");
      return;
    }

    // Construct the email
    const emailSubject = "Feedback from App";
    const emailAddress = "azizouachem0@gmail.com";

    // Open email composer with pre-filled fields
    MailComposer.composeAsync({
      recipients: [emailAddress],
      subject: emailSubject,
      body: feedback,
    })
      .then((result) => {
        if (result.status === "sent") {
          // Email sent successfully
          Alert.alert("Feedback sent successfully");
          setFeedback(""); // Clear feedback input
        } else {
          // Email not sent
          Alert.alert("Failed to send feedback");
        }
      })
      .catch((error) => {
        console.error("Error sending feedback:", error);
        Alert.alert("An error occurred while sending feedback");
      });
  };

  const handleCallUs = () => {
    const phoneNumber = "26842050";
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Enter your feedback"
        value={feedback}
        onChangeText={setFeedback}
        placeholderTextColor={colors.placeholder}
      />
      <TouchableOpacity style={styles.button} onPress={sendFeedback}>
        <Text>Envoyer feedback</Text>
        <MaterialIcons name="email" size={24} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleCallUs}>
        <Text>Appelle-Nous</Text>
        <MaterialIcons name="phone" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  input: {
    height: 150,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    borderRadius: 5,
    bottom: 10,
  },
  button: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 20,
    alignItems: "center",
  },
});

export default Contact;
