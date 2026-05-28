import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/apiConfig';

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
      await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
      await AsyncStorage.setItem('userToken', userData.token);
    } catch (error) {
      console.error('Login Error:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name, email, password, businessName, address) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        businessName,
        address
      });
      const userData = response.data;
      setUserInfo(userData);
      setUserToken(userData.token);
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
    await AsyncStorage.removeItem('userInfo');
    await AsyncStorage.removeItem('userToken');
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let userInfo = await AsyncStorage.getItem('userInfo');
      let userToken = await AsyncStorage.getItem('userToken');
      
      if (userInfo && userToken) {
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

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ login, register, logout, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};
