import React from 'react';
import { Activity, Wifi, ShieldAlert, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'ตรวจสอบสัญญานอินเตอร์เน็ต | วท.กันทรลักษ์',
  description: 'ตรวจสอบระบบอินเตอร์เน็ตภายในวิทยาลัยเทคนิคกันทรลักษ์',
};

export default function NetworkMonitorPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                ตรวจสอบสัญญานอินเตอร์เน็ต
              </h1>
              <p className="text-gray-500 mt-1">
                ตรวจสอบระบบอินเตอร์เน็ตภายในวิทยาลัยเทคนิคกันทรลักษ์
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid (Mockup for now) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Overall Status */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">สถานะปกติ</h2>
            <p className="text-sm text-gray-500 mt-2">ระบบทำงานได้อย่างราบรื่น</p>
          </div>

          {/* Card 2: UNINET Status */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">วงจร UNINET</h2>
              <Wifi className="text-blue-500 w-6 h-6" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">สถานะ</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">IP</span>
                <span className="font-medium">202.29.224.34</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Traffic</span>
                <span className="font-medium text-gray-400">Loading...</span>
              </div>
            </div>
          </div>

          {/* Card 3: CAT Status */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">วงจร CAT (NT)</h2>
              <Wifi className="text-orange-500 w-6 h-6" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">สถานะ</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">IP</span>
                <span className="font-medium">122.154.155.45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Traffic</span>
                <span className="font-medium text-gray-400">Loading...</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
