import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "../composable/local";
import { login as loginApi } from "../apis/api";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await getToken();
      if (token) {
        const user = await AsyncStorage.getItem("user");
        setCurrentUser(JSON.parse(user));
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const data = { email, password };
      const res = await loginApi(data);
      if (res.data.status.trim() === "success") {
        await AsyncStorage.setItem("token", JSON.stringify(res.data.token));
        await AsyncStorage.setItem("user", JSON.stringify(res.data.data.user));
        setCurrentUser(res.data.data.user);
        setIsLoggedIn(true);
      } else {
        throw new Error(res.data.message || "An error occurred during login");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, isLoggedIn, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
