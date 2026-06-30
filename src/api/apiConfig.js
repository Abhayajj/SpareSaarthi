import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEV_URL = Platform.select({
  android: 'http://172.19.34.76:5000/api',
  ios: 'http://172.19.34.76:5000/api',
  default: 'http://localhost:5000/api',
});

const PROD_URL = 'https://sparesaarthi-backend.onrender.com/api';

const isProd = !__DEV__ || (Platform.OS === 'web' && window.location.hostname !== 'localhost');
const BASE_URL = isProd ? PROD_URL : DEV_URL;

// In-memory token store — avoids async issues in axios interceptors on web.
// This is set immediately on login/app-load so the interceptor can read it synchronously.
let _authToken = null;

export const setAuthToken = (token) => {
  _authToken = token;
};

export const clearAuthToken = () => {
  _authToken = null;
};

// On app boot, restore token from AsyncStorage into memory
AsyncStorage.getItem('userToken').then((token) => {
  if (token) _authToken = token;
});

const api = axios.create({
  baseURL: BASE_URL,
});

// Synchronous interceptor — reads from in-memory token (always available)
api.interceptors.request.use(
  (config) => {
    if (_authToken) {
      config.headers.Authorization = `Bearer ${_authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let _unauthListener = null;

export const setUnauthenticatedListener = (listener) => {
  _unauthListener = listener;
};

// Response interceptor to handle token expiration/invalid tokens (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        await AsyncStorage.removeItem('userInfo');
        await AsyncStorage.removeItem('userToken');
        clearAuthToken();
        if (_unauthListener) {
          _unauthListener();
        }
        if (Platform.OS === 'web') {
          window.location.reload();
        }
      } catch (e) {
        console.error('Error clearing token on 401:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
