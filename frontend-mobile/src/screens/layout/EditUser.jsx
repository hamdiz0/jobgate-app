import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getToken } from "../../composable/local";
import colors from "../../constants/colors";
import dayjs from "dayjs";

const EditUser = () => {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleError = (error) => {
    console.error(error);
    setErrorMessage("An error occurred. Please try again.");
    setErrorModalVisible(true);
  };

  // Add these functions to handle opening and closing of modals
  const showErrorModal = (message) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const showSuccessModal = (message) => {
    setSuccessMessage(message);
    setSuccessModalVisible(true);
  };

  const closeErrorModal = () => {
    setErrorMessage("");
    setErrorModalVisible(false);
  };

  const onCloseSuccessModal = () => {
    setSuccessModalVisible(false);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}users/me`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      setUserProfile(data.data.user);
      setName(data.data.user.name);
      setEmail(data.data.user.email);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert(
        "Error",
        "An error occurred while fetching the user profile."
      );
    }
  };

  //email
  const handleUpdateEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showErrorModal("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    try {
      const token = await getToken();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}users/updateMe`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: email }),
        }
      );
      if (response.ok) {
        showSuccessModal("Email modifié correctement!");
      } else {
        showErrorModal(await response.text());
      }
    } catch (error) {
      handleError(error);
    }
  };

  //name
  const handleUpdateName = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}users/updateMe`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: name }),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        setUserProfile(updatedUser.data.user);
        showSuccessModal("Nom modifié correctement!");
        // Update AuthContext with new user profile
        // updateUserProfile(updatedUser.data.user);
      } else {
        showErrorModal(await response.text());
      }
    } catch (error) {
      handleError(error);
    }
  };

  // password
  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !passwordConfirm) {
      showErrorModal("Veuillez remplir tous les champs de mot de passe.");
      return;
    }

    if (newPassword !== passwordConfirm) {
      showErrorModal("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}users/updateMyPassword`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            passwordCurrent: oldPassword,
            password: newPassword,
            passwordConfirm,
          }),
        }
      );

      if (response.ok) {
        showSuccessModal("Mot de passe modifié correctement!");
      } else {
        showErrorModal(await response.text());
      }
    } catch (error) {
      handleError(error);
    }
  };

  const ErrorModal = ({ visible, message, onClose }) => {
    if (!visible) return null;

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{message}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const SuccessModal = ({ visible, message, onClose }) => {
    if (!visible) return null;

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{message}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Modifier le Profil</Text>
      {userProfile && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Nom: </Text>
            {userProfile.name}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Email: </Text>
            {userProfile.email}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Role: </Text>
            {userProfile.role}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Rejoint: </Text>
            {dayjs(userProfile.createdAt).format("MMM D, YYYY")}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Dernière mise à jour: </Text>
            {dayjs(userProfile.updatedAt).format("MMM D, YYYY")}
          </Text>
        </View>
      )}
      <TextInput
        style={styles.input}
        placeholder="Enter new name"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateName}>
        <Text style={styles.buttonText}>Modifier le Nom</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nouvelle addresse email"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateEmail}>
        <Text style={styles.buttonText}>Modifier votre addresse email</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Enter old password"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        secureTextEntry
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
        <Text style={styles.buttonText}>modifier Mot de passe</Text>
      </TouchableOpacity>
      <ErrorModal
        visible={errorModalVisible}
        message={errorMessage}
        onClose={closeErrorModal}
      />
      {/* Success Modal */}
      <SuccessModal
        visible={successModalVisible}
        message={successMessage}
        onClose={onCloseSuccessModal}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.grayLight,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: colors.dark,
  },
  infoContainer: {
    width: "100%",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: colors.dark,
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: 15,
    marginVertical: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderColor: colors.grayLight,
    borderWidth: 1,
    fontSize: 16,
  },
  button: {
    width: "100%",
    backgroundColor: colors.primary,
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalMessage: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default EditUser;
