import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";

const Map = () => {
  const [places, setPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapType, setMapType] = useState("standard");
  const [loading, setLoading] = useState(false);

  // `${process.env.EXPO_PUBLIC_API_URL}places/getMyPlaces`

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}places`
        );
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

    fetchPlaces();
  }, [places]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error("Error getting current location:", error);
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
  };

  const toggleMapType = () => {
    setMapType((prevMapType) =>
      prevMapType === "standard" ? "satellite" : "standard"
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapType={mapType}
        initialRegion={{
          latitude: 35.0068,
          longitude: 10.6866,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
        showsUserLocation
        showsMyLocationButton
        onPress={handleMapPress}
      >
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Mon Location"
            pinColor="blue"
          />
        )}

        {places.map((place, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: place.location.coordinates[1],
              longitude: place.location.coordinates[0],
            }}
            title={place.name}
            description={place.type}
          >
            <Callout>
              <View>
                <Text>{place.name}</Text>
                <Text>{place.type}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.locationButton} onPress={toggleMapType}>
        <Text style={styles.buttonText}>
          Switch to {mapType === "standard" ? "Satellite" : "Standard"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Map;
