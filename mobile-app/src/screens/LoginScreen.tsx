import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Replace this with your actual server IP address or domain when deploying
const API_URL = 'https://ktltc.ac.th';

export default function LoginScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/mobile/login`, {
        username,
        password
      });

      if (response.data.success && response.data.token) {
        // Save token securely
        await SecureStore.setItemAsync('userToken', response.data.token);
        onLoginSuccess();
      } else {
        Alert.alert('ล้มเหลว', response.data.message || 'รหัสผ่านไม่ถูกต้อง');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
      Alert.alert('ข้อผิดพลาด', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>KTL Tracking</Text>
        <Text style={styles.subtitle}>ระบบติดตามพิกัดนักเรียน</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>ชื่อผู้ใช้ (Username)</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="กรอกชื่อผู้ใช้งาน..."
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>รหัสผ่าน (Password)</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="กรอกรหัสผ่าน..."
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3f3f46',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#18181b',
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
