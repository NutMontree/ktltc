'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Server, ShieldCheck, Wifi, AlertTriangle, RefreshCcw, Download, CheckCircle, Globe, ArrowDown, ArrowUp, RotateCw, BarChart2 } from 'lucide-react';
import { networkDevices } from '@/lib/networkDevices';
import TrafficGraphModal, { TrafficHistoryPoint } from './components/TrafficGraphModal';

interface DeviceStatus {
  id: string;
  ip: string;
  name: string;
  location: string;
  type: string;
  brand: string;
  status: 'online' | 'offline' | 'loading';
  rx?: number;
  tx?: number;
  isRebooting?: boolean;
}

export default function NetworkMonitorPage() {
  // ================= State: Topology Scanner =================
  const [devices, setDevices] = useState<DeviceStatus[]>(() =>
    networkDevices.map(d => ({
      ...d,
      status: 'loading' as const,
      rx: 0,
      tx: 0
    }))
  );
  const [isScanning, setIsScanning] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('--:--:--');

  // ================= State: Traffic Graph Modal =================
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [graphInitialDeviceId, setGraphInitialDeviceId] = useState<string>('all');
  const [trafficHistory, setTrafficHistory] = useState<TrafficHistoryPoint[]>([]);

  // ================= State: Speedtest =================
  const [isTesting, setIsTesting] = useState(false);
  const [speedResult, setSpeedResult] = useState<string>('--');
  const [pingResult, setPingResult] = useState<string>('--');
  const [testLog, setTestLog] = useState<string>('พร้อมทดสอบสปีด');

  // ================= State: Device Port Modal =================
  const [selectedDevice, setSelectedDevice] = useState<DeviceStatus | null>(null);
  const [devicePorts, setDevicePorts] = useState<any[]>([]);
  const [isFetchingPorts, setIsFetchingPorts] = useState(false);
  const [portLabels, setPortLabels] = useState<Record<string, Record<string, string>>>({});
  const [portError, setPortError] = useState<string | null>(null);
  
  // ================= State: Single Port Details =================
  const [selectedPort, setSelectedPort] = useState<any | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [isSavingLabel, setIsSavingLabel] = useState(false);

  // ================= State: WAN Circuits =================
  const [wanCircuits, setWanCircuits] = useState<Array<{ id: string; name: string; ip: string; status: 'online' | 'offline' | 'loading' }>>([
    { id: 'uninet', name: 'UNINET', ip: '202.29.224.34', status: 'online' },
    { id: 'cat', name: 'วงจร CAT (NT)', ip: '122.154.155.45', status: 'offline' }
  ]);

  // ================= Functions: Topology Scanner =================
  const scanNetwork = async (isBackground = false) => {
    if (!isBackground) setIsScanning(true);
    if (!isBackground && devices.length === 0) {
      setDevices(prev => prev.map(d => ({ ...d, status: 'loading' })));
    }
    
    try {
      const res = await fetch('/api/network-scan', { cache: 'no-store' });
      const json = await res.json();
      
      if (json.success) {
        if (json.wanCircuits) {
          setWanCircuits(json.wanCircuits);
        }
        // Keep rebooting state if it exists
        setDevices(prev => {
          return json.data.map((newDev: DeviceStatus) => {
            const existing = prev.find(p => p.id === newDev.id);
            if (existing?.isRebooting) {
              return { ...newDev, isRebooting: true, status: 'loading' };
            }
            return newDev;
          });
        });
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setLastUpdate(timeStr);

        // Record traffic snapshot into history (up to 30 snapshots)
        let totalDl = 0;
        let totalUl = 0;
        const deviceMap: Record<string, { rx: number; tx: number; name: string; location: string }> = {};

        json.data.forEach((d: DeviceStatus) => {
          if (d.status === 'online') {
            if (d.id !== 'fw-1' && d.id !== 'core-1') {
              totalDl += d.rx || 0;
              totalUl += d.tx || 0;
            }
            deviceMap[d.id] = {
              rx: d.rx || 0,
              tx: d.tx || 0,
              name: d.name,
              location: d.location
            };
          }
        });

        const coreDev = json.data.find((d: DeviceStatus) => d.id === 'core-1');
        const campusDl = coreDev?.rx !== undefined && coreDev.rx > 0 ? coreDev.rx : Number(totalDl.toFixed(1));
        const campusUl = coreDev?.tx !== undefined && coreDev.tx > 0 ? coreDev.tx : Number(totalUl.toFixed(1));

        setTrafficHistory(prev => {
          const next = [
            ...prev,
            {
              time: timeStr,
              timestamp: now.getTime(),
              totalDl: campusDl,
              totalUl: campusUl,
              devices: deviceMap
            }
          ];
          return next.slice(-30);
        });
      }

      // Fetch labels in background
      const labelRes = await fetch('/api/port-labels', { cache: 'no-store' });
      const labelJson = await labelRes.json();
      if (labelJson.success) {
        setPortLabels(labelJson.data);
      }
    } catch (error) {
      console.error('Scan failed', error);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    scanNetwork();
    const interval = setInterval(() => {
      scanNetwork(true);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // ================= Functions: Reboot Device =================
  const handleReboot = async (e: React.MouseEvent, device: DeviceStatus) => {
    e.stopPropagation(); // Prevent opening the port details modal
    
    const confirmReboot = window.confirm(
      `⚠️ คำเตือน!\n\nคุณแน่ใจหรือไม่ที่จะสั่งรีสตาร์ทอุปกรณ์ "${device.location}"?\nการกระทำนี้จะทำให้อินเทอร์เน็ตของตึกนี้ถูกตัดขาดประมาณ 3-5 นาที`
    );
    
    if (!confirmReboot) return;

    // Set device to rebooting state
    setDevices(prev => prev.map(d => d.id === device.id ? { ...d, isRebooting: true, status: 'loading' } : d));

    try {
      const res = await fetch('/api/device-reboot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: device.ip, type: device.type, name: device.location })
      });
      const json = await res.json();
      
      if (json.success) {
        alert(`✅ ${json.message}`);
      } else {
        alert(`❌ ไม่สามารถรีสตาร์ทอุปกรณ์ได้: ${json.error}`);
        // Revert rebooting state on failure
        setDevices(prev => prev.map(d => d.id === device.id ? { ...d, isRebooting: false } : d));
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับ API');
      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, isRebooting: false } : d));
    }
  };

  // ================= Functions: Fetch Ports =================
  const openDeviceDetails = async (device: DeviceStatus) => {
    if (device.status === 'offline' || device.isRebooting) return;
    
    setSelectedDevice(device);
    setSelectedPort(null);
    setPortError(null);
    setIsFetchingPorts(true);
    setDevicePorts([]);

    try {
      const res = await fetch(`/api/device-ports?ip=${device.ip}&type=${device.type}&brand=${device.brand || ''}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setDevicePorts(json.data);
      } else {
        setPortError(json.error || 'เกิดข้อผิดพลาดในการดึงข้อมูลจากอุปกรณ์');
      }
    } catch (error) {
      console.error('Failed to fetch ports', error);
      setPortError('เซิร์ฟเวอร์ไม่ตอบสนอง หรือเชื่อมต่อ API ไม่ได้');
    } finally {
      setIsFetchingPorts(false);
    }
  };

  const closeDeviceDetails = () => {
    setSelectedDevice(null);
    setSelectedPort(null);
    setDevicePorts([]);
  };

  const handlePortClick = (port: any) => {
    setSelectedPort(port);
    const ip = selectedDevice?.ip;
    setEditingLabel(ip && portLabels[ip] && portLabels[ip][port.port] ? portLabels[ip][port.port] : '');
  };

  const savePortLabel = async () => {
    if (!selectedDevice || !selectedPort) return;
    setIsSavingLabel(true);
    try {
      const res = await fetch('/api/port-labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: selectedDevice.ip,
          port: selectedPort.port,
          label: editingLabel
        })
      });
      const json = await res.json();
      if (json.success) {
        setPortLabels(json.data);
      }
    } catch (error) {
      console.error('Failed to save label', error);
    } finally {
      setIsSavingLabel(false);
    }
  };

  // ================= Functions: Speedtest =================
  const runSpeedTest = async () => {
    setIsTesting(true);
    setSpeedResult('...');
    setPingResult('...');
    setTestLog('กำลังปิงเซิร์ฟเวอร์...');

    try {
      const pingStart = Date.now();
      await fetch('https://speed.cloudflare.com/__down?bytes=10', { cache: 'no-store', mode: 'cors' }).catch(() => {});
      const pingTime = Date.now() - pingStart;
      setPingResult(pingTime.toString());

      setTestLog('กำลังทดสอบความเร็วดาวน์โหลด (15MB)...');
      const payloadSize = 15000000;
      const startTime = Date.now();
      
      const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${payloadSize}`, { cache: 'no-store' });
      await response.blob();
      
      const durationSeconds = (Date.now() - startTime) / 1000;
      const speedMbps = ((payloadSize * 8) / durationSeconds / 1000000).toFixed(2);
      
      setSpeedResult(speedMbps);
      setTestLog('ทดสอบเสร็จสมบูรณ์');

    } catch (error) {
      setTestLog('เกิดข้อผิดพลาดในการทดสอบ');
      setSpeedResult('Error');
    } finally {
      setIsTesting(false);
    }
  };

  const getDeviceIcon = (type: string, status: string) => {
    const color = status === 'online' ? 'text-green-500' : status === 'offline' ? 'text-red-500' : 'text-gray-400';
    if (type === 'Firewall') return <ShieldCheck className={`w-8 h-8 ${color}`} />;
    if (type === 'Core Switch') return <Server className={`w-8 h-8 ${color}`} />;
    return <Server className={`w-8 h-8 ${color}`} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        {/* Main Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">งานศูนย์ดิจิทัลและสื่อสารองค์กร</h1>
            <p className="text-gray-500 mt-1">ตรวจสอบสถานะอินเทอร์เน็ตและอุปกรณ์ภายในวิทยาลัยเทคนิคกันทรลักษ์</p>
          </div>
        </div>

        {/* SECTION 1: Internet & Firewall (WAN) */}
        <div>
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-500" />
              สถานะอินเทอร์เน็ตขาออก (WAN & Firewall)
            </h2>
            <button 
              onClick={runSpeedTest}
              disabled={isTesting}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all ${
                isTesting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow'
              }`}
            >
              <RefreshCcw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'กำลังทดสอบ...' : 'เริ่มทดสอบความเร็วเน็ต'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Speedtest Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
              {isTesting && (
                <div className="absolute inset-0 bg-blue-50/70 flex items-center justify-center z-10 backdrop-blur-sm">
                   <div className="animate-pulse flex flex-col items-center">
                      <Download className="w-10 h-10 text-blue-600 mb-2 animate-bounce" />
                      <p className="text-blue-700 font-semibold">{testLog}</p>
                   </div>
                </div>
              )}
              <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
              <h3 className="text-lg font-semibold text-gray-800 mb-4">ความเร็วอินเทอร์เน็ตปัจจุบัน</h3>
              <div className="flex gap-8">
                <div>
                  <p className="text-sm text-gray-500">ดาวน์โหลด</p>
                  <p className="text-3xl font-bold text-gray-800">{speedResult} <span className="text-sm font-normal text-gray-500">Mbps</span></p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ping</p>
                  <p className="text-3xl font-bold text-gray-800">{pingResult} <span className="text-sm font-normal text-gray-500">ms</span></p>
                </div>
              </div>
            </div>

            {/* UNINET Card */}
            {(() => {
              const uninet = wanCircuits.find(w => w.id === 'uninet') || { status: 'online', ip: '202.29.224.34' };
              const isUp = uninet.status === 'online';
              return (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">วงจร UNINET</h3>
                    <Wifi className={isUp ? "text-blue-500 w-6 h-6" : "text-gray-400 w-6 h-6"} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-gray-500">สถานะ</span>
                      {isUp ? (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          ONLINE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          OFFLINE
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">IP Address</span>
                      <span className="font-mono text-gray-700">{uninet.ip}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* CAT Card */}
            {(() => {
              const cat = wanCircuits.find(w => w.id === 'cat') || { status: 'offline', ip: '122.154.155.45' };
              const isUp = cat.status === 'online';
              return (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">วงจร CAT (NT)</h3>
                    <Wifi className={isUp ? "text-orange-500 w-6 h-6" : "text-gray-400 w-6 h-6"} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-gray-500">สถานะ</span>
                      {isUp ? (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          ONLINE
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            OFFLINE
                          </span>
                          <span className="text-[11px] text-red-500 font-medium hidden sm:inline">(สัญญาณขาด)</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">IP Address</span>
                      <span className="font-mono text-gray-700">{cat.ip}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* SECTION 2: Internal Topology (LAN) */}
        <div>
          <div className="flex justify-between items-end mb-4 px-2 mt-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Server className="w-6 h-6 text-indigo-500" />
              สถานะทราฟฟิกแต่ละอาคาร (Bandwidth Usage)
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 text-right hidden lg:block">
                <p>อัปเดตล่าสุด: <span className="font-semibold text-gray-700">{lastUpdate}</span></p>
              </div>

              {/* Graph Modal Button */}
              <button 
                onClick={() => {
                  setGraphInitialDeviceId('all');
                  setIsGraphModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow transition-all active:scale-95"
              >
                <BarChart2 className="w-4 h-4" />
                ดูกราฟทราฟฟิก (Chart)
              </button>

              <button 
                onClick={() => scanNetwork(false)}
                disabled={isScanning}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all ${
                  isScanning ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow'
                }`}
              >
                <RefreshCcw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'กำลังดึงข้อมูล...' : 'รีเฟรชข้อมูล'}
              </button>
            </div>
          </div>

          {/* Loading State Overlay */}
          {devices.length === 0 && isScanning && (
            <div className="flex justify-center items-center py-20">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {/* Network Grid */}
          {devices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {devices.map((device) => (
                <div 
                  key={device.id} 
                  onClick={() => openDeviceDetails(device)}
                  className={`relative bg-white p-5 rounded-2xl shadow-sm border-2 transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                    device.status === 'online' ? 'border-green-100 hover:border-green-400 hover:shadow-md' : 
                    device.status === 'offline' ? 'border-red-200 bg-red-50/40 cursor-not-allowed' : 'border-gray-100'
                  }`}
                >
                  {/* Rebooting Overlay */}
                  {device.isRebooting && (
                    <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                      <RefreshCcw className="w-8 h-8 text-orange-500 animate-spin mb-2" />
                      <p className="font-bold text-orange-600">กำลังรีสตาร์ท...</p>
                      <p className="text-xs text-gray-500 mt-1">โปรดรอประมาณ 3-5 นาที</p>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-3">
                      {getDeviceIcon(device.type, device.status)}
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                          device.status === 'online' ? 'bg-green-100 text-green-700' : 
                          device.status === 'offline' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {device.status === 'loading' ? 'SCANNING' : device.status.toUpperCase()}
                        </span>
                        
                        {/* Graph Button for this device */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setGraphInitialDeviceId(device.id);
                            setIsGraphModalOpen(true);
                          }}
                          title="ดูกราฟของอาคารนี้"
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg transition-colors border border-blue-100"
                        >
                          <BarChart2 className="w-4 h-4" />
                        </button>

                        {/* Reboot Button */}
                        {device.status === 'online' && (
                          <button 
                            onClick={(e) => handleReboot(e, device)}
                            title="เริ่มต้นการทำงานใหม่ (Restart)"
                            className="p-1.5 bg-orange-50 hover:bg-orange-100 text-orange-500 hover:text-orange-600 rounded-lg transition-colors border border-orange-100"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800">{device.location}</h3>
                    <p className="text-sm font-medium text-gray-500 mb-4">{device.name}</p>
                    <p className="text-xs font-mono text-gray-400 mb-3">{device.ip}</p>
                  </div>
                  
                  {/* Bandwidth Section */}
                  {device.status === 'online' && (
                    <div className="mt-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1.5 text-blue-600">
                          <ArrowDown className="w-4 h-4" />
                          <span className="font-semibold text-gray-700">DL</span>
                        </div>
                        <span className="font-mono font-bold text-gray-800">{device.rx?.toFixed(1) || '0.0'} <span className="text-xs text-gray-500 font-normal">Mbps</span></span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1.5 text-orange-500">
                          <ArrowUp className="w-4 h-4" />
                          <span className="font-semibold text-gray-700">UL</span>
                        </div>
                        <span className="font-mono font-bold text-gray-800">{device.tx?.toFixed(1) || '0.0'} <span className="text-xs text-gray-500 font-normal">Mbps</span></span>
                      </div>
                    </div>
                  )}

                  {device.status === 'loading' && (
                    <div className="mt-2 p-3 bg-gray-50/70 rounded-xl border border-gray-100 animate-pulse space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  )}

                  {device.status === 'offline' && (
                    <div className="mt-4 p-3 bg-red-100/50 rounded-xl flex items-center gap-2 text-red-700 text-xs font-semibold">
                      <AlertTriangle className="w-5 h-5" />
                      <span>อุปกรณ์ออฟไลน์</span>
                    </div>
                  )}
                  {device.status === 'online' && (
                     <div className="mt-3 text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                        คลิกดูพอร์ต
                     </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL FOR PORT DETAILS */}
        {selectedDevice && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" onClick={closeDeviceDetails}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedDevice.name} - {selectedDevice.location}</h3>
                  <p className="text-sm text-gray-500">IP: {selectedDevice.ip} | Type: {selectedDevice.type}</p>
                </div>
                <button onClick={closeDeviceDetails} className="p-2 bg-white rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm">
                  ✕
                </button>
              </div>

              {/* Modal Body with Flex Layout */}
              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                
                {/* Left Side: Port Grid */}
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 border-r border-gray-100">
                  {/* Modal Body: Loading, Error, or Ports list */}
                  {isFetchingPorts ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                      <p className="text-gray-500 font-medium animate-pulse">กำลังเชื่อมต่อกับอุปกรณ์และดึงข้อมูลพอร์ต...</p>
                    </div>
                  ) : portError ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                      <div className="bg-red-50 p-4 rounded-full mb-4">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">ไม่สามารถเชื่อมต่อเพื่อดึงข้อมูลได้</h3>
                      <p className="text-gray-600 max-w-md">{portError}</p>
                      <button 
                        onClick={() => openDeviceDetails(selectedDevice)}
                        className="mt-6 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                      >
                        ลองใหม่อีกครั้ง
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-wrap gap-4 mb-6 text-sm font-medium">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500"></div> พอร์ตทำงาน (UP / LAN)</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-500"></div> Wi-Fi Access Point</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-100 text-purple-700 flex items-center justify-center text-[10px]">W</div> Uplink/Core</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-gray-300 bg-gray-100"></div> พอร์ตว่าง (DOWN)</div>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {devicePorts.map((p, idx) => {
                           const customLabel = portLabels[selectedDevice.ip]?.[p.port];
                           const isSelected = selectedPort?.port === p.port;
                           const isWifi = p.deviceType === 'Wi-Fi AP';
                           const isUplink = (p.type || '').includes('WAN') || (p.type || '').includes('Uplink');
                           
                           return (
                            <div 
                              key={idx} 
                              onClick={() => handlePortClick(p)}
                              title={customLabel || p.lldpName || p.port}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 ${
                                isSelected ? 'ring-4 ring-blue-300 border-blue-500' : 
                                p.status === 'UP' ? (
                                  isWifi ? 'border-amber-500 bg-amber-50 shadow-sm' :
                                  isUplink ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-green-500 bg-green-50 shadow-sm'
                                ) : 'border-gray-200 bg-gray-50 opacity-70 hover:opacity-100'
                              }`}
                            >
                              <div className={`text-[10px] font-bold mb-1 truncate w-full text-center ${
                                p.status === 'UP' ? (
                                  isWifi ? 'text-amber-700' :
                                  isUplink ? 'text-purple-700' : 'text-green-700'
                                ) : 'text-gray-400'
                              }`}>
                                {p.port}
                              </div>
                              <div className={`w-8 h-8 rounded mb-1 flex items-center justify-center ${
                                p.status === 'UP' ? (
                                  isWifi ? 'bg-amber-500' :
                                  isUplink ? 'bg-purple-500' : 'bg-green-500'
                                ) : 'bg-gray-200'
                              }`}>
                                <div className="w-4 h-2 bg-black/20 rounded-sm"></div>
                              </div>
                              <div className="text-[9px] text-gray-500 font-mono">{p.speed}</div>
                              {customLabel ? (
                                <div className="text-[9px] font-bold text-blue-600 truncate w-full text-center px-1" title={customLabel}>
                                  ⭐ {customLabel}
                                </div>
                              ) : p.lldpName ? (
                                <div className="text-[8px] text-gray-500 truncate w-full text-center px-1" title={p.lldpName}>
                                  {p.lldpName}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Port Details & Edit Form */}
                <div className="w-full md:w-80 bg-white p-6 flex flex-col">
                  {selectedPort ? (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-gray-100">
                        <h4 className="text-xl font-bold text-gray-800">{selectedPort.port}</h4>
                        <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${selectedPort.status === 'UP' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                           <div className={`w-2 h-2 rounded-full ${selectedPort.status === 'UP' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                           {selectedPort.status} - {selectedPort.speed}
                        </div>
                      </div>

                      {/* Auto Discovery Info */}
                      <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                         <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Network Discovery (LLDP/MAC/IP)</h5>
                         <div>
                            <p className="text-sm text-gray-500">เชื่อมต่อกับ (Device):</p>
                            <p className="font-semibold text-gray-800">{selectedPort.lldpName || 'ไม่พบข้อมูล / อุปกรณ์ทั่วไป'}</p>
                         </div>
                         {selectedPort.deviceType && (
                           <div>
                              <p className="text-sm text-gray-500">ประเภทอุปกรณ์:</p>
                              <span className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-full text-xs font-bold ${selectedPort.deviceType === 'Wi-Fi AP' ? 'bg-amber-100 text-amber-800' : selectedPort.deviceType === 'Uplink' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                {selectedPort.deviceType === 'Wi-Fi AP' ? '📶 Wi-Fi Access Point' : selectedPort.deviceType === 'Uplink' ? '🔌 Core Switch (Uplink)' : '💻 คอมพิวเตอร์ / LAN Device'}
                              </span>
                           </div>
                         )}
                         {selectedPort.ip && (
                           <div>
                              <p className="text-sm text-gray-500">IP Address:</p>
                              <p className="font-mono text-sm font-bold text-blue-600">{selectedPort.ip}</p>
                           </div>
                         )}
                         {selectedPort.mac && (
                           <div>
                              <p className="text-sm text-gray-500">MAC Address:</p>
                              <p className="font-mono text-sm text-gray-800">{selectedPort.mac}</p>
                           </div>
                         )}
                      </div>

                      {/* Custom Label Form */}
                      <div className="space-y-3 pt-2">
                         <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">ตั้งชื่อพอร์ตเอง (Custom Label)</h5>
                         <p className="text-xs text-gray-500">ตั้งชื่อพอร์ตนี้เพื่อง่ายต่อการจำ เช่น "Wi-Fi หน้าห้อง ผอ." หรือ "คอมครูสมหมาย"</p>
                         
                         <input 
                           type="text" 
                           value={editingLabel}
                           onChange={(e) => setEditingLabel(e.target.value)}
                           placeholder="พิมพ์ชื่อที่ต้องการ..."
                           className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                         />
                         
                         <button 
                           onClick={savePortLabel}
                           disabled={isSavingLabel}
                           className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-all shadow-sm"
                         >
                           {isSavingLabel ? 'กำลังบันทึก...' : 'บันทึกชื่อพอร์ต'}
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 h-full py-20">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Activity className="w-8 h-8 text-gray-300" />
                      </div>
                      <p>คลิกที่พอร์ตทางด้านซ้าย<br/>เพื่อดูข้อมูลและตั้งชื่อ</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* MODAL FOR TRAFFIC GRAPH & EXPORT */}
        <TrafficGraphModal
          isOpen={isGraphModalOpen}
          onClose={() => setIsGraphModalOpen(false)}
          devices={devices}
          history={trafficHistory}
          initialDeviceId={graphInitialDeviceId}
        />

      </div>
    </div>
  );
}
