import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function QRProfileScreen({ userId, studentName, onLogout, onGoToTracking }: { userId: string, studentName: string, onLogout: () => void, onGoToTracking: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>บัตรประจำตัวอิเล็กทรอนิกส์</Text>
        <Text style={styles.headerSubtitle}>ใช้สำหรับสแกนเข้า-ออกสถานศึกษา</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.name}>{studentName}</Text>
        <Text style={styles.idText}>รหัส: {userId}</Text>

        <View style={styles.qrContainer}>
          <QRCode
            value={userId}
            size={200}
            color="black"
            backgroundColor="white"
          />
        </View>

        <Text style={styles.instructions}>
          โปรดแสดง QR Code นี้ให้เจ้าหน้าที่สแกน{"\n"}เมื่อต้องการออกจากสถานศึกษา
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.trackButton} onPress={onGoToTracking}>
          <Text style={styles.trackButtonText}>ดูสถานะการติดตาม GPS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3b82f6',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#bfdbfe',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#18181b',
    marginBottom: 4,
    textAlign: 'center',
  },
  idText: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 30,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f4f4f5',
    marginBottom: 30,
  },
  instructions: {
    fontSize: 12,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    marginTop: 'auto',
  },
  trackButton: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  trackButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#bfdbfe',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
