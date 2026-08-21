"use client"
import React, { useEffect, useState } from "react";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Card,
  CardBody,
  Chip
} from "@heroui/react";
import { UserCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Assessment {
  _id: string;
  type: string;
  age: number;
  gender: string;
  status: string;
  st5Score: number;
  q9Score: number;
  createdAt: string;
}

export default function MentalHealthDashboard() {
  const [data, setData] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/mental-health');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error("ดึงข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelST5 = (score: number) => {
    if (score <= 4) return { label: "เครียดน้อย", color: "success" };
    if (score <= 7) return { label: "เครียดปานกลาง", color: "warning" };
    if (score <= 9) return { label: "เครียดมาก", color: "danger" };
    return { label: "เครียดรุนแรง", color: "danger" };
  };

  const getRiskLevelQ9 = (score: number) => {
    if (score <= 6) return { label: "ไม่มีอาการซึมเศร้า", color: "success" };
    if (score <= 12) return { label: "ซึมเศร้าระดับน้อย", color: "primary" };
    if (score <= 18) return { label: "ซึมเศร้าระดับปานกลาง", color: "warning" };
    return { label: "ซึมเศร้าระดับรุนแรง", color: "danger" };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <UserCheck className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">ข้อมูลประเมินสุขภาพจิต (Mental Health Dashboard)</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody className="text-center p-6">
            <h3 className="text-gray-500 font-medium">จำนวนผู้ประเมินทั้งหมด</h3>
            <p className="text-4xl font-bold text-blue-600 mt-2">{data.length}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="p-0">
          <Table aria-label="Assessment Data" className="min-w-full">
            <TableHeader>
              <TableColumn>วันที่</TableColumn>
              <TableColumn>ประเภท</TableColumn>
              <TableColumn>อายุ</TableColumn>
              <TableColumn>เพศ</TableColumn>
              <TableColumn>ความเครียด (ST5)</TableColumn>
              <TableColumn>ซึมเศร้า (9Q)</TableColumn>
            </TableHeader>
            <TableBody emptyContent="ไม่มีข้อมูล">
              {data.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{new Date(item.createdAt).toLocaleString('th-TH')}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.age}</TableCell>
                  <TableCell>{item.gender}</TableCell>
                  <TableCell>
                    <Chip size="sm" color={getRiskLevelST5(item.st5Score).color as any} variant="flat">
                      {item.st5Score} : {getRiskLevelST5(item.st5Score).label}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" color={getRiskLevelQ9(item.q9Score).color as any} variant="flat">
                      {item.q9Score} : {getRiskLevelQ9(item.q9Score).label}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
