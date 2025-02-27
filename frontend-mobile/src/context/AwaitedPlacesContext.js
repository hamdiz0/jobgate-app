// AwaitedPlacesContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AwaitedPlacesContext = createContext();

export const AwaitedPlacesProvider = ({ children }) => {
  const [awaitedPlaces, setAwaitedPlaces] = useState([]);

  useEffect(() => {
    fetchAwaitedPlaces();
  }, []);

  const fetchAwaitedPlaces = async () => {
    try {
      const storedItems = await AsyncStorage.getItem("awaitedPlaces");
      if (storedItems !== null) {
        setAwaitedPlaces(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Error fetching awaited places:", error);
    }
  };

  const addPlace = async (place) => {
    const updatedPlaces = [...awaitedPlaces, place];
    setAwaitedPlaces(updatedPlaces);
    await AsyncStorage.setItem("awaitedPlaces", JSON.stringify(updatedPlaces));
  };

  const updatePlace = async (updatedPlace) => {
    const updatedPlaces = awaitedPlaces.map((place) =>
      place.id === updatedPlace.id ? updatedPlace : place
    );
    setAwaitedPlaces(updatedPlaces);
    await AsyncStorage.setItem("awaitedPlaces", JSON.stringify(updatedPlaces));
  };

  const deletePlace = async (id) => {
    const updatedPlaces = awaitedPlaces.filter((place) => place.id !== id);
    setAwaitedPlaces(updatedPlaces);
    await AsyncStorage.setItem("awaitedPlaces", JSON.stringify(updatedPlaces));
  };

  return (
    <AwaitedPlacesContext.Provider
      value={{ awaitedPlaces, addPlace, updatePlace, deletePlace }}
    >
      {children}
    </AwaitedPlacesContext.Provider>
  );
};
