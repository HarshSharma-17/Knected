
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Register new user
export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await axios.post(`${API_URL}/register`, {
    name,
    email,
    password,
  });

  return response.data;
};

// Login existing user
export const loginUser = async (
  email: string,
  password: string
) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });

  return response.data;
};

// Get currently logged-in user
export const getCurrentUser = async (token: string) => {
  const response = await axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};