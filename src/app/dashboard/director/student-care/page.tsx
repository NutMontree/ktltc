"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Plus, AlertCircle, X, MapPin, HeartHandshake, ShieldCheck, Camera, Image as ImageIcon, Send, Check, Trash2, Edit, LayoutGrid, Table, List, User, Search, Download, Printer } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "react-hot-toast";
import { uploadFile } from "@/lib/upload";
import * as XLSX from "xlsx";

const SDQ_QUESTIONS = [
  { id: 1, text: "1. ห่วงใยความรู้สึกของคนอื่น", category: "P", reverse: false },
  { id: 2, text: "2. อยู่ไม่นิ่งนั่งนิ่งๆ ไม่ได้", category: "H", reverse: false },
  { id: 3, text: "3. มักจะบ่นว่าปวดศีรษะ ปวดท้อง หรือไม่สบาย", category: "E", reverse: false },
  { id: 4, text: "4. เต็มใจแบ่งปันสิ่งของให้เพื่อน ( ขนม ,ของเล่น,ดินสอ เป็นต้น )", category: "P", reverse: false },
  { id: 5, text: "5. มักจะอาละวาดหรือโมโหร้าย", category: "C", reverse: false },
  { id: 6, text: "6. ค่อนข้างแยกตัว ชอบเล่นคนเดียว", category: "Pe", reverse: false },
  { id: 7, text: "7. เชื่อฟัง มักจะทำตามที่ผู้ใหญ่ต้องการ", category: "C", reverse: true },
  { id: 8, text: "8. กังวลใจหลายเรื่อง ดูวิตกกังวลเสมอ", category: "E", reverse: false },
  { id: 9, text: "9. เป็นที่พึ่งได้เวลาที่คนอื่นเสียใจ อารมณ์ไม่ดี หรือไม่สบายใจ", category: "P", reverse: false },
  { id: 10, text: "10. อยู่ไม่สุข วุ่นวายอย่างมาก", category: "H", reverse: false },
  { id: 11, text: "11. มีเพื่อนสนิท", category: "Pe", reverse: true },
  { id: 12, text: "12. มักมีเรื่องทะเลาะวิวาทกับเด็กอื่น หรือรังแกเด็กอื่น", category: "C", reverse: false },
  { id: 13, text: "13. ดูไม่มีความสุข ท้อแท้ ร้องไห้บ่อย", category: "E", reverse: false },
  { id: 14, text: "14. เป็นที่ชื่นชอบของเพื่อน", category: "Pe", reverse: true },
  { id: 15, text: "15. วอกแวกง่าย สมาธิสั้น", category: "H", reverse: false },
  { id: 16, text: "16. เครียดไม่ยอมห่างเวลาอยู่ในสถานการณ์ที่ไม่คุ้น และขาดความเชื่อมั่นในตนเอง", category: "E", reverse: false },
  { id: 17, text: "17. ใจดีกับเด็กที่เล็กกว่า", category: "P", reverse: false },
  { id: 18, text: "18. ชอบโกหกหรือขี้โกง", category: "C", reverse: false },
  { id: 19, text: "19. ถูกเด็กคนอื่นล้อเลียนหรือรังแก", category: "Pe", reverse: false },
  { id: 20, text: "20. ชอบอาสาช่วยเหลือคนอื่น ( พ่อ, แม่, ครู, เด็กคนอื่น )", category: "P", reverse: false },
  { id: 21, text: "21. คิดก่อนทำ", category: "H", reverse: true },
  { id: 22, text: "22. ขโมยของของที่บ้าน ที่โรงเรียน หรือที่อื่น", category: "C", reverse: false },
  { id: 23, text: "23. เข้ากับผู้ใหญ่ได้ดีกว่าเด็กวัยเดียวกัน", category: "Pe", reverse: false },
  { id: 24, text: "24. ขี้กลัว รู้สึกหวาดกลัวได้ง่าย", category: "E", reverse: false },
  { id: 25, text: "25. ทำงานได้จนเสร็จ มีความตั้งใจในการทำงาน", category: "H", reverse: true }
];

