import React, { createContext, useState, useEffect } from "react";

export const PlacesContext = createContext();

export const PlacesProvider = ({ children }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  return (
    <PlacesContext.Provider value={{ places, setPlaces, fetchPlaces, loading }}>
      {children}
    </PlacesContext.Provider>
  );
};
