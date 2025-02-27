// Favoris.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Card } from "react-native-paper";
import colors from "../../constants/colors";
import { AwaitedPlacesContext } from "../../context/AwaitedPlacesContext";

const Favoris = () => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const { awaitedPlaces, deletePlace } = useContext(AwaitedPlacesContext);

  const handleDelete = (item) => {
    setPlaceToDelete(item);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!placeToDelete) return;
    try {
      await deletePlace(placeToDelete.id);
      setDeleteModalVisible(false);
    } catch (error) {
      console.error("Error deleting place:", error);
      Alert.alert("Error", "An error occurred while deleting the place.");
      setDeleteModalVisible(false);
    }
  };

  const renderPlace = ({ item }) => {
    const formattedDate = (date) => {
      return new Date(date).toLocaleDateString();
    };

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.placeName}>{item.name}</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(item)}
            >
              <AntDesign name="delete" size={24} color="red" />
            </TouchableOpacity>
          </View>
          <Text style={styles.placeDescription}>{item.description}</Text>
          <Text style={styles.placeDescription}>{item.address}</Text>
          <Text style={styles.placeDate}>
            Ajouter En: {formattedDate(item.createdAt)}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={awaitedPlaces}
        renderItem={renderPlace}
        keyExtractor={(item) => item.id}
      />
      <Modal
        visible={deleteModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this place?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    backgroundColor: "#fff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  placeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  },
  placeDescription: {
    marginTop: 8,
    fontSize: 18,
    color: colors.textSecondary,
  },
  placeDate: {
    marginTop: 8,
    fontSize: 16,
    color: colors.textSecondary,
  },
  actionButton: {
    marginLeft: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  modalButtonDelete: {
    backgroundColor: "red",
  },
  modalButtonCancel: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Favoris;
