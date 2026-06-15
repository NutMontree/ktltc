import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, ActivityIndicator, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

import LoginScreen from './src/screens/LoginScreen';
import QRProfileScreen from './src/screens/QRProfileScreen';
import TrackingScreen from './src/screens/TrackingScreen';

const API_URL = 'https://ktltc.ac.th';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'qr' | 'tracking'>('qr');
  const [userData, setUserData] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // Attempt to verify token by calling status API
        const res = await axios.get(`${API_URL}/api/mobile/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          // Ideally the token decode or login response should save user info.
          // For simplicity here, we assume if token is valid, we can fetch user profile or decode JWT.
          // To make it robust, you might save user info in SecureStore on login.
          const storedUser = await SecureStore.getItemAsync('userInfo');
          if (storedUser) {
             setUserData(JSON.parse(storedUser));
          } else {
             // Fallback
             setUserData({ id: 'UNKNOWN', name: 'Student' });
          }
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.log('Token invalid or expired');
      await SecureStore.deleteItemAsync('userToken');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = async () => {
    // In a real app, LoginScreen should save userInfo to SecureStore
    // Here we'll just check again
    await checkToken();
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userInfo');
    setIsAuthenticated(false);
    setUserData(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {!isAuthenticated ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : currentScreen === 'qr' ? (
        <QRProfileScreen 
          userId={userData?.id || 'NO_ID'} 
          studentName={userData?.name || 'Student Name'}
          onLogout={handleLogout}
          onGoToTracking={() => setCurrentScreen('tracking')}
        />
      ) : (
        <TrackingScreen 
          onBack={() => setCurrentScreen('qr')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
