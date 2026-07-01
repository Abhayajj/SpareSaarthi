import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import api, { setAuthToken, clearAuthToken, setUnauthenticatedListener } from '../api/apiConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data;
      setUserInfo(userData);
      setUserToken(userData.token);
      setAuthToken(userData.token); // ← sync in-memory token
      await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
      await AsyncStorage.setItem('userToken', userData.token);
    } catch (error) {
      console.error('Login Error:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name, email, password, businessName, address, phone) => {
    try {
      const response = await api.post('/auth/register', {
        name, email, password, businessName, address, phone
      });
      const userData = response.data;
      setUserInfo(userData);
      setUserToken(userData.token);
      setAuthToken(userData.token); // ← sync in-memory token
      await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
      await AsyncStorage.setItem('userToken', userData.token);
    } catch (error) {
      console.error('Registration Error:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUserInfo(null);
    clearAuthToken(); // ← clear in-memory token
    
    // Synchronously clear localStorage on Web to prevent any race condition before page reload
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userToken');
      } catch (err) {
        console.error('Error clearing localStorage:', err);
      }
    }

    await AsyncStorage.removeItem('userInfo');
    await AsyncStorage.removeItem('userToken');
    setIsLoading(false);
    
    if (Platform.OS === 'web') {
      window.location.href = '/';
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let userInfo = await AsyncStorage.getItem('userInfo');
      let userToken = await AsyncStorage.getItem('userToken');
      
      if (userInfo && userToken) {
        setAuthToken(userToken); // ← restore in-memory token immediately
        // Optionally fetch latest profile to get up to date coins
        try {
          const profileRes = await api.get('/auth/profile');
          userInfo = JSON.stringify({...JSON.parse(userInfo), ...profileRes.data});
          await AsyncStorage.setItem('userInfo', userInfo);
        } catch (e) {
          console.log('Could not refresh profile');
        }

        setUserInfo(JSON.parse(userInfo));
        setUserToken(userToken);
      }
      setIsLoading(false);
    } catch (e) {
      console.log('isLoggedIn error', e);
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const profileRes = await api.get('/auth/profile');
      setUserInfo(prev => {
        const updated = { ...prev, ...profileRes.data };
        AsyncStorage.setItem('userInfo', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.log('Could not refresh profile', e);
    }
  };

  useEffect(() => {
    setUnauthenticatedListener(() => {
      setUserToken(null);
      setUserInfo(null);
    });
    isLoggedIn();
    return () => {
      setUnauthenticatedListener(null);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ login, register, logout, isLoading, userToken, userInfo, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
