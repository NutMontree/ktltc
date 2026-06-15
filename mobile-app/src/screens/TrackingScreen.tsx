import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_URL = 'https://ktltc.ac.th';
const LOCATION_TASK_NAME = 'BACKGROUND_LOCATION_TASK';

// Define the background task globally
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Background Location Error:", error);
    return;
  }
  if (data) {
    const { locations } = data as any;
    if (locations && locations.length > 0) {
      const { latitude, longitude } = locations[0].coords;
      
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          await axios.post(`${API_URL}/api/tracking/update`, {
            latitude,
            longitude
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("Background location updated:", latitude, longitude);
        }
      } catch (err) {
        console.error("Failed to update background location");
      }
    }
  }
});

export default function TrackingScreen({ onBack }: { onBack: () => void }) {
  const [isTracking, setIsTracking] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    requestPermissions();
    checkStatus();

    // Poll status every 30 seconds to see if teacher scanned them
    const interval = setInterval(() => {
      checkStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const requestPermissions = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      Alert.alert("จำเป็นต้องใช้ตำแหน่ง", "กรุณาอนุญาตการเข้าถึงตำแหน่งเพื่อใช้งานระบบนี้");
      return;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      Alert.alert("จำกัดการใช้งาน", "แอปอาจจะไม่สามารถอัปเดตตำแหน่งได้หากคุณพับหน้าจอ กรุณาอนุญาตตำแหน่งแบบ 'ตลอดเวลา' (Always Allow)");
    } else {
      setPermissionGranted(true);
    }
  };

  const checkStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) return;

      const res = await axios.get(`${API_URL}/api/mobile/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const active = res.data.isTrackingActive;
      
      if (active && !isTracking) {
        startTracking();
      } else if (!active && isTracking) {
        stopTracking();
      }

      setIsTracking(active);
    } catch (error) {
      console.error("Failed to check status:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const startTracking = async () => {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (!isRegistered) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10, // Update every 10 meters
          deferredUpdatesInterval: 10000,
          showsBackgroundLocationIndicator: true,
        });
      }
      setIsTracking(true);
    } catch (err) {
      console.error("Failed to start tracking", err);
    }
  };

  const stopTracking = async () => {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
      setIsTracking(false);
    } catch (err) {
      console.error("Failed to stop tracking", err);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>{'< กลับหน้า QR Code'}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {loadingStatus ? (
          <ActivityIndicator size="large" color="#3b82f6" />
        ) : (
          <>
            <View style={[styles.statusIndicator, isTracking ? styles.statusActive : styles.statusInactive]}>
              <View style={[styles.pulse, isTracking ? styles.pulseActive : styles.pulseInactive]} />
            </View>

            <Text style={styles.statusTitle}>
              {isTracking ? "กำลังติดตามตำแหน่ง" : "ไม่ได้ออกนอกสถานศึกษา"}
            </Text>
            
            <Text style={styles.statusDesc}>
              {isTracking 
                ? "คุณได้ทำการสแกนออกแล้ว ระบบกำลังส่งพิกัด GPS ของคุณไปยังครูแบบเรียลไทม์ (ทำงานพื้นหลังได้)"
                : "ขณะนี้คุณอยู่ในสถานศึกษา ระบบไม่ได้ทำการติดตามตำแหน่งของคุณ"}
            </Text>

            {!permissionGranted && (
              <Text style={styles.warningText}>
                ⚠️ คุณยังไม่ได้อนุญาตการเข้าถึงตำแหน่งแบบ "ตลอดเวลา" แอปอาจหยุดทำงานเมื่อพับหน้าจอ
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 50,
  },
  backButton: {
    padding: 20,
  },
  backText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  statusIndicator: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 4,
  },
  statusActive: {
    borderColor: '#34d399',
    backgroundColor: '#ecfdf5',
  },
  statusInactive: {
    borderColor: '#e4e4e7',
    backgroundColor: '#f4f4f5',
  },
  pulse: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  pulseActive: {
    backgroundColor: '#10b981',
  },
  pulseInactive: {
    backgroundColor: '#a1a1aa',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#18181b',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusDesc: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 22,
  },
  warningText: {
    marginTop: 30,
    fontSize: 12,
    color: '#f59e0b',
    textAlign: 'center',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 8,
  }
});
