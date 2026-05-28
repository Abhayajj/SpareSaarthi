import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Since the backend is running locally and we might be testing on web or emulator,
// localhost works for web/iOS emulator. For Android emulator, use 10.0.2.2.
// For physical devices, use the local IPv4 address (e.g. 192.168.1.X).
const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor to add the token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
