import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Share, Linking, Alert } from 'react-native';
import { Bell, Smile, UserPlus, PhoneCall, FileText, LogOut } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

const MENU_ITEMS = [
  { id: '1', title: 'Notifications', icon: Bell, action: 'navigate', target: 'Notifications' },
  { id: '2', title: 'Your Details', icon: Smile, action: 'navigate', target: 'UserDetails' },
  { id: 'divider', isDivider: true },
  { id: '3', title: 'Invite & Earn', icon: UserPlus, badge: '100 coins', action: 'share' },
  { id: '4', title: 'Call Customer Care', icon: PhoneCall, action: 'call' },
  { id: '5', title: 'Privacy Policy', icon: FileText, action: 'navigate', target: 'PrivacyPolicy' },
];

export default function ProfileScreen({ navigation }) {
  const { userInfo, logout } = useContext(AuthContext);

  const handleMenuPress = async (item) => {
    if (item.action === 'navigate') {
      navigation.navigate(item.target);
    } else if (item.action === 'share') {
      try {
        await Share.share({
          message: 'Join SpareSaarthi today! Use my invite code to get 100 bonus coins on your first order. Download the app now.',
        });
      } catch (error) {
        Alert.alert('Error', 'Could not share the invite link.');
      }
    } else if (item.action === 'call') {
      const phoneNumber = 'tel:+916387244265';
      Linking.canOpenURL(phoneNumber).then(supported => {
        if (!supported) {
          Alert.alert('Phone Call Not Supported', 'Please dial +91 6387244265 manually on your phone.');
        } else {
          return Linking.openURL(phoneNumber);
        }
      }).catch(err => console.error('An error occurred', err));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/150/e2e8f0/0f172a?text=Avatar' }} 
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>{userInfo?.name || 'User'}</Text>
          <Text style={styles.userBusiness}>{userInfo?.businessName}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item, index) => {
            if (item.isDivider) {
              return <View key={`div-${index}`} style={styles.divider} />;
            }
            const Icon = item.icon;
            return (
              <TouchableOpacity 
                key={item.id} 
                style={styles.menuItem}
                onPress={() => handleMenuPress(item)}
              >
                <View style={styles.menuItemLeft}>
                  <Icon color="#475569" size={24} style={styles.menuIcon} />
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </View>
                {item.badge && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>🪙 {item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={logout}>
            <View style={styles.menuItemLeft}>
              <LogOut color="#475569" size={24} style={styles.menuIcon} />
              <Text style={styles.menuTitle}>Logout</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.versionText}>App version 1.8.3</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  userBusiness: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuTitle: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#cbd5e1',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  badgeContainer: {
    backgroundColor: '#ffedd5', // orange-100
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#ea580c', // orange-600
    fontWeight: 'bold',
    fontSize: 12,
  },
  logoutContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  versionText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 10,
    marginLeft: 40,
  },
});