const calculateAge = (dobString: string) => {
  if (!dobString) return "";
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export default function StudentCarePage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [recordType, setRecordType] = useState<"screening" | "home_visit">("screening");
  const [viewTab, setViewTab] = useState<"screening" | "home_visit">("screening");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterClassroom, setFilterClassroom] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deputyName, setDeputyName] = useState("(.........................................................)");
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table" | "list">("grid");
  const [isPrintingSummary, setIsPrintingSummary] = useState(false);

  // Student Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // SDQ Modal
  const [showSDQModal, setShowSDQModal] = useState(false);
  const [sdqAnswers, setSdqAnswers] = useState<Record<number, number>>({});
  const [sdqImpact, setSdqImpact] = useState({
    hasProblem: 0,
    duration: -1,
    distress: -1,
    interferePeer: -1,
    interfereClass: -1,
    burden: -1
  });
  const [sdqOtherConcerns, setSdqOtherConcerns] = useState("");

  // Form State
  const [newCare, setNewCare] = useState({
    department: "",
    classroom: "",
    studentName: "",
    gender: "",
    dob: "",
    sdqType: "normal",
    notes: "",
    gpsLat: "",
    gpsLng: "",
    address: "",
    imageUrl: "", // keep for legacy backwards compatibility
    status: "active", // active, referred, resolved
    sdqData: null as any,
    studentProfileImage: ""
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const formatStudentName = (name: string, gender: string) => {
    if (!name) return "";
    const trimmed = name.trim();
    if (gender === 'male') {
      if (trimmed.startsWith('นาย') || trimmed.startsWith('ด.ช.')) return trimmed;
      return `นาย${trimmed}`;
    } else if (gender === 'female') {
      if (trimmed.startsWith('นางสาว') || trimmed.startsWith('นาง') || trimmed.startsWith('ด.ญ.')) return trimmed;
      return `นางสาว${trimmed}`;
    }
    return trimmed;
  };

  const getTranslate = (res: string) => {
    if (!res) return "";
    if (res === 'normal') return 'ปกติ';
    if (res === 'risk') return 'เสี่ยง';
    if (res === 'problem') return 'มีปัญหา';
    if (res === 'strength') return 'เป็นจุดแข็ง';
    if (res === 'none') return 'ไม่มีจุดแข็ง';
    return res;
  };

  const user = {
    username: session?.user?.name || session?.user?.username,
    role: session?.user?.role,
    image: session?.user?.image,
  };

  const isAdmin = ["super_admin", "admin", "director"].includes(user.role?.toLowerCase() || "");

  useEffect(() => {
    fetchRecords();
    fetchDeputy();
  }, []);

  const fetchDeputy = async () => {
    try {
      const res = await fetch("/api/users/all");
      if (res.ok) {
        const data = await res.json();
        const deputy = (data.users || []).find((u: any) => u.role === "deputy_student_affairs");
        if (deputy && deputy.name) {
          setDeputyName(`(${deputy.name})`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch deputy", error);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/director/student-care");
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("ดึงข้อมูลล้มเหลว");
    }
    setLoading(false);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      toast.loading("กำลังดึงพิกัด GPS...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.dismiss();
          setNewCare(prev => ({
            ...prev,
            gpsLat: position.coords.latitude.toString(),
            gpsLng: position.coords.longitude.toString()
          }));
          toast.success("ดึงพิกัด GPS สำเร็จ");
        },
        (error) => {
          toast.dismiss();
          toast.error("ไม่สามารถดึงพิกัดได้ กรุณาเปิด Location Services");
        }
      );
    } else {
      toast.error("เบราว์เซอร์ของคุณไม่รองรับ Geolocation");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const previews = files.map(f => URL.createObjectURL(f));
      setImageFiles(prev => [...prev, ...files]);
      setImagePreviews(prev => [...prev, ...previews]);
    }
    // Reset input so the same files can be selected again if removed
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      const removedUrl = newPreviews[index];
      if (removedUrl.startsWith("blob:")) {
        URL.revokeObjectURL(removedUrl);
        const blobUrlsBefore = prev.slice(0, index).filter(url => url.startsWith("blob:")).length;
        setImageFiles(filesPrev => filesPrev.filter((_, i) => i !== blobUrlsBefore));
      }
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleAdd = async () => {
    if (!newCare.department || !newCare.classroom || !newCare.studentName) {
      toast.error("กรุณาระบุ แผนก, ชั้นเรียน และชื่อ-สกุลนักเรียนให้ครบถ้วน");
      return;
    }

    if (recordType === "screening" && !newCare.sdqData) {
      toast.error("กรุณาทำแบบประเมิน SDQ ออนไลน์ให้ครบถ้วนก่อนบันทึก");
      return;
    }

    setIsUploading(true);
    let uploadedUrls: string[] = [];

    if (imageFiles.length > 0) {
      toast.loading(`กำลังอัปโหลดรูปภาพ ${imageFiles.length} รูป...`);
      try {
        const uploads = await Promise.all(
          imageFiles.map(file => uploadFile(file, "student_care"))
        );
        uploadedUrls = uploads.map(u => u.secure_url).filter(Boolean) as string[];
      } catch (err) {
        toast.dismiss();
        toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        setIsUploading(false);
        return;
      }
      toast.dismiss();
    }

    try {
      const isEdit = !!editingId;
      const url = "/api/director/student-care";
      const method = isEdit ? "PATCH" : "POST";
      const existingUrls = imagePreviews.filter(url => !url.startsWith("blob:"));
      const finalImageUrls = [...existingUrls, ...uploadedUrls];

      const bodyData = isEdit
        ? { _id: editingId, ...newCare, imageUrls: finalImageUrls, recordType }
        : { ...newCare, imageUrls: finalImageUrls, recordType, teacherName: user.username || "Unknown", visitDate: new Date() };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });
      if (res.ok) {
        toast.success(isEdit ? "แก้ไขข้อมูลสำเร็จ" : "บันทึกข้อมูลดูแลนักเรียนสำเร็จ");
        setShowAdd(false);
        setEditingId(null);
        setNewCare({ department: "", classroom: "", studentName: "", gender: "", dob: "", sdqType: "normal", notes: "", gpsLat: "", gpsLng: "", address: "", imageUrl: "", status: "active", sdqData: null, studentProfileImage: "" });
        setImageFiles([]);
        setImagePreviews([]);
        setSdqAnswers({});
        setSdqImpact({ hasProblem: 0, duration: -1, distress: -1, interferePeer: -1, interfereClass: -1, burden: -1 });
        setSdqOtherConcerns("");
        setSearchQuery("");
        fetchRecords();
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("API Save Error:", errData);
        toast.error(`บันทึกข้อมูลล้มเหลว: ${errData.error || res.statusText}`);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(`เกิดข้อผิดพลาดในการเชื่อมต่อ: ${e.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/director/student-care", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, status })
      });
      if (res.ok) {
        toast.success("อัปเดตสถานะสำเร็จ");
        if (viewRecord && viewRecord._id === id) setViewRecord({ ...viewRecord, status });
        fetchRecords();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?")) return;
    try {
      const res = await fetch(`/api/director/student-care?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบข้อมูลสำเร็จ");
        setViewRecord(null);
        fetchRecords();
      }
    } catch (e) {
      console.error(e);
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const handleEdit = (record: any) => {
    setRecordType(record.recordType || "screening");
    setNewCare({
      department: record.department || "",
      classroom: record.classroom || "",
      studentName: record.studentName || "",
      gender: record.gender || "",
      dob: record.dob || "",
      sdqType: record.sdqType || "normal",
      notes: record.notes || "",
      gpsLat: record.gpsLat || "",
      gpsLng: record.gpsLng || "",
      address: record.address || "",
      imageUrl: record.imageUrl || "",
      status: record.status || "active",
      sdqData: record.sdqData || null,
      studentProfileImage: record.studentProfileImage || ""
    });
    if (record.sdqData && record.sdqData.answers) {
      setSdqAnswers(record.sdqData.answers);
    }
    if (record.sdqData && record.sdqData.impact) {
      setSdqImpact(record.sdqData.impact);
    } else {
      setSdqImpact({ hasProblem: 0, duration: -1, distress: -1, interferePeer: -1, interfereClass: -1, burden: -1 });
    }
    setSdqOtherConcerns(record.sdqData?.otherConcerns || "");
    setImagePreviews(record.imageUrls || (record.imageUrl ? [record.imageUrl] : []));
    setImageFiles([]); // Clear new image files, they would need to upload new ones if they want to change
    setEditingId(record._id);
    setSearchQuery(record.studentName || "");
    setShowAdd(true);
    setViewRecord(null);
  };

  const handleSearchStudent = async (q: string) => {
    setSearchQuery(q);
    setNewCare({ ...newCare, studentName: q });

    if (q.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/director/student-care/search-students?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.students || []);
        setShowDropdown(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const selectStudent = (student: any) => {
    setSearchQuery(student.name);
    setNewCare({
      ...newCare,
      studentName: student.name,
      department: student.department || newCare.department || "",
      classroom: student.classroomName || student.classGroupId || newCare.classroom,
      studentProfileImage: student.image || student.imageUrl || ""
    });
    setShowDropdown(false);
  };

  const calculateSDQ = () => {
    if (Object.keys(sdqAnswers).length < 25) {
      toast.error("กรุณาตอบคำถามให้ครบทั้ง 25 ข้อ");
      return;
    }
    if (sdqImpact.hasProblem > 0) {
      if (sdqImpact.duration === -1 || sdqImpact.distress === -1 || sdqImpact.interferePeer === -1 || sdqImpact.interfereClass === -1 || sdqImpact.burden === -1) {
        toast.error("กรุณาตอบแบบประเมินส่วนผลกระทบด้านหลังให้ครบถ้วน");
        return;
      }
    }

    let E = 0, C = 0, H = 0, Pe = 0, P = 0;

    SDQ_QUESTIONS.forEach(q => {
      let score = sdqAnswers[q.id];
      if (q.reverse) {
        score = score === 0 ? 2 : score === 2 ? 0 : 1;
      }
      if (q.category === "E") E += score;
      else if (q.category === "C") C += score;
      else if (q.category === "H") H += score;
      else if (q.category === "Pe") Pe += score;
      else if (q.category === "P") P += score;
    });

    const totalDifficulties = E + C + H + Pe;

    let sdqType = "normal";
    if (totalDifficulties >= 19) sdqType = "problem";
    else if (totalDifficulties >= 17) sdqType = "risk";

    let E_res = E >= 7 ? "problem" : (E === 6 ? "risk" : "normal");
    let C_res = C >= 6 ? "problem" : (C === 5 ? "risk" : "normal");
    let H_res = H >= 7 ? "problem" : (H === 6 ? "risk" : "normal");
    let Pe_res = Pe >= 5 ? "problem" : (Pe === 4 ? "risk" : "normal");
    let P_res = P >= 4 ? "strength" : "none";

    let impactScore = 0;
    if (sdqImpact.hasProblem > 0) {
      impactScore = Math.max(0, sdqImpact.distress - 1) +
        Math.max(0, sdqImpact.interferePeer - 1) +
        Math.max(0, sdqImpact.interfereClass - 1) +
        Math.max(0, sdqImpact.burden - 1);
    }
    let impact_res = impactScore >= 3 ? "problem" : (impactScore >= 1 ? "risk" : "normal");

    setNewCare(prev => ({
      ...prev,
      sdqType,
      sdqData: {
        E, E_res,
        C, C_res,
        H, H_res,
        Pe, Pe_res,
        P, P_res,
        total: totalDifficulties,
        answers: sdqAnswers,
        impact: { ...sdqImpact, score: impactScore, result: impact_res },
        otherConcerns: sdqOtherConcerns
      }
    }));

    toast.success("ประเมิน SDQ สำเร็จ ระบบได้จัดกลุ่มให้อัตโนมัติ");
    setShowSDQModal(false);
  };

  // Stats for Dashboard
  const screeningRecords = records.filter(r => (r.recordType || 'screening') === 'screening');
  const sdqCounts = {
    normal: screeningRecords.filter(r => r.sdqType === 'normal').length,
    risk: screeningRecords.filter(r => r.sdqType === 'risk').length,
    problem: screeningRecords.filter(r => r.sdqType === 'problem').length,
    special: screeningRecords.filter(r => r.sdqType === 'special').length,
  };
  const totalSdq = sdqCounts.normal + sdqCounts.risk + sdqCounts.problem + sdqCounts.special || 1;

  const uniqueDepartments = Array.from(new Set(records.filter(r => r.department).map(r => r.department as string))).sort();
  const uniqueClassrooms = Array.from(new Set(records.filter(r => r.classroom && (!filterDepartment || r.department === filterDepartment)).map(r => r.classroom as string))).sort();

  const displayedRecords = records.filter(r => {
    if ((r.recordType || 'screening') !== viewTab) return false;
    if (filterDepartment && r.department !== filterDepartment) return false;
    if (filterClassroom && r.classroom !== filterClassroom) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.studentName && r.studentName.toLowerCase().includes(term)) ||
      (r.classroom && r.classroom.toLowerCase().includes(term)) ||
      (r.department && r.department.toLowerCase().includes(term)) ||
      (r.teacherName && r.teacherName.toLowerCase().includes(term))
    );
  });

  const exportToExcel = () => {
    if (displayedRecords.length === 0) {
      toast.error("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }

    const data = displayedRecords.map((r, index) => {
      const isSdq = r.recordType === 'screening' && r.sdqData;

      return {
        'ลำดับ': index + 1,
        'วันที่ประเมิน': new Date(r.visitDate || r.createdAt).toLocaleDateString('th-TH'),
        'รหัสประจำตัว': r.studentIdNum || '',
        'ชื่อ-สกุล': formatStudentName(r.studentName, r.gender),
        'เพศ': r.gender || '',
        'วันเกิด': r.dob ? new Date(r.dob).toLocaleDateString('th-TH') : '',
        'แผนกวิชา': r.department || '',
        'ชั้นเรียน/ห้อง': r.classroom || '',
        'ประเภท': r.recordType === 'home_visit' ? 'เยี่ยมบ้าน' : 'คัดกรอง SDQ',

        // SDQ Scores
        'ด้านที่ 1: อารมณ์ (คะแนน)': isSdq ? r.sdqData.E : '',
        'ด้านที่ 1: อารมณ์ (แปลผล)': isSdq ? getTranslate(r.sdqData.E_res) : '',
        'ด้านที่ 2: ความประพฤติ (คะแนน)': isSdq ? r.sdqData.C : '',
        'ด้านที่ 2: ความประพฤติ (แปลผล)': isSdq ? getTranslate(r.sdqData.C_res) : '',
        'ด้านที่ 3: สมาธิสั้น (คะแนน)': isSdq ? r.sdqData.H : '',
        'ด้านที่ 3: สมาธิสั้น (แปลผล)': isSdq ? getTranslate(r.sdqData.H_res) : '',
        'ด้านที่ 4: สัมพันธ์เพื่อน (คะแนน)': isSdq ? r.sdqData.Pe : '',
        'ด้านที่ 4: สัมพันธ์เพื่อน (แปลผล)': isSdq ? getTranslate(r.sdqData.Pe_res) : '',
        'รวม 4 ด้าน (คะแนน)': isSdq ? r.sdqData.total : '',
        'รวม 4 ด้าน (แปลผล)': isSdq ? getTranslate(r.sdqType) : '',
        'สัมพันธภาพทางสังคม (คะแนน)': isSdq ? r.sdqData.P : '',
        'สัมพันธภาพทางสังคม (แปลผล)': isSdq ? getTranslate(r.sdqData.P_res) : '',

        // Impact
        'ผลกระทบรวม (คะแนน)': isSdq && r.sdqData.impact ? r.sdqData.impact.score : '',
        'ผลกระทบรวม (แปลผล)': isSdq && r.sdqData.impact ? getTranslate(r.sdqData.impact.result) : '',

        'ความกังวลอื่น': isSdq && r.sdqData.otherConcerns ? r.sdqData.otherConcerns : '',
        'บันทึกเพิ่มเติม/ข้อเสนอแนะ': r.notes || '',
        'ครูผู้ประเมิน': r.teacherName || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SDQ_Export");

    // Generate filename based on filters
    let filename = "StudentCare_Export";
    if (filterDepartment) filename += `_${filterDepartment}`;
    if (filterClassroom) filename += `_${filterClassroom.replace(/\//g, '-')}`;
    filename += `.xlsx`;

    XLSX.writeFile(workbook, filename);
    toast.success("ดาวน์โหลดไฟล์ Excel สำเร็จ");
  };

  return (
    <div className="relative min-h-screen bg-transparent transition-colors duration-500 overflow-hidden print:min-h-0 print:overflow-visible print:static print:p-0 print:m-0">
      <Toaster position="top-right" />

      {/* Hidden Print Summary Section */}
      {isPrintingSummary && (
        <>
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #print-summary-section, #print-summary-section * {
                visibility: visible;
              }
              #print-summary-section {
                position: absolute !important;
                left: 0;
                top: 0;
                width: 100% !important;
                box-sizing: border-box !important;
                background: white !important;
                padding: 10px !important;
              }
              #print-summary-section table {
                border-collapse: collapse !important;
                width: 100% !important;
                max-width: 100% !important;
                border: 1px solid black !important;
              }
              #print-summary-section th, 
              #print-summary-section td {
                border: 1px solid black !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color: black !important;
                padding: 4px !important;
                font-size: 16px !important; /* Adjusted text size */
                word-wrap: break-word !important;
                white-space: normal !important;
              }
              #print-summary-section th:first-child,
              #print-summary-section td:first-child {
                border-left: 1px solid black !important;
              }
              #print-summary-section th:last-child,
              #print-summary-section td:last-child {
                border-right: 1px solid black !important;
              }
              #print-summary-section thead {
                display: table-header-group !important;
              }
              #print-summary-section tr {
                page-break-inside: avoid !important;
              }
              /* Override Tailwind classes that break print */
              #print-table-wrapper {
                display: block !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            }
          `}</style>
          <div id="print-summary-section" className="print:relative fixed inset-0 z-999999 bg-white text-black p-4 overflow-visible print:overflow-visible">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold mb-1 print-title">สรุปผลการประเมิน SDQ {viewTab === 'home_visit' ? '(บันทึกเยี่ยมบ้าน)' : '(แบบคัดกรอง)'}</h1>
              <h2 className="text-lg font-bold mb-1">วิทยาลัยเทคนิคกันทรลักษ์</h2>
              <p className="text-sm">
                {filterDepartment ? `แผนก: ${filterDepartment}` : 'ทุกแผนก'}
                {' | '}
                {filterClassroom ? `ชั้นเรียน: ${filterClassroom}` : 'ทุกชั้นเรียน'}
              </p>
            </div>

            <div id="print-table-wrapper" className="w-full">
              <table className="w-full border-collapse border border-black">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black text-center">ที่</th>
                    <th className="border border-black text-center">ชื่อ-นามสกุล</th>
                    {viewTab === 'screening' ? (
                      <>
                        <th className="border border-black text-center">ด้านอารมณ์</th>
                        <th className="border border-black text-center">ด้านความประพฤติ</th>
                        <th className="border border-black text-center">ด้านพฤติกรรม</th>
                        <th className="border border-black text-center">ด้านสัมพันธ์กับเพื่อน</th>
                        <th className="border border-black text-center">ด้านทางสังคม</th>
                        <th className="border border-black text-center">สรุปผลประเมิน</th>
                      </>
                    ) : (
                      <th className="border border-black text-center">ผลการประเมิน (โดยครูที่ปรึกษา)</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {displayedRecords.map((r, i) => (
                    <tr key={r._id}>
                      <td className="border border-black text-center">{i + 1}</td>
                      <td className="border border-black">{formatStudentName(r.studentName, r.gender)}</td>
                      {viewTab === 'screening' ? (
                        <>
                          <td className="border border-black text-center">{getTranslate(r.sdqData?.E_res)}</td>
                          <td className="border border-black text-center">{getTranslate(r.sdqData?.C_res)}</td>
                          <td className="border border-black text-center">{getTranslate(r.sdqData?.H_res)}</td>
                          <td className="border border-black text-center">{getTranslate(r.sdqData?.Pe_res)}</td>
                          <td className="border border-black text-center">{getTranslate(r.sdqData?.P_res)}</td>
                          <td className="border border-black text-center font-bold">
                            {r.sdqType === 'normal' ? 'ปกติ' : r.sdqType === 'special' ? 'พิเศษ' : r.sdqType === 'risk' ? 'เสี่ยง' : 'มีปัญหา'}
                          </td>
                        </>
                      ) : (
                        <td className="border border-black text-center">
                          {r.sdqType === 'normal' ? 'ปกติ' : r.sdqType === 'special' ? 'พิเศษ' : r.sdqType === 'risk' ? 'เสี่ยง' : 'มีปัญหา'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Section */}
            <div className="mt-20 pt-8 print:break-inside-avoid">
              <div className="flex justify-between px-8 md:px-16">
                {/* Left: Advisor */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex items-baseline">
                    <span className="mr-2 whitespace-nowrap">ลงชื่อ</span>
                    <span contentEditable suppressContentEditableWarning className="inline-block text-center outline-none hover:bg-slate-100 transition-colors px-2 rounded cursor-text border-b border-transparent hover:border-slate-300 print:border-none">(.........................................................)</span>
                    <span className="ml-2 whitespace-nowrap opacity-0 pointer-events-none select-none print:hidden">ลงชื่อ</span>
                  </div>
                  <div className="mt-2 outline-none hover:bg-slate-100 transition-colors px-2 rounded cursor-text" contentEditable suppressContentEditableWarning>ครูที่ปรึกษา</div>
                  <div className="mt-2 outline-none hover:bg-slate-100 transition-colors px-2 rounded cursor-text" contentEditable suppressContentEditableWarning>......./......./.......</div>
                </div>

                {/* Right: Deputy Director */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex items-baseline">
                    <span className="mr-2 whitespace-nowrap">ลงชื่อ</span>
                    <span contentEditable suppressContentEditableWarning className="inline-block text-center outline-none hover:bg-slate-100 transition-colors px-2 rounded cursor-text border-b border-transparent hover:border-slate-300 print:border-none">{deputyName}</span>
                    <span className="ml-2 whitespace-nowrap opacity-0 pointer-events-none select-none print:hidden">ลงชื่อ</span>
                  </div>
                  <div className="mt-2 outline-none hover:bg-slate-100 transition-colors px-2 rounded cursor-text" contentEditable suppressContentEditableWarning>รองผู้อำนวยการฝ่ายพัฒนากิจการนักเรียนฯ</div>
                  <div className="mt-2 outline-none hover:bg-slate-100 transition-colors px-2 rounded cursor-text" contentEditable suppressContentEditableWarning>......./......./.......</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="max-w-[1600px] mx-auto w-full px-2 py-8 md:py-12 relative print:hidden">
        <div className="px-2 mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-lg shadow-teal-500/20">
                <ClipboardList size={24} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black bg-linear-to-r from-teal-600 to-emerald-500 dark:from-teal-400 dark:to-emerald-300 bg-clip-text text-transparent uppercase tracking-tight">
                  ระบบดูแลช่วยเหลือนักเรียน
                </h1>
                <p className="text-sm font-bold text-slate-500 dark:text-zinc-400">คัดกรองนักเรียน และรายงานเยี่ยมบ้าน (คป.02 / คป.11)</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowAdd(!showAdd);
                if (showAdd) {
                  setEditingId(null);
                  setNewCare({ department: "", classroom: "", studentName: "", gender: "", dob: "", sdqType: "normal", notes: "", gpsLat: "", gpsLng: "", address: "", imageUrl: "", status: "active", sdqData: null, studentProfileImage: "" });
                  setImagePreviews([]);
                  setImageFiles([]);
                  setSdqAnswers({});
                  setSdqImpact({ hasProblem: 0, duration: -1, distress: -1, interferePeer: -1, interfereClass: -1, burden: -1 });
                  setSdqOtherConcerns("");
                  setSearchQuery("");
                }
              }}
              className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 shadow-md shadow-teal-500/20 active:scale-95 transition-all"
            >
              {showAdd ? <X size={16} /> : <Plus size={16} />}
              {showAdd ? "ยกเลิก" : "บันทึกคัดกรอง / เยี่ยมบ้าน"}
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-800">

            {/* Tabs and View Mode Controls */}
            {!showAdd && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex flex-wrap bg-slate-100 dark:bg-zinc-900/50 p-1 rounded-2xl gap-1 border border-slate-200 dark:border-zinc-800/50">
                  <button
                    onClick={() => setViewTab("screening")}
                    className={`px-6 py-2.5 text-sm font-bold transition-all rounded-xl flex items-center ${viewTab === 'screening' ? 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-white/50 dark:hover:bg-zinc-800/50'}`}
                  >
                    <ShieldCheck size={18} className="mr-2" /> 1. แบบคัดกรอง (คป.02)
                  </button>
                  <button
                    onClick={() => setViewTab("home_visit")}
                    className={`px-6 py-2.5 text-sm font-bold transition-all rounded-xl flex items-center ${viewTab === 'home_visit' ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-white/50 dark:hover:bg-zinc-800/50'}`}
                  >
                    <HeartHandshake size={18} className="mr-2" /> 2. บันทึกเยี่ยมบ้าน (คป.11)
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  {/* Filters */}
                  <select
                    className="w-full sm:w-auto py-2.5 px-4 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-teal-500 font-bold text-slate-600 dark:text-zinc-300"
                    value={filterDepartment}
                    onChange={(e) => {
                      setFilterDepartment(e.target.value);
                      setFilterClassroom(""); // Reset classroom when department changes
                    }}
                  >
                    <option value="">ทุกแผนกวิชา</option>
                    {uniqueDepartments.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>

                  <select
                    className="w-full sm:w-auto py-2.5 px-4 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-teal-500 font-bold text-slate-600 dark:text-zinc-300"
                    value={filterClassroom}
                    onChange={(e) => setFilterClassroom(e.target.value)}
                  >
                    <option value="">ทุกห้องเรียน</option>
                    {uniqueClassrooms.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>

                  <button
                    onClick={exportToExcel}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-100 hover:shadow-md hover:shadow-emerald-500/10 active:scale-95 transition-all shrink-0 border border-emerald-200 dark:border-emerald-800/50"
                    title="ดาวน์โหลดข้อมูลเป็น Excel"
                  >
                    <Download size={16} /> Excel
                  </button>

                  <button
                    onClick={() => {
                      if (displayedRecords.length === 0) {
                        toast.error("ไม่มีข้อมูลสำหรับพิมพ์");
                        return;
                      }
                      setIsPrintingSummary(true);
                      setTimeout(() => {
                        window.print();
                        setTimeout(() => setIsPrintingSummary(false), 500);
                      }, 500);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl text-sm font-bold hover:bg-indigo-100 hover:shadow-md hover:shadow-indigo-500/10 active:scale-95 transition-all shrink-0 border border-indigo-200 dark:border-indigo-800/50"
                    title="พิมพ์สรุปเป็น PDF"
                  >
                    <Printer size={16} /> PDF
                  </button>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-64 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-teal-500 text-slate-400">
                      <Search size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อ, รหัส..."
                      className="pl-10 w-full py-2.5 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 text-sm focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* View Mode Switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/50 p-1 rounded-xl mb-px shrink-0">
                    <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 shadow-sm text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'}`} title="Grid View">
                      <LayoutGrid size={18} />
                    </button>
                    <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-zinc-700 shadow-sm text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'}`} title="Table View">
                      <Table size={18} />
                    </button>
                    <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'}`} title="List View">
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard Summary (Only if records exist) */}
            {!showAdd && viewTab === 'screening' && records.some(r => (r.recordType || 'screening') === 'screening') && (
              <div className="mb-8 p-6 bg-slate-50 dark:bg-zinc-950 rounded-3xl border border-slate-100 dark:border-zinc-800">
                <h3 className="text-sm font-black text-slate-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-teal-500" /> ภาพรวมผลการคัดกรองนักเรียนทั้งหมด
                </h3>

                <div className="flex w-full h-4 rounded-full overflow-hidden mb-4 bg-slate-200 dark:bg-zinc-800">
                  <div style={{ width: `${(sdqCounts.normal / totalSdq) * 100}%` }} className="bg-emerald-500 transition-all duration-1000"></div>
                  <div style={{ width: `${(sdqCounts.special / totalSdq) * 100}%` }} className="bg-blue-500 transition-all duration-1000"></div>
                  <div style={{ width: `${(sdqCounts.risk / totalSdq) * 100}%` }} className="bg-amber-500 transition-all duration-1000"></div>
                  <div style={{ width: `${(sdqCounts.problem / totalSdq) * 100}%` }} className="bg-rose-500 transition-all duration-1000"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-emerald-50/50 hover:bg-emerald-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>กลุ่มปกติ</p>
                    <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100">{sdqCounts.normal} <span className="text-sm font-bold text-emerald-600/50">คน</span></p>
                  </div>
                  <div className="bg-blue-50/50 hover:bg-blue-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>กลุ่มพิเศษ</p>
                    <p className="text-3xl font-black text-blue-900 dark:text-blue-100">{sdqCounts.special} <span className="text-sm font-bold text-blue-600/50">คน</span></p>
                  </div>
                  <div className="bg-amber-50/50 hover:bg-amber-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>กลุ่มเสี่ยง</p>
                    <p className="text-3xl font-black text-amber-900 dark:text-amber-100">{sdqCounts.risk} <span className="text-sm font-bold text-amber-600/50">คน</span></p>
                  </div>
                  <div className="bg-rose-50/50 hover:bg-rose-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300">
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>กลุ่มมีปัญหา</p>
                    <p className="text-3xl font-black text-rose-900 dark:text-rose-100">{sdqCounts.problem} <span className="text-sm font-bold text-rose-600/50">คน</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Add Form */}
            {showAdd && (
              <div className="mb-8 p-6 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-teal-100 dark:border-teal-900/30">
                <div className="flex gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-zinc-700">
                  <button
                    onClick={() => setRecordType("screening")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${recordType === 'screening' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-zinc-900 text-slate-500'}`}
                  >
                    <ShieldCheck size={16} /> 1. แบบคัดกรอง (คป.02)
                  </button>
                  <button
                    onClick={() => setRecordType("home_visit")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${recordType === 'home_visit' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-900 text-slate-500'}`}
                  >
                    <HeartHandshake size={16} /> 2. บันทึกเยี่ยมบ้าน (คป.11)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">แผนกวิชา</label>
                      <input type="text" placeholder="เช่น ช่างยนต์" className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-teal-500" value={newCare.department} onChange={e => setNewCare({ ...newCare, department: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">ชั้นเรียน/ห้อง</label>
                      <input type="text" placeholder="เช่น ปวช.1/1" className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-teal-500" value={newCare.classroom} onChange={e => setNewCare({ ...newCare, classroom: e.target.value })} />
                    </div>
                  </div>
                  <div className="col-span-1 relative">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">ชื่อ-สกุล นักเรียน</label>
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อ, รหัส, ชั้นเรียน หรือ แผนก..."
                      className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-teal-500"
                      value={searchQuery}
                      onChange={e => handleSearchStudent(e.target.value)}
                      onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    />

                    {/* Autocomplete Dropdown */}
                    {showDropdown && searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((s, i) => (
                          <div
                            key={i}
                            onClick={() => selectStudent(s)}
                            className="p-3 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer border-b border-slate-100 dark:border-zinc-800 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              {s.image || s.imageUrl ? (
                                <img src={s.image || s.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                  <User size={14} className="text-slate-400" />
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-sm text-slate-700 dark:text-zinc-200">{s.name}</div>
                                {(s.studentIdNum || s.classroomName || s.department) && (
                                  <div className="text-xs text-slate-500 mt-0.5">
                                    {s.studentIdNum ? `รหัส: ${s.studentIdNum} ` : ''}
                                    {s.classroomName ? `| ชั้น: ${s.classroomName} ` : ''}
                                    {s.department ? `| แผนก: ${s.department}` : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">เพศ</label>
                      <select
                        className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-teal-500"
                        value={newCare.gender}
                        onChange={e => setNewCare({ ...newCare, gender: e.target.value })}
                      >
                        <option value="">-- ระบุเพศ --</option>
                        <option value="ชาย">ชาย</option>
                        <option value="หญิง">หญิง</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">วัน/เดือน/ปีเกิด</label>
                        <input
                          type="date"
                          className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-teal-500"
                          value={newCare.dob}
                          onChange={e => setNewCare({ ...newCare, dob: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">อายุ (ปี)</label>
                        <input
                          type="text"
                          className="w-full p-3 border rounded-xl bg-slate-100 dark:bg-zinc-900 cursor-not-allowed dark:border-zinc-700 text-sm font-bold text-slate-500"
                          value={newCare.dob ? calculateAge(newCare.dob) : ''}
                          readOnly
                          placeholder="คำนวณอัตโนมัติ"
                        />
                      </div>
                    </div>
                  </div>

                  {recordType === 'screening' && (
                    <div className="col-span-1 md:col-span-2 bg-slate-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                        <label className="block text-xs font-bold text-slate-500">ผลการคัดกรอง SDQ</label>
                        <button
                          onClick={() => setShowSDQModal(true)}
                          className="px-4 py-2 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded-xl text-xs font-bold hover:bg-teal-200 transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <ClipboardList size={14} /> {newCare.sdqData ? 'ทำแบบประเมินใหม่' : 'ทำแบบประเมิน SDQ ออนไลน์'}
                        </button>
                      </div>

                      {newCare.sdqData && (
                        <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs font-bold">
                          <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl border border-slate-100 dark:border-zinc-700 flex flex-col items-center justify-center">
                            <span className="text-[10px] text-slate-400">อารมณ์</span>
                            <div>
                              <span className="text-teal-600 dark:text-teal-400 mr-1 text-sm">{newCare.sdqData.E}</span>
                              {newCare.sdqData.E_res && <span className={`text-[10px] ${newCare.sdqData.E_res === 'problem' ? 'text-rose-500' : newCare.sdqData.E_res === 'risk' ? 'text-amber-500' : 'text-emerald-500'}`}>({newCare.sdqData.E_res === 'problem' ? 'มีปัญหา' : newCare.sdqData.E_res === 'risk' ? 'เสี่ยง' : 'ปกติ'})</span>}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl border border-slate-100 dark:border-zinc-700 flex flex-col items-center justify-center">
                            <span className="text-[10px] text-slate-400">ความประพฤติ</span>
                            <div>
                              <span className="text-teal-600 dark:text-teal-400 mr-1 text-sm">{newCare.sdqData.C}</span>
                              {newCare.sdqData.C_res && <span className={`text-[10px] ${newCare.sdqData.C_res === 'problem' ? 'text-rose-500' : newCare.sdqData.C_res === 'risk' ? 'text-amber-500' : 'text-emerald-500'}`}>({newCare.sdqData.C_res === 'problem' ? 'มีปัญหา' : newCare.sdqData.C_res === 'risk' ? 'เสี่ยง' : 'ปกติ'})</span>}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl border border-slate-100 dark:border-zinc-700 flex flex-col items-center justify-center">
                            <span className="text-[10px] text-slate-400">สมาธิสั้น</span>
                            <div>
                              <span className="text-teal-600 dark:text-teal-400 mr-1 text-sm">{newCare.sdqData.H}</span>
                              {newCare.sdqData.H_res && <span className={`text-[10px] ${newCare.sdqData.H_res === 'problem' ? 'text-rose-500' : newCare.sdqData.H_res === 'risk' ? 'text-amber-500' : 'text-emerald-500'}`}>({newCare.sdqData.H_res === 'problem' ? 'มีปัญหา' : newCare.sdqData.H_res === 'risk' ? 'เสี่ยง' : 'ปกติ'})</span>}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl border border-slate-100 dark:border-zinc-700 flex flex-col items-center justify-center">
                            <span className="text-[10px] text-slate-400">สัมพันธ์เพื่อน</span>
                            <div>
                              <span className="text-teal-600 dark:text-teal-400 mr-1 text-sm">{newCare.sdqData.Pe}</span>
                              {newCare.sdqData.Pe_res && <span className={`text-[10px] ${newCare.sdqData.Pe_res === 'problem' ? 'text-rose-500' : newCare.sdqData.Pe_res === 'risk' ? 'text-amber-500' : 'text-emerald-500'}`}>({newCare.sdqData.Pe_res === 'problem' ? 'มีปัญหา' : newCare.sdqData.Pe_res === 'risk' ? 'เสี่ยง' : 'ปกติ'})</span>}
                            </div>
                          </div>
                          <div className="bg-rose-50 dark:bg-rose-900/10 p-2 rounded-xl border border-rose-100 dark:border-rose-900/30 flex flex-col items-center justify-center">
                            <span className="text-[10px] text-rose-500">รวม 4 ด้าน</span>
                            <div>
                              <span className="text-rose-600 dark:text-rose-400 mr-1 text-sm">{newCare.sdqData.total}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <select
                        className="w-full p-3 border rounded-xl bg-slate-100 dark:bg-zinc-900 cursor-not-allowed text-slate-500 dark:border-zinc-700 text-sm font-bold"
                        value={newCare.sdqType}
                        disabled
                      >
                        <option value="normal">✅ กลุ่มปกติ (Normal)</option>
                        <option value="special">🌟 กลุ่มพิเศษ (Special/Gifted)</option>
                        <option value="risk">⚠️ กลุ่มเสี่ยง (At Risk)</option>
                        <option value="problem">🚨 กลุ่มมีปัญหา (Problematic)</option>
                      </select>
                      <p className="text-[10px] text-rose-500 mt-2 font-bold">
                        * ไม่อนุญาตให้แก้ไขข้อมูล ระบบจะประมวลผลจากแบบประเมิน SDQ ออนไลน์เท่านั้น
                      </p>
                    </div>
                  )}

                  {recordType === 'home_visit' && (
                    <>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">ข้อมูลที่อยู่ / สภาพที่พักอาศัย</label>
                        <textarea rows={2} placeholder="บ้านเลขที่, สภาพแวดล้อม..." className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-indigo-500 resize-none" value={newCare.address} onChange={e => setNewCare({ ...newCare, address: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">พิกัด GPS เยี่ยมบ้าน</label>
                        <div className="flex gap-2">
                          <input type="text" placeholder="Lat, Lng" className="w-full p-3 border rounded-xl dark:border-zinc-700 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-100 dark:bg-zinc-900 cursor-not-allowed" value={newCare.gpsLat ? `${newCare.gpsLat}, ${newCare.gpsLng}` : ''} readOnly />
                          <button onClick={getLocation} className="shrink-0 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-3 rounded-xl hover:bg-indigo-200 transition-colors" title="ดึงพิกัดปัจจุบัน">
                            <MapPin size={20} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">แนบรูปถ่าย หรือ เอกสารเพิ่มเติม (เลือกได้หลายรูป)</label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 group">
                          <img src={src} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-[10px] w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors group">
                        <Plus size={20} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        <span className="text-[10px] font-bold text-slate-500 mt-1">เพิ่มรูป</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">บันทึกเพิ่มเติม / ข้อเสนอแนะ</label>
                    <textarea rows={2} placeholder="รายละเอียดเพิ่มเติม..." className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-teal-500 resize-none" value={newCare.notes} onChange={e => setNewCare({ ...newCare, notes: e.target.value })} />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleAdd}
                    disabled={isUploading}
                    className={`px-8 py-3 rounded-xl text-sm font-black shadow-lg transition-all text-white flex items-center gap-2 ${recordType === 'home_visit' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/30'} ${isUploading ? 'opacity-75 cursor-not-allowed' : 'active:scale-95'}`}
                  >
                    {isUploading ? (
                      <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> กำลังบันทึก...</>
                    ) : (
                      <>บันทึกรายงาน{recordType === 'home_visit' ? 'เยี่ยมบ้าน' : 'คัดกรอง'}</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* List Records */}
            {!showAdd && (
              <div className={
                viewMode === 'table' ? "w-full overflow-x-auto bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm" :
                  viewMode === 'list' ? "flex flex-col gap-4" :
                    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              }>
                {loading ? (
                  <div className="col-span-full text-center py-12 text-zinc-500 font-bold animate-pulse">กำลังโหลดข้อมูลระบบดูแลนักเรียน...</div>
                ) : displayedRecords.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-zinc-500 font-bold bg-slate-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-700">
                    ยังไม่มีประวัติการบันทึก{viewTab === 'home_visit' ? 'เยี่ยมบ้าน' : 'คัดกรอง'}
                  </div>
                ) : viewMode === 'table' ? (
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="p-5 font-bold">วันที่</th>
                        <th className="p-5 font-bold">นักเรียน</th>
                        <th className="p-5 font-bold">แผนก / ชั้น</th>
                        <th className="p-5 font-bold">ประเภท</th>
                        <th className="p-5 font-bold">ผลคัดกรอง</th>
                        <th className="p-5 font-bold">ครูที่ปรึกษา</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedRecords.map((r: any) => (
                        <tr key={r._id} onClick={() => { setViewRecord(r); setCurrentImageIndex(0); }} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors group">
                          <td className="p-5 text-sm text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                            {new Date(r.visitDate || r.createdAt).toLocaleDateString('th-TH')}
                          </td>
                          <td className="p-5 font-bold flex items-center gap-3">
                            {r.studentProfileImage ? (
                              <img src={r.studentProfileImage} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-zinc-700 shadow-sm" alt="Student Profile" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-slate-400"><User size={16} /></div>
                            )}
                            <span className="group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{r.studentName}</span>
                          </td>
                          <td className="p-5 text-sm text-slate-600 dark:text-zinc-400 whitespace-nowrap">{r.department} <br /><span className="text-xs text-slate-400">{r.classroom}</span></td>
                          <td className="p-5 text-sm whitespace-nowrap">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md text-xs font-bold text-slate-600 dark:text-zinc-400">
                              {r.recordType === 'home_visit' ? 'เยี่ยมบ้าน' : 'คัดกรอง'}
                            </span>
                          </td>
                          <td className="p-5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-md border ${r.sdqType === 'normal' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                              r.sdqType === 'special' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                r.sdqType === 'risk' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                  'bg-rose-50 text-rose-600 border-rose-200'
                              }`}>
                              {r.sdqType === 'normal' ? 'ปกติ' : r.sdqType === 'special' ? 'พิเศษ' : r.sdqType === 'risk' ? 'เสี่ยง' : 'มีปัญหา'}
                            </span>
                          </td>
                          <td className="p-5 text-sm text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                            {r.teacherName}
                            {r.status !== 'active' && (
                              <div className="mt-1">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${r.status === 'referred' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                  {r.status === 'referred' ? 'ส่งต่อ' : 'แก้ไขแล้ว'}
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  displayedRecords.map((r: any) => (
                    <div key={r._id} onClick={() => { setViewRecord(r); setCurrentImageIndex(0); }} className={`cursor-pointer bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group hover:border-teal-300 dark:hover:border-teal-700/50 ${viewMode === 'list' ? 'flex flex-row h-48' : 'flex flex-col'}`}>

                      {/* Status Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        {r.status === 'referred' ? (
                          <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-lg bg-rose-500 text-white shadow-md flex items-center gap-1">
                            <Send size={12} /> ส่งต่อ
                          </span>
                        ) : r.status === 'resolved' ? (
                          <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-lg bg-emerald-500 text-white shadow-md flex items-center gap-1">
                            <Check size={12} /> แก้ไขแล้ว
                          </span>
                        ) : null}
                      </div>

                      {/* Image / Header Area */}
                      <div className={`${viewMode === 'list' ? 'w-48 shrink-0 h-full' : 'h-40'} bg-slate-100 dark:bg-zinc-900 relative`}>
                        {(r.imageUrls && r.imageUrls.length > 0) ? (
                          <>
                            <img src={r.imageUrls[0]} alt="Record Image" className="w-full h-full object-cover" />
                            {r.imageUrls.length > 1 && (
                              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-md flex items-center gap-1">
                                <ImageIcon size={10} /> +{r.imageUrls.length - 1} รูป
                              </div>
                            )}
                          </>
                        ) : r.imageUrl ? (
                          <img src={r.imageUrl} alt="Record Image" className="w-full h-full object-cover" />
                        ) : r.studentProfileImage ? (
                          <img src={r.studentProfileImage} alt="Profile Image" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-zinc-700">
                            {r.recordType === 'home_visit' ? <Camera size={32} /> : <ShieldCheck size={32} />}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                          <div className="flex items-center gap-3">
                            {r.studentProfileImage && (r.imageUrls?.length > 0 || r.imageUrl) && (
                              <img src={r.studentProfileImage} className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-md" alt="Student Profile" />
                            )}
                            <p className="text-white font-black text-lg leading-tight">{r.studentName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold text-slate-500">{r.department ? `${r.department} - ` : ''}{r.classroom}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                            {r.recordType === 'home_visit' ? 'เยี่ยมบ้าน' : 'คัดกรอง'}
                          </span>
                        </div>

                        <div className="mb-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg border ${r.sdqType === 'normal' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            r.sdqType === 'special' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              r.sdqType === 'risk' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                'bg-rose-50 text-rose-600 border-rose-200'
                            }`}>
                            {r.sdqType === 'problem' && <AlertCircle size={14} />}
                            {r.sdqType === 'normal' ? 'ปกติ (Normal)' : r.sdqType === 'special' ? 'พิเศษ (Special)' : r.sdqType === 'risk' ? 'เสี่ยง (Risk)' : 'มีปัญหา (Problem)'}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-zinc-400 flex-1 line-clamp-3 mb-4">
                          {r.notes || "ไม่มีบันทึกเพิ่มเติม"}
                        </p>

                        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 mt-auto">
                          <div className="text-[10px] text-slate-400 font-bold">
                            ครู: {r.teacherName}<br />
                            {r.teacherDepartment && <span className="text-[9px] text-slate-500">{r.teacherDepartment}<br /></span>}
                            {new Date(r.visitDate || r.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })} น.
                          </div>

                          {(r.sdqType === 'risk' || r.sdqType === 'problem') && r.status === 'active' && isAdmin && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(r._id, 'referred'); }}
                              className="flex items-center gap-1 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors border border-rose-100 dark:border-rose-900"
                            >
                              <Send size={12} /> ส่งต่อ
                            </button>
                          )}
                          {r.status === 'referred' && isAdmin && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(r._id, 'resolved'); }}
                              className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors border border-emerald-100 dark:border-emerald-900"
                            >
                              <Check size={12} /> แก้ไขแล้ว
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            )}




            {/* SDQ Assessment Modal */}
            {showSDQModal && (
              <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowSDQModal(false)}>
                <div
                  className="bg-white dark:bg-zinc-900 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0">
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-zinc-100">แบบประเมิน SDQ (ฉบับครูประเมินนักเรียน)</h3>
                      <p className="text-sm text-slate-500 font-bold mt-1">กรุณาประเมินพฤติกรรมนักเรียนในช่วง 6 เดือนที่ผ่านมา</p>
                    </div>
                    <button onClick={() => setShowSDQModal(false)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-zinc-950/50">
                    <div className="space-y-4">
                      {SDQ_QUESTIONS.map((q) => (
                        <div key={q.id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-700/50 transition-colors">
                          <p className="font-bold text-slate-700 dark:text-zinc-200 mb-3 text-sm">{q.text}</p>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => setSdqAnswers({ ...sdqAnswers, [q.id]: 0 })}
                              className={`py-2 rounded-xl text-xs font-black transition-all border ${sdqAnswers[q.id] === 0 ? 'bg-teal-500 text-white border-teal-600 shadow-md shadow-teal-500/20' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
                            >
                              ไม่จริง
                            </button>
                            <button
                              onClick={() => setSdqAnswers({ ...sdqAnswers, [q.id]: 1 })}
                              className={`py-2 rounded-xl text-xs font-black transition-all border ${sdqAnswers[q.id] === 1 ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
                            >
                              ค่อนข้างจริง
                            </button>
                            <button
                              onClick={() => setSdqAnswers({ ...sdqAnswers, [q.id]: 2 })}
                              className={`py-2 rounded-xl text-xs font-black transition-all border ${sdqAnswers[q.id] === 2 ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
                            >
                              จริง
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Other Concerns */}
                    <div className="mt-8 border-t border-slate-200 dark:border-zinc-800 pt-6">
                      <label className="block text-sm font-bold text-slate-800 dark:text-zinc-100 mb-3">คุณมีความเห็นหรือความกังวลอื่นอีกหรือไม่</label>
                      <textarea
                        rows={3}
                        placeholder="ระบุความกังวลเพิ่มเติม..."
                        className="w-full p-4 border rounded-2xl dark:bg-zinc-900 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-teal-500 resize-none shadow-sm"
                        value={sdqOtherConcerns}
                        onChange={(e) => setSdqOtherConcerns(e.target.value)}
                      />
                    </div>

                    {/* Impact Supplement Section */}
                    <div className="mt-8 border-t border-slate-200 dark:border-zinc-800 pt-6">
                      <h4 className="text-lg font-black text-slate-800 dark:text-zinc-100 mb-4">แบบประเมินส่วนหลัง (ผลกระทบต่อเด็กและชั้นเรียน)</h4>

                      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 mb-4">
                        <p className="font-bold text-slate-700 dark:text-zinc-200 mb-3 text-sm">โดยรวมแล้วคุณคิดว่า เด็กมีปัญหาในด้านใดด้านหนึ่งต่อไปนี้หรือไม่ (ด้านอารมณ์ ด้านสมาธิ ด้านพฤติกรรม หรือความสามารถเข้ากับผู้อื่น)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { val: 0, label: "ไม่" },
                            { val: 1, label: "ใช่ มีปัญหาเล็กน้อย" },
                            { val: 2, label: "ใช่ มีปัญหาชัดเจน" },
                            { val: 3, label: "ใช่ มีปัญหาอย่างมาก" }
                          ].map(opt => (
                            <button
                              key={opt.val}
                              onClick={() => setSdqImpact({ ...sdqImpact, hasProblem: opt.val, duration: opt.val === 0 ? -1 : sdqImpact.duration, distress: opt.val === 0 ? -1 : sdqImpact.distress, interferePeer: opt.val === 0 ? -1 : sdqImpact.interferePeer, interfereClass: opt.val === 0 ? -1 : sdqImpact.interfereClass, burden: opt.val === 0 ? -1 : sdqImpact.burden })}
                              className={`py-2 px-1 rounded-xl text-xs font-black transition-all border ${sdqImpact.hasProblem === opt.val ? 'bg-indigo-500 text-white border-indigo-600 shadow-md shadow-indigo-500/20' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {sdqImpact.hasProblem > 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
                            <p className="font-bold text-slate-700 dark:text-zinc-200 mb-3 text-sm">ปัญหานี้เกิดขึ้นมานานเท่าไรแล้ว</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {[
                                { val: 0, label: "น้อยกว่า 1 เดือน" },
                                { val: 1, label: "1 - 5 เดือน" },
                                { val: 2, label: "6 - 12 เดือน" },
                                { val: 3, label: "มากกว่า 1 ปี" }
                              ].map(opt => (
                                <button
                                  key={opt.val}
                                  onClick={() => setSdqImpact({ ...sdqImpact, duration: opt.val })}
                                  className={`py-2 px-1 rounded-xl text-xs font-black transition-all border ${sdqImpact.duration === opt.val ? 'bg-teal-500 text-white border-teal-600 shadow-md shadow-teal-500/20' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
                            <p className="font-bold text-slate-700 dark:text-zinc-200 mb-3 text-sm">ปัญหานี้ทำให้นักเรียนรู้สึกไม่สบายใจหรือไม่</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {[
                                { val: 0, label: "ไม่เลย" },
                                { val: 1, label: "เล็กน้อย" },
                                { val: 2, label: "ค่อนข้างมาก" },
                                { val: 3, label: "มาก" }
                              ].map(opt => (
                                <button
                                  key={opt.val}
                                  onClick={() => setSdqImpact({ ...sdqImpact, distress: opt.val })}
                                  className={`py-2 px-1 rounded-xl text-xs font-black transition-all border ${sdqImpact.distress === opt.val ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
                            <p className="font-bold text-slate-700 dark:text-zinc-200 mb-3 text-sm">ปัญหานี้รบกวนชีวิตประจำวันของเด็กในด้านต่างๆ ต่อไปนี้หรือไม่</p>

                            <div className="mb-3">
                              <p className="text-xs font-bold text-slate-500 mb-2">การคบเพื่อน</p>
                              <div className="grid grid-cols-4 gap-2">
                                {[
                                  { val: 0, label: "ไม่" },
                                  { val: 1, label: "เล็กน้อย" },
                                  { val: 2, label: "ค่อนข้างมาก" },
                                  { val: 3, label: "มาก" }
                                ].map(opt => (
                                  <button
                                    key={opt.val}
                                    onClick={() => setSdqImpact({ ...sdqImpact, interferePeer: opt.val })}
                                    className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-black transition-all border ${sdqImpact.interferePeer === opt.val ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-slate-500 mb-2">การเรียนในห้องเรียน</p>
                              <div className="grid grid-cols-4 gap-2">
                                {[
                                  { val: 0, label: "ไม่" },
                                  { val: 1, label: "เล็กน้อย" },
                                  { val: 2, label: "ค่อนข้างมาก" },
                                  { val: 3, label: "มาก" }
                                ].map(opt => (
                                  <button
                                    key={opt.val}
                                    onClick={() => setSdqImpact({ ...sdqImpact, interfereClass: opt.val })}
                                    className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-black transition-all border ${sdqImpact.interfereClass === opt.val ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
                            <p className="font-bold text-slate-700 dark:text-zinc-200 mb-3 text-sm">ปัญหาของเด็กทำให้คุณหรือชั้นเรียนเกิดความยุ่งยากหรือไม่ (ครอบครัว เพื่อน ครู เป็นต้น)</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {[
                                { val: 0, label: "ไม่เลย" },
                                { val: 1, label: "เล็กน้อย" },
                                { val: 2, label: "ค่อนข้างมาก" },
                                { val: 3, label: "มาก" }
                              ].map(opt => (
                                <button
                                  key={opt.val}
                                  onClick={() => setSdqImpact({ ...sdqImpact, burden: opt.val })}
                                  className={`py-2 px-1 rounded-xl text-xs font-black transition-all border ${sdqImpact.burden === opt.val ? 'bg-fuchsia-500 text-white border-fuchsia-600 shadow-md shadow-fuchsia-500/20' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-500">
                      ทำแล้ว <span className={Object.keys(sdqAnswers).length === 25 ? "text-teal-600" : "text-rose-500"}>{Object.keys(sdqAnswers).length}</span> / 25 ข้อ
                    </div>
                    <button
                      onClick={calculateSDQ}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-black shadow-lg shadow-teal-500/30 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <ClipboardList size={16} /> สรุปผลการประเมิน
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewRecord && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 print:p-0 bg-black/60 print:bg-transparent backdrop-blur-sm print:backdrop-blur-none print:absolute print:inset-0 print:block" onClick={() => setViewRecord(null)}>
          <div
            id="print-section"
            className="bg-white dark:bg-zinc-900 print:bg-white print:text-black rounded-3xl print:rounded-none max-w-2xl print:max-w-none w-full max-h-[90vh] print:max-h-none overflow-y-auto print:overflow-visible shadow-2xl print:shadow-none relative"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setViewRecord(null)} className="no-print absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors z-10">
              <X size={20} />
            </button>

            {/* Modal Header/Images */}
            <div className="bg-slate-100 dark:bg-zinc-950 print:bg-white relative rounded-t-3xl print:rounded-none overflow-hidden print:overflow-visible group/img">
              <div className="h-64 hidden-in-print w-full relative">
                <div className="w-full h-full relative cursor-pointer" onClick={() => setFullscreenImage(viewRecord.imageUrls[currentImageIndex])}>
                  <img src={viewRecord.imageUrls[currentImageIndex] || undefined} alt={`Record Image ${currentImageIndex + 1}`} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />

                  <div className="no-print print:hidden absolute top-4 left-4 bg-black/60 hover:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/10 z-10 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8M3 16.2V21m0 0h4.8M3 21l6-6M21 7.8V3m0 0h-4.8M21 3l-6 6M3 7.8V3m0 0h4.8M3 3l6 6" /></svg>
                    ขยายเต็มจอ
                  </div>

                  {viewRecord.imageUrls.length > 1 && (
                    <>
                      <div className="no-print print:hidden absolute top-4 right-14 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/10 z-10">
                        <ImageIcon size={14} /> รูปที่ {currentImageIndex + 1} / {viewRecord.imageUrls.length}
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentImageIndex((prev: number) => prev === 0 ? viewRecord.imageUrls.length - 1 : prev - 1);
                        }}
                        className="no-print print:hidden absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm shadow-xl z-20"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentImageIndex((prev: number) => prev === viewRecord.imageUrls.length - 1 ? 0 : prev + 1);
                        }}
                        className="no-print print:hidden absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm shadow-xl z-20"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                      </button>
                    </>
                  )}
                </div>
                ) : viewRecord.imageUrl ? (
                <div className="w-full h-full relative cursor-pointer group/img" onClick={() => setFullscreenImage(viewRecord.imageUrl)}>
                  <img src={viewRecord.imageUrl || undefined} alt="Record Image" className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                  <div className="no-print print:hidden absolute top-4 left-4 bg-black/60 hover:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/10 z-10 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8M3 16.2V21m0 0h4.8M3 21l6-6M21 7.8V3m0 0h-4.8M21 3l-6 6M3 7.8V3m0 0h4.8M3 3l6 6" /></svg>
                    ขยายเต็มจอ
                  </div>
                </div>
                ) : viewRecord.studentProfileImage ? (
                <div className="w-full h-full relative cursor-pointer group/img" onClick={() => setFullscreenImage(viewRecord.studentProfileImage)}>
                  <img src={viewRecord.studentProfileImage || undefined} alt="Profile Image" className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                  <div className="no-print print:hidden absolute top-4 left-4 bg-black/60 hover:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/10 z-10 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8M3 16.2V21m0 0h4.8M3 21l6-6M21 7.8V3m0 0h-4.8M21 3l-6 6M3 7.8V3m0 0h4.8M3 3l6 6" /></svg>
                    ขยายเต็มจอ
                  </div>
                </div>
                ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-zinc-700">
                  {viewRecord.recordType === 'home_visit' ? <Camera size={64} /> : <ShieldCheck size={64} />}
                </div>
                )
              </div>

              <div className="hidden print:block text-center font-bold mb-6 print:mt-12 print-title">
                {viewRecord.recordType === 'home_visit' ? 'แบบบันทึกการเยี่ยมบ้านรายบุคคล' : 'แบบประเมิน SDQ รายบุคคล'}
              </div>

              <div className="absolute print:relative bottom-0 print:bottom-auto inset-x-0 print:inset-0 bg-linear-to-t from-black/80 to-transparent print:bg-none p-6 pt-20 print:pt-0 print:px-0 print:pb-4 print:mb-4 print:border-b print:border-slate-300 flex justify-between items-end print:items-start">
                <div>
                  <div className="flex items-center gap-4 mb-1">
                    {viewRecord.studentProfileImage && (viewRecord.imageUrls?.length > 0 || viewRecord.imageUrl) && (
                      <img src={viewRecord.studentProfileImage} className="w-14 h-14 rounded-full border-2 border-white object-cover shadow-lg print:hidden" alt="Student Profile" />
                    )}
                    <h2 className="text-3xl print:text-2xl font-black text-white print:text-black leading-tight">{formatStudentName(viewRecord.studentName, viewRecord.gender)}</h2>
                  </div>
                  <div className={`flex flex-col gap-1 print:gap-0 text-white/80 print:text-black text-sm font-bold ${viewRecord.studentProfileImage && (viewRecord.imageUrls?.length > 0 || viewRecord.imageUrl) ? 'ml-[72px] print:ml-0' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span>{viewRecord.department && `${viewRecord.department} - `}{viewRecord.classroom}</span>
                      <span>•</span>
                      <span>{viewRecord.recordType === 'home_visit' ? 'บันทึกเยี่ยมบ้าน' : 'แบบคัดกรอง'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/60 print:text-black">
                      {viewRecord.gender && <span>เพศ: {viewRecord.gender}</span>}
                      {viewRecord.gender && viewRecord.dob && <span>•</span>}
                      {viewRecord.dob && <span>วันเกิด: {new Date(viewRecord.dob).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })} (อายุ {calculateAge(viewRecord.dob)} ปี)</span>}
                    </div>
                  </div>
                </div>

                {/* Print mode only: Add student photo to the right side of the banner */}
                <div className="hidden print:block shrink-0 ml-4">
                  {(viewRecord.imageUrls?.[0] || viewRecord.imageUrl || viewRecord.studentProfileImage) ? (
                    <img
                      src={viewRecord.imageUrls?.[0] || viewRecord.imageUrl || viewRecord.studentProfileImage}
                      className="w-[3.5cm] h-[4.5cm] object-cover border border-slate-300 rounded-md bg-white p-1"
                      alt="Student"
                    />
                  ) : (
                    <div className="w-[3.5cm] h-[4.5cm] border border-slate-300 rounded-md flex items-center justify-center text-black bg-white text-xs text-center p-2">รูปถ่าย<br />นักเรียน</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Status & Actions */}
              <div className="no-print flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-6">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-black rounded-xl border ${viewRecord.sdqType === 'normal' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    viewRecord.sdqType === 'special' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      viewRecord.sdqType === 'risk' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                    {viewRecord.sdqType === 'problem' && <AlertCircle size={16} />}
                    {viewRecord.sdqType === 'normal' ? 'ปกติ (Normal)' : viewRecord.sdqType === 'special' ? 'พิเศษ (Special)' : viewRecord.sdqType === 'risk' ? 'เสี่ยง (Risk)' : 'มีปัญหา (Problem)'}
                  </span>

                  {viewRecord.status === 'referred' && (
                    <span className="px-3 py-2 text-xs font-black uppercase rounded-xl bg-rose-500 text-white shadow-md flex items-center gap-1">
                      <Send size={14} /> ส่งต่อ
                    </span>
                  )}
                  {viewRecord.status === 'resolved' && (
                    <span className="px-3 py-2 text-xs font-black uppercase rounded-xl bg-emerald-500 text-white shadow-md flex items-center gap-1">
                      <Check size={14} /> แก้ไขแล้ว
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                    title="พิมพ์หรือบันทึกเป็น PDF"
                  >
                    <Printer size={16} /> พิมพ์
                  </button>

                  {(user.role === 'super_admin' || user.username === viewRecord.teacherName) && (
                    <>
                      <button
                        onClick={() => handleEdit(viewRecord)}
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                      >
                        <Edit size={16} /> แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(viewRecord._id)}
                        className="flex items-center gap-1.5 bg-red-50 hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                      >
                        <Trash2 size={16} /> ลบ
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Details */}
              {viewRecord.recordType === 'home_visit' && viewRecord.address && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">ที่อยู่ / สภาพที่พักอาศัย</h4>
                  <p className="text-slate-800 dark:text-zinc-200 text-sm leading-relaxed p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800">{viewRecord.address}</p>
                </div>
              )}

              {viewRecord.recordType === 'home_visit' && viewRecord.gpsLat && viewRecord.gpsLng && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">พิกัดเยี่ยมบ้าน</h4>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${viewRecord.gpsLat},${viewRecord.gpsLng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-bold p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors w-fit border border-indigo-100 dark:border-indigo-900/50"
                  >
                    <MapPin size={16} /> ดูพิกัดบน Google Maps
                  </a>
                </div>
              )}

              {/* SDQ Details if available */}
              {viewRecord.recordType === 'screening' && viewRecord.sdqData && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">รายละเอียดคะแนน SDQ (ฉบับครูประเมิน)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="print-box p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <div className="text-[10px] text-slate-500 font-bold mb-1">ด้านที่ 1: อารมณ์</div>
                      <div className="text-xl font-black text-slate-700 dark:text-zinc-300">{viewRecord.sdqData.E}</div>
                      {viewRecord.sdqData.E_res && (
                        <div className={`mt-1 text-[10px] font-bold ${viewRecord.sdqData.E_res === 'problem' ? 'text-rose-500' : viewRecord.sdqData.E_res === 'risk' ? 'text-amber-500' : 'text-emerald-500'}`}>
                          แปลผล: {viewRecord.sdqData.E_res === 'problem' ? 'มีปัญหา' : viewRecord.sdqData.E_res === 'risk' ? 'เสี่ยง' : 'ปกติ'}
                        </div>
                      )}
                    </div>
                    <div className="print-box p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <div className="text-[10px] text-slate-500 font-bold mb-1">ด้านที่ 2: ความประพฤติ</div>
                      <div className="text-xl font-black text-slate-700 dark:text-zinc-300">{viewRecord.sdqData.C}</div>
                      {viewRecord.sdqData.C_res && (
                        <div className={`mt-1 text-[10px] font-bold ${viewRecord.sdqData.C_res === 'problem' ? 'text-rose-500' : viewRecord.sdqData.C_res === 'risk' ? 'text-amber-500' : 'text-emerald-500'}`}>
                          แปลผล: {viewRecord.sdqData.C_res === 'problem' ? 'มีปัญหา' : viewRecord.sdqData.C_res === 'risk' ? 'เสี่ยง' : 'ปกติ'}
                        </div>
                      )}
                    </div>
                    <div className="print-box p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <div className="text-[10px] text-slate-500 font-bold mb-1">ด้านที่ 3: สมาธิสั้น</div>
                      <div className="text-xl font-black text-slate-700 dark:text-zinc-300">{viewRecord.sdqData.H}</div>
                      {viewRecord.sdqData.H_res && (
                        <div className={`mt-1 text-[10px] font-bold ${viewRecord.sdqData.H_res === 'problem' ? 'text-rose-500' : viewRecord.sdqData.H_res === 'risk' ? 'text-amber-500' : 'text-emerald-500'}`}>
                          แปลผล: {viewRecord.sdqData.H_res === 'problem' ? 'มีปัญหา' : viewRecord.sdqData.H_res === 'risk' ? 'เสี่ยง' : 'ปกติ'}
                        </div>
                      )}
                    </div>
                    <div className="print-box p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <div className="text-[10px] text-slate-500 font-bold mb-1">ด้านที่ 4: สัมพันธ์กับเพื่อน</div>
                      <div className="text-xl font-black text-slate-700 dark:text-zinc-300">{viewRecord.sdqData.Pe}</div>
                      {viewRecord.sdqData.Pe_res && (
                        <div className={`mt-1 text-[10px] font-bold ${viewRecord.sdqData.Pe_res === 'problem' ? 'text-rose-500' : viewRecord.sdqData.Pe_res === 'risk' ? 'text-amber-500' : 'text-emerald-500'}`}>
                          แปลผล: {viewRecord.sdqData.Pe_res === 'problem' ? 'มีปัญหา' : viewRecord.sdqData.Pe_res === 'risk' ? 'เสี่ยง' : 'ปกติ'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div className="print-box p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                      <div className="text-[10px] text-amber-600 font-bold mb-1">รวม 4 ด้าน</div>
                      <div className="text-xl font-black text-amber-700 dark:text-amber-500">{viewRecord.sdqData.total}</div>
                      <div className={`mt-1 text-[10px] font-bold ${viewRecord.sdqType === 'problem' ? 'text-rose-600' : viewRecord.sdqType === 'risk' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        แปลผล: {viewRecord.sdqType === 'problem' ? 'มีปัญหา' : viewRecord.sdqType === 'risk' ? 'เสี่ยง' : 'ปกติ'}
                      </div>
                    </div>
                    <div className="print-box p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                      <div className="text-[10px] text-emerald-600 font-bold mb-1">สัมพันธภาพทางสังคม</div>
                      <div className="text-xl font-black text-emerald-700 dark:text-emerald-500">{viewRecord.sdqData.P}</div>
                      {viewRecord.sdqData.P_res && (
                        <div className="mt-1 text-[10px] font-bold text-emerald-600">
                          แปลผล: {viewRecord.sdqData.P_res === 'strength' ? 'เป็นจุดแข็ง' : 'ไม่มีจุดแข็ง'}
                        </div>
                      )}
                    </div>
                  </div>

                  {viewRecord.sdqData.impact && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                      <h5 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center justify-between">
                        <span>ผลประเมินผลกระทบ (ด้านหลัง)</span>
                        {viewRecord.sdqData.impact.result && (
                          <span className={`px-2 py-1 rounded text-xs ${viewRecord.sdqData.impact.result === 'problem' ? 'bg-rose-100 text-rose-600' : viewRecord.sdqData.impact.result === 'risk' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            แปลผล: {viewRecord.sdqData.impact.result === 'problem' ? 'มีปัญหา' : viewRecord.sdqData.impact.result === 'risk' ? 'เสี่ยง' : 'ปกติ'}
                          </span>
                        )}
                      </h5>
                      {viewRecord.sdqData.impact.hasProblem === 0 ? (
                        <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 text-center">
                          <p className="text-sm font-bold text-slate-600 dark:text-zinc-400">ไม่มีปัญหา</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                            <p className="text-[10px] text-slate-500 font-bold mb-1">ระดับปัญหา</p>
                            <p className="text-sm font-black text-rose-600 dark:text-rose-400">
                              {['ไม่', 'มีปัญหาเล็กน้อย', 'มีปัญหาชัดเจน', 'มีปัญหาอย่างมาก'][viewRecord.sdqData.impact.hasProblem]}
                            </p>
                          </div>
                          {viewRecord.sdqData.impact.duration > -1 && (
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                              <p className="text-[10px] text-slate-500 font-bold mb-1">ระยะเวลาที่เกิดปัญหา</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                                {['น้อยกว่า 1 เดือน', '1 - 5 เดือน', '6 - 12 เดือน', 'มากกว่า 1 ปี'][viewRecord.sdqData.impact.duration]}
                              </p>
                            </div>
                          )}
                          {viewRecord.sdqData.impact.distress > -1 && (
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                              <p className="text-[10px] text-slate-500 font-bold mb-1">ความไม่สบายใจของเด็ก</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                                {['ไม่เลย', 'เล็กน้อย', 'ค่อนข้างมาก', 'มาก'][viewRecord.sdqData.impact.distress]}
                              </p>
                            </div>
                          )}
                          {viewRecord.sdqData.impact.interferePeer > -1 && (
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                              <p className="text-[10px] text-slate-500 font-bold mb-1">รบกวนชีวิตประจำวัน (เพื่อน)</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                                {['ไม่', 'เล็กน้อย', 'ค่อนข้างมาก', 'มาก'][viewRecord.sdqData.impact.interferePeer]}
                              </p>
                            </div>
                          )}
                          {viewRecord.sdqData.impact.interfereClass > -1 && (
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                              <p className="text-[10px] text-slate-500 font-bold mb-1">รบกวนการเรียน (ห้องเรียน)</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                                {['ไม่', 'เล็กน้อย', 'ค่อนข้างมาก', 'มาก'][viewRecord.sdqData.impact.interfereClass]}
                              </p>
                            </div>
                          )}
                          {viewRecord.sdqData.impact.burden > -1 && (
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                              <p className="text-[10px] text-slate-500 font-bold mb-1">ความยุ่งยากต่อชั้นเรียน/ครู</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                                {['ไม่เลย', 'เล็กน้อย', 'ค่อนข้างมาก', 'มาก'][viewRecord.sdqData.impact.burden]}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="print:break-before-page print:pt-12 space-y-6">
                {viewRecord.recordType === 'screening' && viewRecord.sdqData && viewRecord.sdqData.otherConcerns && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">ความเห็นหรือความกังวลอื่น</h4>
                    <p className="text-slate-800 dark:text-zinc-200 text-sm leading-relaxed p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 min-h-24">
                      {viewRecord.sdqData.otherConcerns}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">บันทึกเพิ่มเติม / ข้อเสนอแนะ</h4>
                  <p className="text-slate-800 dark:text-zinc-200 text-sm leading-relaxed p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 min-h-24">
                    {viewRecord.notes || "ไม่มีบันทึกเพิ่มเติม"}
                  </p>
                </div>
              </div>

              <div className="pt-6 print:pt-[120px] mt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-center md:justify-end print:justify-end">
                <div className="flex items-baseline">
                  <span className="text-sm text-slate-500 mr-2 whitespace-nowrap">ลงชื่อ</span>
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-sm text-slate-500 leading-none">..............................................................</span>
                    <div className="font-bold text-slate-800 dark:text-zinc-200 mt-2">({viewRecord.teacherName})</div>
                    {viewRecord.teacherDepartment && <div className="text-sm font-medium mt-1 text-slate-600 dark:text-slate-400">แผนก: {viewRecord.teacherDepartment}</div>}
                    <div className="text-sm font-medium mt-1 text-slate-600 dark:text-slate-400">ครูที่ปรึกษา/ผู้ประเมิน</div>
                    <div className="text-sm font-bold mt-1 text-slate-600 dark:text-slate-400">
                      วันที่ประเมิน: {new Date(viewRecord.visitDate || viewRecord.createdAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })} น.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-99999 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
            onClick={() => setFullscreenImage(null)}
          >
            <X size={24} />
          </button>
          {/* Left Arrow */}
          {fullscreenImage && viewRecord?.imageUrls && viewRecord.imageUrls.includes(fullscreenImage) && viewRecord.imageUrls.length > 1 && (
            <button
              className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md shadow-2xl"
              onClick={(e) => {
                e.stopPropagation();
                const idx = viewRecord.imageUrls.indexOf(fullscreenImage);
                const nextIdx = idx === 0 ? viewRecord.imageUrls.length - 1 : idx - 1;
                setFullscreenImage(viewRecord.imageUrls[nextIdx]);
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
          )}

          <img
            src={fullscreenImage}
            alt="Fullscreen View"
            className="max-w-[95vw] max-h-[90vh] object-contain drop-shadow-2xl rounded-lg"
            onClick={(e) => e.stopPropagation()} // prevent click from closing immediately if they click the image itself
          />

          {/* Right Arrow */}
          {fullscreenImage && viewRecord?.imageUrls && viewRecord.imageUrls.includes(fullscreenImage) && viewRecord.imageUrls.length > 1 && (
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md shadow-2xl"
              onClick={(e) => {
                e.stopPropagation();
                const idx = viewRecord.imageUrls.indexOf(fullscreenImage);
                const nextIdx = idx === viewRecord.imageUrls.length - 1 ? 0 : idx + 1;
                setFullscreenImage(viewRecord.imageUrls[nextIdx]);
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          )}

          <div className="absolute bottom-6 text-white/50 text-sm font-medium bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md pointer-events-none">
            {viewRecord?.imageUrls?.includes(fullscreenImage) && viewRecord.imageUrls.length > 1 ? `รูปที่ ${viewRecord.imageUrls.indexOf(fullscreenImage) + 1} / ${viewRecord.imageUrls.length} • ` : ''}คลิกที่พื้นหลังเพื่อปิด
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin-top: 0.5cm !important;
            margin-bottom: 0.5cm !important;
            margin-left: 1cm !important;
            margin-right: 1cm !important;
          }
          header, nav, aside, footer, .sidebar, .navbar, .topbar {
            display: none !important;
          }
          #print-section, #print-summary-section,
          #print-section *, #print-summary-section * {
            font-family: 'TH SarabunPSK', 'TH Sarabun New', Sarabun, sans-serif !important;
            color: black !important;
            font-size: 16pt !important;
            line-height: 1.1 !important;
          }
          #print-section .print-title, #print-summary-section .print-title {
            font-size: 20pt !important;
            font-weight: bold !important;
          }
          #print-section, #print-summary-section {
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          #print-section .rounded-xl, #print-section .rounded-2xl,
          #print-summary-section .rounded-xl, #print-summary-section .rounded-2xl {
            background-color: #f3f4f6 !important;
            border-color: #d1d5db !important;
            padding-top: 8px !important;
            padding-bottom: 8px !important;
          }
          .no-print, .hidden-in-print {
            display: none !important;
            height: 0 !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Fix scrolling issue in print */
          body, html {
            overflow: visible !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Force remove the pt-20 padding from the root layout that pushes the first page down */
          .pt-20 {
            padding-top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
