export interface NetworkDevice {
  id: string;
  ip: string;
  name: string;
  location: string;
  type: 'Firewall' | 'Core Switch' | 'Edge Switch' | 'Access Point';
  brand: string;
}

// ฐานข้อมูลจำลอง อ้างอิงจากแผนผัง Kantharalak Technical College Network
export const networkDevices: NetworkDevice[] = [
  { id: 'fw-1', ip: '192.168.6.1', name: 'HUAWEI USG6525E', location: 'Server Room', type: 'Firewall', brand: 'Huawei' },
  { id: 'core-1', ip: '192.168.6.3', name: 'Aruba 8320 (48Port)', location: 'Server Room', type: 'Core Switch', brand: 'Aruba' },
  { id: 'sw-14', ip: '192.168.6.14', name: 'HPE 1930 (V19)', location: 'ตึกวิทยบริการ', type: 'Edge Switch', brand: 'HPE' },
  { id: 'sw-15', ip: '192.168.6.15', name: 'HPE 1930 (V20)', location: 'ตึกสามัญ', type: 'Edge Switch', brand: 'HPE' },
  { id: 'sw-10', ip: '192.168.6.10', name: 'HPE 1930 (V10)', location: 'ตึกอำนวยการ', type: 'Edge Switch', brand: 'HPE' },
  { id: 'sw-16', ip: '192.168.6.31', name: 'Reyee RG-ES226GC-P', location: 'ตึกโดม', type: 'Edge Switch', brand: 'Reyee' },
  { id: 'sw-17', ip: '192.168.6.17', name: 'HPE 1930 (V22)', location: 'อาคารอิเล็กทรอนิกส์', type: 'Edge Switch', brand: 'HPE' },
  { id: 'sw-11', ip: '192.168.6.11', name: 'HPE 1930 (V11)', location: 'อาคารช่างเชื่อม+พื้นฐาน', type: 'Edge Switch', brand: 'HPE' },
  { id: 'sw-12', ip: '192.168.6.12', name: 'HPE 1930 (V14)', location: 'อาคารช่างกลโรงงาน', type: 'Edge Switch', brand: 'HPE' },
  { id: 'sw-13', ip: '192.168.6.13', name: 'Edge Switch (V18)', location: 'อาคารช่างยนต์', type: 'Edge Switch', brand: 'Switch' },
  { id: 'sw-32', ip: '192.168.6.32', name: 'Reyee RG-ES226GC-P', location: 'ป้อมยาม', type: 'Edge Switch', brand: 'Reyee' },
  { id: 'sw-35', ip: '192.168.6.35', name: 'HPE 1930', location: 'บ้านพักครู', type: 'Edge Switch', brand: 'HPE' },
  { id: 'sw-210', ip: '192.168.6.210', name: 'Cisco SG500-28', location: 'อาคาร 4 (แผนกคอมฯ)', type: 'Edge Switch', brand: 'Cisco' }
];
