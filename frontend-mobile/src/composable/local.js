import AsyncStorage from "@react-native-async-storage/async-storage";

const getToken = async () => {
  try {
    const tokenString = await AsyncStorage.getItem("token");
    const token = JSON.parse(tokenString);
    return token;
  } catch (error) {
    console.error("Error retrieving token from AsyncStorage:", error);
    return null;
  }
};

export { getToken };
