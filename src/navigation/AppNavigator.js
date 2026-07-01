import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Grid, CircleDollarSign, ShoppingBag, ShoppingCart } from 'lucide-react-native';
import { View, ActivityIndicator, Text, Platform } from 'react-native';
import api from '../api/apiConfig';
import { registerForPushNotificationsAsync } from '../utils/notifications';

import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CoinsScreen from '../screens/CoinsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import UserDetailsScreen from '../screens/UserDetailsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import ProductsScreen from '../screens/ProductsScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Auth = createNativeStackNavigator();

function AuthStack() {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="Login" component={LoginScreen} />
      <Auth.Screen name="Register" component={RegisterScreen} />
    </Auth.Navigator>
  );
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') return <Home color={color} size={size} />;
          if (route.name === 'Categories') return <Grid color={color} size={size} />;
          if (route.name === 'Coins') return <CircleDollarSign color={color} size={size} />;
          if (route.name === 'Orders') return <ShoppingBag color={color} size={size} />;
          if (route.name === 'Cart') {
            // Check if cart has items to show badge
            const { cartItems } = useContext(CartContext);
            const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
            
            return (
              <View>
                <ShoppingCart color={color} size={size} />
                {cartCount > 0 && (
                  <View style={{
                    position: 'absolute', right: -8, top: -5, backgroundColor: '#ef4444', 
                    borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center'
                  }}>
                    <Text style={{color: '#fff', fontSize: 10, fontWeight: 'bold'}}>{cartCount}</Text>
                  </View>
                )}
              </View>
            );
          }
        },
        tabBarActiveTintColor: '#ea580c', // orange-600
        tabBarInactiveTintColor: '#64748b',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff', // white background for cleaner look
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          paddingBottom: 5,
          height: 60,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Coins" component={CoinsScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoading, userToken } = useContext(AuthContext);

  React.useEffect(() => {
    if (userToken) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          api.put('/auth/push-token', { token }).catch(err => {
            console.error('Error saving push token to backend:', err);
          });
        }
      });
    }
  }, [userToken]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken === null ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="Products" component={ProductsScreen} />
          <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="UserDetails" component={UserDetailsScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ presentation: 'modal' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
