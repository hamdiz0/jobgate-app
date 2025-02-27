import axios from "axios";
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
export const login = async (data) => {
  try {
    const res = await axios.post(`${apiUrl}users/login`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res;
  } catch (error) {
    console.error(error);
  }
};
//register
export const register = async (data) => {
  try {
    const res = await axios.post(`${apiUrl}users/signup`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      return res.data;
    } else {
      return res.error;
    }
  } catch (error) {
    console.error(error);
  }
};

//forgotPassword
// api.js
export const forgotPassword = async (email) => {
  try {
    const res = await axios.post(
      `${apiUrl}users/forgotPassword`,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.data; // Assuming the response contains the necessary data
  } catch (error) {
    throw error; // Rethrow the error to handle it in the component
  }
};
