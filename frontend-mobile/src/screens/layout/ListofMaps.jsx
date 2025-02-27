import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Card } from "react-native-paper";
import colors from "../../constants/colors";
import { getToken } from "../../composable/local";
import { AwaitedPlacesContext } from "../../context/AwaitedPlacesContext";

const ListofMaps = ({ navigation }) => {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserPlaces, setShowUserPlaces] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showFullDescriptions, setShowFullDescriptions] = useState({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [editPlaceData, setEditPlaceData] = useState({
    id: null,
    name: "",
    description: "",
  });
  const [updating, setUpdating] = useState(false);

  const { addPlace, updatePlace, deletePlace } =
    useContext(AwaitedPlacesContext);

  useFocusEffect(
    React.useCallback(() => {
      fetchUser();
      fetchPlaces();
    }, [])
  );

  const fetchUser = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }
      const data = await response.json();
      setUserId(data.data.user._id);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchPlaces = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}places`);
      if (!response.ok) {
        throw new Error("Failed to fetch places");
      }
      const data = await response.json();
      setPlaces(data.data.places);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching places:", error);
      Alert.alert("Error", "An error occurred while fetching the places.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showUserPlaces) {
      setFilteredPlaces(
        places.filter((place) => place.createdBy?._id === userId)
      );
    } else {
      setFilteredPlaces(places);
    }
  }, [showUserPlaces, places, userId]);

  const handleTogglePlaces = () => {
    setShowUserPlaces(!showUserPlaces);
  };

  const toggleDescription = (id) => {
    setShowFullDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddToAwaited = async (item) => {
    try {
      await addPlace(item);
      navigation.navigate("Favoris", { selectedItem: item });
    } catch (error) {
      console.error("Error adding item to awaited places:", error);
    }
  };

  const openEditModal = (item) => {
    setEditPlaceData({
      id: item.id,
      name: item.name,
      description: item.description,
    });
    setEditModalVisible(true);
  };

  const handleEditPlace = async () => {
    setUpdating(true);
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}places/${editPlaceData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editPlaceData.name,
            description: editPlaceData.description,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to edit place");
      }
      const updatedPlace = await response.json();
      setPlaces((prevPlaces) =>
        prevPlaces.map((place) =>
          place.id === updatedPlace.data.place.id
            ? updatedPlace.data.place
            : place
        )
      );
      await updatePlace(updatedPlace.data.place);
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error editing place:", error);
      Alert.alert("Error", "An error occurred while editing the place.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (item) => {
    setPlaceToDelete(item);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!placeToDelete) return;
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}places/${placeToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete place");
      }
      setPlaces((prevPlaces) =>
        prevPlaces.filter((place) => place.id !== placeToDelete.id)
      );
      await deletePlace(placeToDelete.id);
      setDeleteModalVisible(false);
    } catch (error) {
      console.error("Error deleting place:", error);
      Alert.alert("Error", "An error occurred while deleting the place.");
      setDeleteModalVisible(false);
    }
  };

  const renderPlace = ({ item }) => {
    const formattedDescription = showFullDescriptions[item.id]
      ? item.description
      : item.description.slice(0, 30) +
        (item.description.length > 30 ? "..." : "");

    const formattedDate = (date) => {
      return new Date(date).toLocaleDateString();
    };

    const userIsAdmin = false;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.placeName}>{item.name}</Text>
          <Text style={styles.placeDescription}>
            Addresse : {item?.address || item.location.address}
          </Text>
          <Text style={styles.placeDescription}>
            Description : {formattedDescription}
            {item.description.length > 30 && (
              <Text
                style={styles.showMore}
                onPress={() => toggleDescription(item.id)}
              >
                {showFullDescriptions[item.id] ? " Show less" : " Show more"}
              </Text>
            )}
          </Text>
          <Text style={styles.placeDate}>Type : {item.type}</Text>
          <Text style={styles.placeDate}>
            Created at: {formattedDate(item.createdAt)}
          </Text>
          <Text style={styles.placeDate}>
            Updated at: {formattedDate(item.updatedAt)}
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAddToAwaited(item)}
            >
              <AntDesign name="pluscircleo" size={24} color={colors.primary} />
            </TouchableOpacity>
            {(userIsAdmin || item.createdBy?._id === userId) && (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openEditModal(item)}
                >
                  <Feather name="edit" size={24} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(item)}
                >
                  <AntDesign name="delete" size={24} color="red" />
                </TouchableOpacity>
              </>
            )}
          </View>
          <View style={styles.createdByContainer}>
            <Text style={styles.createdByText}>
              Créer Par: {item.createdBy?.name || "Unknown"}
            </Text>
            <Text style={styles.createdByText}>
              Role: {item.createdBy?.role || "Unknown"}
            </Text>
            <Text style={styles.createdByText}>
              Créer En: {formattedDate(item.createdAt)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={handleTogglePlaces}
      >
        <Text style={styles.toggleButtonText}>
          {showUserPlaces ? "Show All Places" : "Show My Places"}
        </Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={filteredPlaces}
          renderItem={renderPlace}
          keyExtractor={(item) => item.id}
        />
      )}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Modifier Place</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editPlaceData.name}
              onChangeText={(text) =>
                setEditPlaceData({ ...editPlaceData, name: text })
              }
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={editPlaceData.description}
              onChangeText={(text) =>
                setEditPlaceData({ ...editPlaceData, description: text })
              }
              multiline
            />
            {updating ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleEditPlace}
                >
                  <Text style={styles.modalButtonText}>Enregistrer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
      <Modal
        visible={deleteModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmer Suppression</Text>
            <Text>Etes vous sur de vouloir supprimer cette place?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.modalButtonText}>Oui</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Non</Text>
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
    backgroundColor: colors.grayLight,
    padding: 15,
  },
  toggleButton: {
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  toggleButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    height: 29,
  },
  card: {
    marginBottom: 16,
  },
  placeName: {
    marginBottom: 15,
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
    textDecorationLine: "underline",
  },
  placeDescription: {
    marginTop: 8,
    fontSize: 16,
    color: colors.black,
  },
  showMore: {
    color: colors.primary,
  },
  placeDate: {
    marginTop: 8,
    fontSize: 15,
    color: colors.primary,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  actionButton: {
    marginLeft: 16,
  },
  createdByContainer: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    margin: 10,
  },
  createdByText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    alignSelf: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    marginVertical: 8,
    borderRadius: 5,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: colors.grayLight,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ListofMaps;
