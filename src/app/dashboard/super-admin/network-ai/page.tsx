"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Server,
  ShieldCheck,
  Activity,
  Terminal,
  RefreshCw,
  Send,
  Bot,
  User,
  ChevronRight,
  Sparkles,
  Zap,
  Play,
  Copy,
  Check,
  Brain,
  Plus,
  Trash2,
  BookOpen,
  Globe,
  FileCode,
  RotateCcw,
  CheckCircle2,
  Eye,
  EyeOff,
  Paperclip,
  Camera,
  Image as ImageIcon,
  FileText,
  X,
  Maximize2,
  Minimize2,
  MessageSquare,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Menu,
  Square,
  Clock,
  ListPlus,
  CornerDownLeft,
  ArrowUp,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatSession {
  sessionId: string;
  title: string;
  model: string;
  lastMessage: string;
  updatedAt: string;
  createdAt: string;
}

interface AgentActionStep {
  type: "explore" | "edit" | "command" | "info";
  title: string;
  detail?: string;
  diff?: { add: number; del: number };
}

interface Device {
  id: string;
  name: string;
  role: string;
  ip: string;
  location: string;
  vlan: string;
  corePort?: string;
  brand?: string;
  status: "ONLINE" | "OFFLINE";
  latencyMs: number | null;
  packetLoss: number;
  rawOutput: string;
  lastChecked: string;
}

interface CodeProposal {
  filePath: string;
  action: "modify" | "create" | "patch";
  description: string;
  code?: string;
  target?: string;
  replacement?: string;
  applied?: boolean;
  hasBackup?: boolean;
  rejected?: boolean;
}

interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  base64?: string;
  size: number;
  textContent?: string;
}

interface Message {
  role: "user" | "model";
  content: string;
  timestamp: string;
  modelUsed?: string;
  duration?: string;
  actionSteps?: AgentActionStep[];
  learnedAlert?: string;
  webSources?: Array<{ title: string; snippet: string; link: string }>;
  codeProposal?: CodeProposal;
  attachments?: ChatAttachment[];
}

interface QueuedMessage {
  id: string;
  text: string;
  attachments: ChatAttachment[];
  timestamp: string;
}

interface M1Task {
  id: string;
  command: string;
  status: "idle" | "running" | "success" | "error";
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  outputLogs: string[];
  exitCode?: number | null;
  error?: string;
}

// Client-side image compressor (max 1280px, 80% JPEG)
const compressImage = async (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onerror = () => resolve(base64Str);
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(base64Str);

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        } catch {
          resolve(base64Str);
        }
      };
      img.src = base64Str;
    } catch {
      resolve(base64Str);
    }
  });
};

interface KnowledgeItem {
  _id: string;
  topic: string;
  content: string;
  tags: string[];
  source: string;
  createdAt: string;
}

const QUICK_PROMPTS = [
  "สรุปสถานะอุปกรณ์เครือข่ายหลักทั้งหมดในตอนนี้ (Live Telemetry)",
  "M1 ช่วยปรับแต่งปุ่มในหน้า /network-monitor ให้ที",
  "ตรวจสอบสถานะอาคารช่างยนต์ (พอร์ต 1/1/5 และ Switch 192.168.6.13) ต้องแก้ไขอย่างไร",
  "จำไว้ว่า: วันนี้ช่างกำลังเดินสายไฟเบอร์ใหม่อาคารช่างยนต์ คาดว่าจะเสร็จช่วงเย็น",
  "สรุปประวัติการแก้ไขปัญหาเครือข่ายที่ M1 จำได้ในสมอง",
  "ตรวจเช็คสถานะ PM2 และ Cloudflare บน Server ตอนนี้",
];

const PRESET_COMMANDS: Record<string, { label: string; cmd: string }[]> = {
  aruba_core: [
    { label: "ตรวจพอร์ตช่างยนต์ (1/1/5)", cmd: "show interface 1/1/5 brief" },
    { label: "ดูพอร์ตไฟเบอร์ 1/1/1 - 1/1/12", cmd: "show interface brief" },
    { label: "ดูตาราง VLAN", cmd: "show vlan" },
    { label: "ดูข้อมูลระบบ (Version)", cmd: "show version" },
  ],
  server: [
    { label: "สถานะเว็บ PM2", cmd: "pm2 list" },
    { label: "เช็ค RAM / Disk", cmd: "free -h && df -h /" },
    { label: "เช็ค Cloudflare Service", cmd: "systemctl status cloudflared --no-pager" },
    { label: "Log ล่าสุดของ Cloudflare", cmd: "journalctl -u cloudflared -n 15 --no-pager" },
  ],
  cisco_b4: [
    { label: "ดูสถานะพอร์ตทั้งหมด", cmd: "show interface status" },
    { label: "ตรวจพอร์ต Uplink G25", cmd: "show interface gigabitethernet 25" },
    { label: "ดูตาราง VLAN", cmd: "show vlan" },
  ],
};

export default function NetworkAiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Devices & Telemetry State
  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [lastTelemetryUpdate, setLastTelemetryUpdate] = useState<string>("");

  // Knowledge & Memory State
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "knowledge">("chat");
  const [newTopic, setNewTopic] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isSavingKnowledge, setIsSavingKnowledge] = useState(false);

  // Engine selection: "gemini-3.7-flash" | "gemini-3.6-flash" | "gemini-flash-latest" | "m1"
  const [engineMode, setEngineMode] = useState<"gemini-3.7-flash" | "gemini-3.6-flash" | "gemini-flash-latest" | "m1">("gemini-3.6-flash");

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content:
        "สวัสดีครับ Super Admin ผมคือ **Google AI & Agent M1** ผู้ช่วยวิศวกรระบบและเครือข่าย KTLTC\n\n- ⚡ **Google AI Engine (1M Token Free)**: วิเคราะห์โค้ด, ตรวจสอบเครือข่าย Cisco/Aruba, วางแผนระบบ และสั่งการ Bash บนเซิร์ฟเวอร์\n- 📁 **ระบบบันทึกประวัติการสนทนา**: บันทึกแยกห้องแชตอัตโนมัติใน MongoDB สามารถสร้างห้องใหม่และเปิดดูย้อนหลังได้ตลอดเวลา\n- 🧠 **ความจำระยะยาว (Autonomous Learning)**: พิมพ์บอกให้ผม 'จำไว้ว่า...' เพื่อบันทึกลงสมอง M1 ในเครื่องถาวร\n- 📎 **มัลติโมดอล**: รองรับการแนบภาพถ่ายตู้แร็ค พอร์ตสวิตช์ กล้องสด และเอกสาร/Log เพื่อวิเคราะห์ได้ทันทีครับ!",
      timestamp: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      modelUsed: "Google AI (Gemini 3.6 Flash)",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Command Runner State
  const [selectedTarget, setSelectedTarget] = useState<"aruba_core" | "server" | "cisco_b4">("aruba_core");
  const [customCommand, setCustomCommand] = useState("show interface 1/1/5 brief");
  const [commandOutput, setCommandOutput] = useState<string | null>(null);
  const [isExecutingCmd, setIsExecutingCmd] = useState(false);
  const [copied, setCopied] = useState(false);

  // M1 Web-Modifier Engine State
  const [applyingCode, setApplyingCode] = useState(false);
  const [rebuildingCode, setRebuildingCode] = useState(false);
  const [previewCodeIndex, setPreviewCodeIndex] = useState<number | null>(null);
  const [activeTask, setActiveTask] = useState<M1Task | null>(null);
  const [showTaskTerminal, setShowTaskTerminal] = useState(true);

  // Antigravity Agent Action Trace State
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [thinkingElapsed, setThinkingElapsed] = useState(0);

  // Thinking timer effect
  useEffect(() => {
    let timer: any = null;
    if (isSending) {
      setThinkingElapsed(0);
      timer = setInterval(() => {
        setThinkingElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setThinkingElapsed(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSending]);

  // Multimodal & Attachments State
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  // Session & Multi-Room State
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [currentSessionTitle, setCurrentSessionTitle] = useState<string>("บทสนทนาใหม่");
  const [sessionsList, setSessionsList] = useState<ChatSession[]>([]);
  const [isSessionsDrawerOpen, setIsSessionsDrawerOpen] = useState(true);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isFullscreenChat, setIsFullscreenChat] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Message Queue & Abort Controller
  const [messageQueue, setMessageQueue] = useState<QueuedMessage[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Hidden Input & Media Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch Chat Sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/super-admin/network-ai/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessionsList(data.sessions || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Select / Switch to an existing Chat Session
  const handleSelectSession = async (sessionId: string) => {
    if (sessionId === currentSessionId) {
      setIsSessionsDrawerOpen(false);
      return;
    }
    setIsLoadingSession(true);
    try {
      const res = await fetch(`/api/super-admin/network-ai/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentSessionId(sessionId);
        setCurrentSessionTitle(data.session?.title || "บทสนทนา");
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([
            {
              role: "model",
              content: `เปิดห้องสนทนา "${data.session?.title || "บทสนทนา"}" เรียบร้อยแล้วครับ`,
              timestamp: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
        }
        setIsSessionsDrawerOpen(false);
      }
    } catch {
      toast.error("ไม่สามารถโหลดประวัติห้องนี้ได้");
    } finally {
      setIsLoadingSession(false);
    }
  };

  // Create / Start a New Chat Session
  const handleCreateNewSession = () => {
    const newId = crypto.randomUUID();
    setCurrentSessionId(newId);
    setCurrentSessionTitle("บทสนทนาใหม่");
    setMessages([
      {
        role: "model",
        content:
          "สวัสดีครับ Super Admin ผมคือ **Agent M1** โมเดล AI ประจำเครื่องเซิร์ฟเวอร์ KTLTC\n\nนี่คือ **ห้องแชตใหม่** สามารถพิมพ์สั่งงาน ปรึกษา สอบถาม หรือแนบรูปภาพ/ไฟล์ได้ทันทีครับ!",
        timestamp: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "Gemini 3.6 Flash",
      },
    ]);
    setIsSessionsDrawerOpen(false);
    toast.success("เริ่มต้นห้องแชตใหม่แล้ว");
  };

  // Delete a Chat Session
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("ต้องการลบประวัติการสนทนาของห้องนี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/super-admin/network-ai/sessions?id=${sessionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("ลบห้องสนทนาเรียบร้อย");
        fetchSessions();
        if (sessionId === currentSessionId) {
          handleCreateNewSession();
        }
      }
    } catch {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  // Security Check: redirect non-super_admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user as any)?.role !== "super_admin") {
      toast.error("เข้าถึงไม่ได้: สิทธิ์ Super Admin เท่านั้น");
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  // Auto-scroll chat internally without jumping outer page
  useEffect(() => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTo({
        top: chatMessagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isSending]);

  // Fetch Live Telemetry
  const fetchTelemetry = async () => {
    setLoadingDevices(true);
    try {
      const res = await fetch("/api/super-admin/network-ai/telemetry");
      if (!res.ok) throw new Error("Failed to fetch telemetry");
      const data = await res.json();
      if (data.devices) {
        setDevices(data.devices);
        setLastTelemetryUpdate(new Date().toLocaleTimeString("th-TH"));
      }
    } catch {
      toast.error("ไม่สามารถดึงข้อมูล Telemetry สดได้");
    } finally {
      setLoadingDevices(false);
    }
  };

  // Fetch M1 Knowledge Base
  const fetchKnowledge = async () => {
    try {
      const res = await fetch("/api/super-admin/network-ai/knowledge");
      if (res.ok) {
        const data = await res.json();
        setKnowledgeList(data.knowledge || []);
      }
    } catch {
      console.error("Failed to load knowledge");
    }
  };

  useEffect(() => {
    if (session && (session.user as any)?.role === "super_admin") {
      fetchTelemetry();
      fetchKnowledge();
    }
  }, [session]);

  // Poll background task status (Real-time Live Console Runner)
  useEffect(() => {
    let timer: any = null;
    const checkTask = async () => {
      try {
        const res = await fetch("/api/super-admin/network-ai/code-action");
        if (res.ok) {
          const data = await res.json();
          if (data.task && data.task.status !== "idle") {
            setActiveTask(data.task);
            if (data.task.status === "running") {
              setRebuildingCode(true);
            } else if (data.task.status === "success" || data.task.status === "error") {
              setRebuildingCode(false);
            }
          }
        }
      } catch {
        // ignore
      }
    };

    // Check once on mount
    checkTask();

    // Poll every 1.5 seconds if running
    if (activeTask?.status === "running" || rebuildingCode) {
      timer = setInterval(checkTask, 1500);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTask?.status, rebuildingCode]);

  // Add Manual Knowledge
  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !newContent.trim() || isSavingKnowledge) return;

    setIsSavingKnowledge(true);
    try {
      const res = await fetch("/api/super-admin/network-ai/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: newTopic.trim(), content: newContent.trim() }),
      });

      if (res.ok) {
        toast.success("บันทึกความรู้ใหม่ให้ Agent M1 สำเร็จ!");
        setNewTopic("");
        setNewContent("");
        fetchKnowledge();
      } else {
        toast.error("บันทึกไม่สำเร็จ");
      }
    } catch (err: any) {
      toast.error(err.message || "Error");
    } finally {
      setIsSavingKnowledge(false);
    }
  };

  // Delete Memory
  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm("ต้องการลบความรู้นี้ออกจากสมอง M1 หรือไม่?")) return;
    try {
      const res = await fetch(`/api/super-admin/network-ai/knowledge?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("ลบความรู้เรียบร้อย");
        fetchKnowledge();
      }
    } catch (err: any) {
      toast.error(err.message || "Delete error");
    }
  };

  // Handle Apply Code Modification
  const handleApplyCode = async (msgIndex: number, proposal: CodeProposal, andRebuild: boolean = false) => {
    setApplyingCode(true);
    try {
      const payload: any = {
        action: proposal.action === "patch" ? "patch" : "apply",
        filePath: proposal.filePath,
        sessionId: currentSessionId,
      };

      if (proposal.action === "patch") {
        payload.target = proposal.target;
        payload.replacement = proposal.replacement;
      } else {
        payload.code = proposal.code;
      }

      const res = await fetch("/api/super-admin/network-ai/code-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "บันทึกไฟล์ไม่สำเร็จ");

      toast.success(data.message || "บันทึกไฟล์สำเร็จ!");

      // Update message proposal state
      setMessages((prev) =>
        prev.map((m, idx) =>
          idx === msgIndex && m.codeProposal
            ? { ...m, codeProposal: { ...m.codeProposal, applied: true, hasBackup: data.hasBackup } }
            : m
        )
      );

      if (andRebuild) {
        handleTriggerRebuild();
      }
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการบันทึกไฟล์");
    } finally {
      setApplyingCode(false);
    }
  };

  // Handle Rollback File
  const handleRollbackCode = async (msgIndex: number, filePath: string) => {
    try {
      const res = await fetch("/api/super-admin/network-ai/code-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rollback",
          filePath,
          sessionId: currentSessionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "กู้คืนไฟล์ไม่สำเร็จ");

      toast.success(data.message || "กู้คืนไฟล์สำเร็จ!");
      setMessages((prev) =>
        prev.map((m, idx) =>
          idx === msgIndex && m.codeProposal
            ? { ...m, codeProposal: { ...m.codeProposal, applied: false } }
            : m
        )
      );
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการ Rollback");
    }
  };

  // Trigger Rebuild & PM2 Reload (Live Background Task)
  const handleTriggerRebuild = async () => {
    setRebuildingCode(true);
    setShowTaskTerminal(true);
    try {
      const res = await fetch("/api/super-admin/network-ai/code-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rebuild" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "สั่ง Rebuild ไม่สำเร็จ");
      if (data.task) {
        setActiveTask(data.task);
      }
      toast.success("🚀 เริ่มกระบวนการ Build & PM2 Reload ในเบื้องหลังแล้ว!");
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการสั่ง Rebuild");
      setRebuildingCode(false);
    }
  };

  // Reject Proposal
  const handleRejectCode = (msgIndex: number) => {
    setMessages((prev) =>
      prev.map((m, idx) =>
        idx === msgIndex && m.codeProposal
          ? { ...m, codeProposal: { ...m.codeProposal, rejected: true } }
          : m
      )
    );
    toast("ยกเลิกข้อเสนอการแก้ไขโค้ดเรียบร้อย", { icon: "ℹ️" });
  };

  // Start Live Camera
  const startCamera = async () => {
    try {
      setIsAttachModalOpen(false);
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Direct webcam failed, falling back to camera input:", err);
      setIsCameraActive(false);
      cameraInputRef.current?.click();
    }
  };

  // Stop Live Camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Capture Photo from Live Camera
  const capturePhoto = async () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const compressed = await compressImage(rawDataUrl);

      const newAtt: ChatAttachment = {
        id: crypto.randomUUID(),
        name: `camera_${Date.now()}.jpg`,
        type: "image/jpeg",
        base64: compressed,
        size: Math.round(compressed.length * 0.75),
      };

      setAttachments((prev) => [...prev, newAtt]);
      toast.success("บันทึกภาพถ่ายแล้ว!");
      stopCamera();
    } catch {
      toast.error("ถ่ายภาพไม่สำเร็จ");
    }
  };

  // File Processor for Images & Documents
  const processFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;

    for (const file of fileArr) {
      const id = crypto.randomUUID();
      const isImage = file.type.startsWith("image/");
      const isText =
        file.type.startsWith("text/") ||
        /\.(log|conf|cfg|txt|json|csv|md)$/i.test(file.name);

      if (isImage) {
        const reader = new FileReader();
        reader.onload = async () => {
          const rawBase64 = reader.result as string;
          const compressed = await compressImage(rawBase64);
          setAttachments((prev) => [
            ...prev,
            {
              id,
              name: file.name,
              type: file.type || "image/jpeg",
              base64: compressed,
              size: file.size,
            },
          ]);
          toast.success(`เพิ่มรูปภาพ: ${file.name}`);
        };
        reader.readAsDataURL(file);
      } else if (isText) {
        const textReader = new FileReader();
        textReader.onload = () => {
          const textContent = textReader.result as string;
          const base64Reader = new FileReader();
          base64Reader.onload = () => {
            setAttachments((prev) => [
              ...prev,
              {
                id,
                name: file.name,
                type: file.type || "text/plain",
                base64: base64Reader.result as string,
                size: file.size,
                textContent: textContent.slice(0, 15000),
              },
            ]);
            toast.success(`เพิ่มไฟล์เอกสาร: ${file.name}`);
          };
          base64Reader.readAsDataURL(file);
        };
        textReader.readAsText(file);
      } else {
        // PDF or other binary files
        const reader = new FileReader();
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id,
              name: file.name,
              type: file.type || "application/octet-stream",
              base64: reader.result as string,
              size: file.size,
            },
          ]);
          toast.success(`เพิ่มไฟล์: ${file.name}`);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Clipboard Paste (e.g. Screenshots)
  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      processFiles(e.clipboardData.files);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Cancel / Abort active generating request
  const handleAbortRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsSending(false);
    toast("ยกเลิกคำถามแล้ว", { icon: "🛑" });
  };

  // Remove specific item from queue
  const handleRemoveFromQueue = (id: string) => {
    setMessageQueue((prev) => prev.filter((item) => item.id !== id));
    toast("นำคำถามออกจากคิวแล้ว", { icon: "🗑️" });
  };

  // Clear all queue
  const handleClearQueue = () => {
    setMessageQueue([]);
    toast("ล้างคิวคำถามทั้งหมดแล้ว", { icon: "🧹" });
  };

  // Core API sender
  const executeSend = async (textToSend: string, currentAttachments: ChatAttachment[] = []) => {
    const userMsg: Message = {
      role: "user",
      content: textToSend.trim() || (currentAttachments.length > 0 ? "ส่งไฟล์/รูปภาพแนบ" : ""),
      timestamp: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const sendStartTime = Date.now();

    try {
      const res = await fetch("/api/super-admin/network-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: textToSend.trim(),
          history: messagesRef.current.slice(-8),
          useModel: engineMode,
          attachments: currentAttachments,
          sessionId: currentSessionId || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reach AI");
      }

      const data = await res.json();

      let learnedAlert = undefined;
      if (data.learnedItem) {
        learnedAlert = `🧠 M1 ประมวลผลและเรียนรู้ข้อมูลใหม่โดยอัตโนมัติ: [${data.learnedItem.topic}] - "${data.learnedItem.content}"`;
        fetchKnowledge(); // refresh knowledge list
      }

      let codeProposal = data.codeProposal;
      let replyContent = data.reply || "⚠️ ไม่ได้รับข้อมูลตอบกลับจากระบบ";

      if (!codeProposal) {
        const match = replyContent.match(/\[CODE_PROPOSAL\]([\s\S]*?)\[\/CODE_PROPOSAL\]/i);
        if (match) {
          try {
            const rawJson = match[1].trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
            const parsed = JSON.parse(rawJson);
            const isValid =
              parsed.filePath &&
              (parsed.code !== undefined ||
                (parsed.action === "patch" && parsed.target !== undefined && parsed.replacement !== undefined));
            if (isValid) {
              codeProposal = parsed;
              replyContent = replyContent.replace(match[0], "").trim();
            }
          } catch {
            // ignore
          }
        }
      }

      const sendElapsedSec = Math.max(1, Math.round((Date.now() - sendStartTime) / 1000));
      const durationStr =
        sendElapsedSec >= 60
          ? `Worked for ${Math.floor(sendElapsedSec / 60)}m ${sendElapsedSec % 60}s`
          : `Worked for ${sendElapsedSec}s`;

      const actionSteps: AgentActionStep[] = [];
      if (data.inspectedFile || codeProposal?.filePath) {
        const pathName = codeProposal?.filePath || data.inspectedFile || "src/app/page.tsx";
        actionSteps.push({
          type: "explore",
          title: "Explored 1 file",
          detail: pathName,
        });
      }
      if (codeProposal) {
        const fileName = codeProposal.filePath.split("/").pop() || codeProposal.filePath;
        actionSteps.push({
          type: "edit",
          title: fileName,
          detail: codeProposal.filePath,
          diff: {
            add: codeProposal.action === "patch" ? 3 : 26,
            del: codeProposal.action === "patch" ? 1 : 3,
          },
        });
      }
      if (data.commandRan || codeProposal) {
        actionSteps.push({
          type: "command",
          title: "npm run build && pm2 reload ktltc --",
        });
      } else {
        actionSteps.push({
          type: "command",
          title: "live telemetry & network health check",
        });
      }

      const aiReply: Message = {
        role: "model",
        content: replyContent,
        timestamp: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.modelUsed,
        duration: durationStr,
        actionSteps,
        learnedAlert,
        webSources: data.webSources,
        codeProposal,
      };
      setMessages((prev) => [...prev, aiReply]);
      if (data.sessionId && (!currentSessionId || currentSessionId !== data.sessionId)) {
        setCurrentSessionId(data.sessionId);
      }
      fetchSessions();
    } catch (err: any) {
      if (err.name === "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: "🛑 *คุณได้กดยกเลิกการทำงานของคำถามนี้แล้ว*",
            timestamp: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        toast.error(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI");
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: `⚠️ เกิดข้อผิดพลาด: ${err.message || "ไม่สามารถเชื่อมต่อได้"}`,
            timestamp: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } finally {
      abortControllerRef.current = null;
      setIsSending(false);
    }
  };

  // Handle Send Chat (with automatic queuing when M1 is busy)
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : inputMessage;
    const currentAttachments = [...attachments];
    if (!textToSend.trim() && currentAttachments.length === 0) return;

    if (isSending) {
      // Add to Queue!
      const newQueueItem: QueuedMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        text: textToSend.trim(),
        attachments: currentAttachments,
        timestamp: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessageQueue((prev) => [...prev, newQueueItem]);
      setInputMessage("");
      setAttachments([]);
      toast.success("M1 กำลังประมวลผลอยู่ ได้นำคำถามเข้าคิวเรียบร้อย จะตอบให้อัตโนมัติ", { icon: "⏳" });
      return;
    }

    setInputMessage("");
    setAttachments([]);
    await executeSend(textToSend, currentAttachments);
  };

  // Process queued messages sequentially
  useEffect(() => {
    if (!isSending && messageQueue.length > 0) {
      const nextItem = messageQueue[0];
      setMessageQueue((prev) => prev.slice(1));
      executeSend(nextItem.text, nextItem.attachments);
    }
  }, [isSending, messageQueue]);

  // Handle Command Execution
  const handleExecuteCommand = async (targetToRun?: "aruba_core" | "server" | "cisco_b4", cmdToRun?: string) => {
    const target = targetToRun || selectedTarget;
    const command = cmdToRun || customCommand;

    if (!command.trim() || isExecutingCmd) return;

    setIsExecutingCmd(true);
    setCommandOutput(`กำลังส่งคำสั่งไปที่ [${target}] โปรดรอสักครู่...`);

    try {
      const res = await fetch("/api/super-admin/network-ai/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, command: command.trim() }),
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.output || "Execution failed");
      }

      setCommandOutput(data.output || "คำสั่งเสร็จสิ้น (ไม่มี Output ตอบกลับ)");
      toast.success(`รันคำสั่งบน ${data.target || target} สำเร็จ!`);
    } catch (err: any) {
      setCommandOutput(`❌ เกิดข้อผิดพลาด: ${err.message}`);
      toast.error(`รันคำสั่งล้มเหลว: ${err.message}`);
    } finally {
      setIsExecutingCmd(false);
    }
  };

  const handleCopyOutput = () => {
    if (!commandOutput) return;
    navigator.clipboard.writeText(commandOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("คัดลอกผลลัพธ์แล้ว");
  };

  if (status === "loading" || (session?.user as any)?.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500">กำลังตรวจสอบสิทธิ์ Super Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 py-6 space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Link href="/dashboard/super-admin" className="hover:text-blue-600 transition-colors">
              Super Admin
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-600 dark:text-amber-400">Server Room Agent M1</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/10">
              <Brain className="w-6 h-6" />
            </span>
            KTLTC Agent M1: Self-Learning AI Console
            <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold uppercase tracking-wider">
              Gold Edition
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>เครื่องเซิร์ฟเวอร์ ktltc-server • Ollama Model M1 Active</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              ความรู้ในสมอง M1: {knowledgeList.length} รายการ
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Model Selector Modal Trigger Button */}
          <button
            type="button"
            onClick={() => setIsModelModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 dark:hover:bg-amber-500/10 text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 hover:border-amber-500/40 transition-all cursor-pointer shadow-xs"
            title="คลิกเพื่อเลือกหรือสลับโมเดล AI (Modal)"
          >
            {engineMode === "gemini-3.6-flash" && <Zap className="w-3.5 h-3.5 text-amber-500" />}
            {engineMode === "gemini-3.7-flash" && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            {engineMode === "m1" && <Brain className="w-3.5 h-3.5 text-amber-500" />}
            <span>
              โมเดล: {engineMode === "gemini-3.6-flash" ? "Gemini 3.6 Flash" : engineMode === "gemini-3.7-flash" ? "Gemini 3.7 Pro (Thinking)" : "Agent M1 Local"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
          </button>

          <button
            onClick={fetchTelemetry}
            disabled={loadingDevices}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDevices ? "animate-spin" : ""}`} />
            <span>ตรวจสด ({lastTelemetryUpdate || "รอ..."})</span>
          </button>
          <div className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SUPER_ADMIN ONLY</span>
          </div>
        </div>
      </div>

      {/* Live Background Task Runner Banner (สไตล์ Antigravity) */}
      {activeTask && activeTask.status !== "idle" && (
        <div
          className={`rounded-2xl border transition-all overflow-hidden shadow-xl ${
            activeTask.status === "running"
              ? "bg-slate-900 border-amber-500/50 shadow-amber-500/10 ring-1 ring-amber-500/30"
              : activeTask.status === "success"
              ? "bg-slate-900 border-emerald-500/50 shadow-emerald-500/10 ring-1 ring-emerald-500/30"
              : "bg-slate-900 border-rose-500/50 shadow-rose-500/10 ring-1 ring-rose-500/30"
          }`}
        >
          {/* Top Bar */}
          <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap bg-slate-950/80 border-b border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              {activeTask.status === "running" ? (
                <div className="relative flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                </div>
              ) : activeTask.status === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {activeTask.status === "running" && (
                      <span className="px-2 py-0.5 text-[10px] rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30 animate-pulse">
                        ⚙️ 1 task running
                      </span>
                    )}
                    {activeTask.status === "success" && (
                      <span className="px-2 py-0.5 text-[10px] rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                        ✅ Task Completed
                      </span>
                    )}
                    {activeTask.status === "error" && (
                      <span className="px-2 py-0.5 text-[10px] rounded-md bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/30">
                        ❌ Task Failed
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 dark:text-emerald-300 font-medium truncate max-w-[280px] sm:max-w-xl">
                    {activeTask.command}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
                ⏱️ {activeTask.status === "running" ? `กำลังรัน... ${activeTask.durationSeconds}s` : `เสร็จสิ้นใน ${activeTask.durationSeconds}s`}
              </span>

              <button
                type="button"
                onClick={() => setShowTaskTerminal(!showTaskTerminal)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="แสดง/ซ่อน Terminal Output"
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>{showTaskTerminal ? "ซ่อน Console" : "ดู Console Log สด"}</span>
              </button>

              {activeTask.status !== "running" && (
                <button
                  type="button"
                  onClick={() => setActiveTask(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="ปิดแถบแจ้งเตือน"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Terminal Console Output */}
          {showTaskTerminal && (
            <div className="p-3.5 bg-slate-950 font-mono text-xs leading-relaxed max-h-56 overflow-y-auto space-y-1 text-slate-300 scrollbar-thin border-t border-slate-800/60">
              {activeTask.outputLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`break-all ${
                    log.includes("Error") || log.includes("❌") || log.includes("failed")
                      ? "text-rose-400 font-bold"
                      : log.includes("✓") || log.includes("✅") || log.includes("success") || log.includes("Successfully")
                      ? "text-emerald-400"
                      : log.includes("▲") || log.includes("Turbopack")
                      ? "text-cyan-400 font-bold"
                      : log.includes("PM2") || log.includes("reload")
                      ? "text-amber-300"
                      : "text-slate-400"
                  }`}
                >
                  {log}
                </div>
              ))}
              {activeTask.status === "running" && (
                <div className="flex items-center gap-2 text-amber-400 text-xs pt-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>กำลังคอมไพล์ Next.js Turbopack และรีโหลด PM2 Cluster...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Left (Live Runner & Devices) / Right (Chat & Brain Memory) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Command Runner & Device Matrix (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Interactive Live Command Terminal */}
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Live Command Runner (สั่งงานสด)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                SSH / Bash Ready
              </span>
            </div>

            {/* Target Selector */}
            <div className="flex gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => {
                  setSelectedTarget("aruba_core");
                  setCustomCommand("show interface 1/1/5 brief");
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  selectedTarget === "aruba_core"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Aruba Core
              </button>
              <button
                onClick={() => {
                  setSelectedTarget("server");
                  setCustomCommand("pm2 list");
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  selectedTarget === "server"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Server นี้
              </button>
              <button
                onClick={() => {
                  setSelectedTarget("cisco_b4");
                  setCustomCommand("show interface status");
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  selectedTarget === "cisco_b4"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Cisco อาคาร 4
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COMMANDS[selectedTarget]?.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCustomCommand(preset.cmd);
                    handleExecuteCommand(selectedTarget, preset.cmd);
                  }}
                  disabled={isExecutingCmd}
                  className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            {/* Command Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                placeholder="พิมพ์คำสั่ง CLI ที่ต้องการรัน..."
                className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl font-mono text-emerald-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleExecuteCommand();
                  }
                }}
              />
              <button
                onClick={() => handleExecuteCommand()}
                disabled={isExecutingCmd || !customCommand.trim()}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {isExecutingCmd ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>รัน</span>
              </button>
            </div>

            {/* Output Screen */}
            <div className="relative">
              <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/90 px-3 py-1.5 rounded-t-xl border border-b-0 border-slate-800">
                <span>TERMINAL OUTPUT ({selectedTarget})</span>
                {commandOutput && (
                  <button
                    onClick={handleCopyOutput}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "คัดลอกแล้ว" : "คัดลอก"}</span>
                  </button>
                )}
              </div>
              <pre className="p-3 bg-black/90 text-slate-100 font-mono text-[11px] leading-relaxed rounded-b-xl border border-slate-800 overflow-x-auto max-h-52 min-h-[110px] whitespace-pre-wrap select-text">
                {commandOutput || "# ผลลัพธ์จากการรันคำสั่งสดจะแสดงที่นี่..."}
              </pre>
            </div>
          </div>

          {/* Live Device Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  สถานะอุปกรณ์และวงจรทั้งวิทยาลัย ({devices.length} จุด)
                </h2>
                <div className="flex items-center gap-2 mt-1 text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ออนไลน์: {devices.filter((d) => d.status === "ONLINE").length}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    ออฟไลน์: {devices.filter((d) => d.status === "OFFLINE").length}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                Live ICMP Ping
              </span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {devices.map((d) => (
                <div
                  key={d.id}
                  className={`p-2.5 rounded-xl border transition-all ${
                    d.status === "ONLINE"
                      ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                      : "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            d.status === "ONLINE" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                          }`}
                        />
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {d.name}
                        </h3>
                        {d.corePort && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            Port {d.corePort}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {d.location} • <span className="font-mono">{d.ip}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          d.status === "ONLINE"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fullscreen Chat Backdrop - High z-index to overlay above Navbar (z-9999) */}
        {isFullscreenChat && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99998] transition-opacity"
            onClick={() => setIsFullscreenChat(false)}
          />
        )}

        {/* Right Column / Fullscreen Modal: AI Console & Long-Term Memory */}
        <div
          className={`flex flex-col bg-[#0f0f14] border border-[#23232f] rounded-2xl shadow-2xl overflow-hidden transition-all text-slate-100 ${
            isFullscreenChat
              ? "fixed inset-2 sm:inset-4 md:inset-6 z-[99999] shadow-2xl h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-2rem)] md:h-[calc(100dvh-3rem)]"
              : "lg:col-span-7 h-[calc(100dvh-12rem)] min-h-[460px] max-h-[820px]"
          }`}
        >
          {/* Antigravity Breadcrumbs & Header Bar */}
          <div className="px-4 py-2.5 bg-[#14141b] border-b border-[#23232f] flex items-center justify-between gap-2 flex-wrap shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {activeTab === "chat" && (
                <button
                  type="button"
                  onClick={() => setIsSessionsDrawerOpen(!isSessionsDrawerOpen)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title={isSessionsDrawerOpen ? "ซ่อนประวัติห้องแชต" : "แสดงประวัติห้องแชต"}
                >
                  {isSessionsDrawerOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                </button>
              )}

              {/* Breadcrumb Path */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                <span className="opacity-60">Desktop</span>
                <span className="opacity-40">/</span>
                <span className="text-slate-200 font-medium truncate max-w-[160px] sm:max-w-xs">
                  {currentSessionTitle || "ทักทายการเริ่มต้นสนทนา"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Selector: Chat vs Knowledge */}
              <div className="flex items-center bg-[#1c1c26] p-0.5 rounded-xl border border-white/5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === "chat"
                      ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  แชต
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("knowledge");
                    fetchKnowledge();
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === "knowledge"
                      ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  สมอง ({knowledgeList.length})
                </button>
              </div>

              {/* New Chat Button */}
              <button
                type="button"
                onClick={handleCreateNewSession}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="สร้างห้องแชตใหม่"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Fullscreen Modal Toggle Button */}
              <button
                type="button"
                onClick={() => setIsFullscreenChat(!isFullscreenChat)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title={isFullscreenChat ? "ย่อขนาดกลับ" : "ขยายเต็มจอ"}
              >
                {isFullscreenChat ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {activeTab === "chat" ? (
            <>
              {/* Quick Prompt Chips (แสดงเฉพาะตอนห้องสนทนาใหม่เพื่อไม่ให้บังแชตบนมือถือ) */}
              {messages.length === 0 && (
                <div className="p-2.5 border-b border-white/5 bg-[#14141b] flex gap-2 overflow-x-auto scrollbar-none shrink-0">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isSending}
                      className="shrink-0 px-2.5 py-1 text-[11px] bg-[#1a1a24] hover:bg-[#252533] border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="truncate max-w-[240px]">{prompt}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Body: Gemini Left Navbar + Chat Messages Area */}
              <div className="flex-1 flex overflow-hidden min-h-0 relative">
                {/* Gemini-style Collapsible Left Navbar */}
                <div
                  className={`border-r border-slate-200 dark:border-amber-500/20 bg-slate-50/90 dark:bg-slate-950/95 flex flex-col shrink-0 h-full overflow-hidden transition-all duration-300 ease-in-out z-20 ${
                    isSessionsDrawerOpen ? "w-64 sm:w-72" : "w-0 p-0 border-r-0"
                  }`}
                >
                  <div className="p-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <History className="w-4 h-4 text-amber-500" />
                      <span>ประวัติการสนทนา</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSessionsDrawerOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800"
                      title="ซ่อนแถบข้าง (Collapse)"
                    >
                      <PanelLeftClose className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-2.5 border-b border-slate-200/60 dark:border-slate-800/60">
                    <button
                      type="button"
                      onClick={handleCreateNewSession}
                      className="w-full px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ เริ่มต้นบทสนทนาใหม่</span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>ประวัติล่าสุด</span>
                      <span>{sessionsList.length}</span>
                    </div>
                    {sessionsList.length === 0 ? (
                      <div className="text-center text-xs text-slate-400 py-10 space-y-2">
                        <MessageSquare className="w-6 h-6 mx-auto opacity-30 text-amber-500" />
                        <p>ยังไม่มีประวัติการคุย</p>
                      </div>
                    ) : (
                      sessionsList.map((s) => (
                        <div
                          key={s.sessionId}
                          onClick={() => handleSelectSession(s.sessionId)}
                          className={`group p-2.5 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-between gap-2 border ${
                            s.sessionId === currentSessionId
                              ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold shadow-2xs"
                              : "bg-white/60 dark:bg-slate-900/60 border-slate-200/70 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-amber-500/30 hover:bg-white dark:hover:bg-slate-900"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className={`w-3 h-3 shrink-0 ${s.sessionId === currentSessionId ? "text-amber-500" : "text-slate-400 group-hover:text-amber-500"}`} />
                              <p className="truncate text-xs font-medium">{s.title || "บทสนทนา"}</p>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5 pl-4.5">{s.lastMessage || "..."}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSession(s.sessionId, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all shrink-0 cursor-pointer"
                            title="ลบห้องนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Chat Messages */}
                <div
                  ref={chatMessagesContainerRef}
                  className="flex-1 p-4 overflow-y-auto space-y-4"
                >
                  {/* Antigravity Persistent Live Task Runner Banner inside Chat */}
                  {activeTask && activeTask.status !== "idle" && (
                    <div
                      className={`p-3 rounded-xl border transition-all text-xs space-y-2 shadow-lg animate-in fade-in ${
                        activeTask.status === "running"
                          ? "bg-[#181822] border-amber-500/50 shadow-amber-500/5 ring-1 ring-amber-500/20"
                          : activeTask.status === "success"
                          ? "bg-[#181822] border-emerald-500/50 shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                          : "bg-[#181822] border-rose-500/50 shadow-rose-500/5 ring-1 ring-rose-500/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          {activeTask.status === "running" ? (
                            <span className="relative flex h-2.5 w-2.5 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                            </span>
                          ) : activeTask.status === "success" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span className="font-bold text-white">
                            {activeTask.status === "running"
                              ? `⚙️ กำลังประมวลผลคำสั่ง (${activeTask.durationSeconds}s)`
                              : activeTask.status === "success"
                              ? `✅ Task Completed (${activeTask.durationSeconds}s)`
                              : `❌ Task Failed`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowTaskTerminal(!showTaskTerminal)}
                            className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Terminal className="w-3 h-3 text-amber-400" />
                            <span>{showTaskTerminal ? "ซ่อน Console" : "ดู Console Log สด"}</span>
                          </button>
                          {activeTask.status !== "running" && (
                            <button
                              type="button"
                              onClick={() => setActiveTask(null)}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title="ปิดการแจ้งเตือน"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Step Message */}
                      <div className="text-[11px] text-slate-300 font-mono flex items-center justify-between gap-2 flex-wrap">
                        <span>{activeTask.stepMessage || activeTask.command}</span>
                        {activeTask.status === "success" && (
                          <a
                            href="/test"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <span>เปิดหน้าเว็บจริง</span>
                            <Globe className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* Terminal Console Output inside Chat */}
                      {showTaskTerminal && activeTask.outputLogs && activeTask.outputLogs.length > 0 && (
                        <div className="p-2.5 bg-black/80 rounded-lg font-mono text-[10px] leading-relaxed max-h-44 overflow-y-auto space-y-1 text-slate-300 border border-white/5 scrollbar-thin">
                          {activeTask.outputLogs.map((log, lIdx) => (
                            <div
                              key={lIdx}
                              className={`break-all ${
                                log.includes("Error") || log.includes("❌") || log.includes("failed")
                                  ? "text-rose-400 font-bold"
                                  : log.includes("✓") || log.includes("✅") || log.includes("success") || log.includes("Successfully")
                                  ? "text-emerald-400"
                                  : log.includes("PM2") || log.includes("reload")
                                  ? "text-amber-300"
                                  : "text-slate-400"
                              }`}
                            >
                              {log}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col gap-2 ${m.role === "user" ? "items-end" : "items-start"}`}
                  >
                    {m.role === "user" ? (
                      /* User Message Card (Antigravity Style) */
                      <div className="w-full flex flex-col items-end gap-1.5">
                        <div className="bg-[#1e1e26] text-slate-100 border border-white/5 rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[95%] sm:max-w-[85%] shadow-md whitespace-pre-wrap break-words">
                          {m.attachments && m.attachments.length > 0 && (
                            <div className="mb-2.5 flex flex-wrap gap-2">
                              {m.attachments.map((att, attIdx) => (
                                <div key={attIdx} className="rounded-xl overflow-hidden">
                                  {att.type.startsWith("image/") && att.base64 ? (
                                    <div
                                      onClick={() => setPreviewImageModal(att.base64!)}
                                      className="relative group cursor-pointer overflow-hidden rounded-xl border border-white/10"
                                    >
                                      <img
                                        src={att.base64}
                                        alt={att.name}
                                        className="max-w-[220px] max-h-[160px] object-cover rounded-xl transition-transform group-hover:scale-105"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-lg text-[11px] font-mono">
                                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                                      <span className="truncate max-w-[140px]">{att.name}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          <div>{m.content}</div>
                        </div>

                        {/* Under-bubble Action Bar for User questions */}
                        <div className="flex items-center gap-1.5 pr-1">
                          <button
                            type="button"
                            onClick={() => {
                              handleSendMessage(m.content);
                              toast.success(isSending ? "เพิ่มคำถามนี้เข้าคิวแล้ว..." : "กำลังถามคำถามนี้ซ้ำ...");
                            }}
                            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 transition-all flex items-center gap-1 text-[10px] font-medium shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
                            title="กดเพื่อถามคำถามนี้ซ้ำ"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>ถามซ้ำ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInputMessage(m.content);
                              chatInputRef.current?.focus();
                              toast("คัดลอกคำถามลงช่องพิมพ์แล้ว สามารถแก้ไขแล้วส่งได้ทันที", { icon: "📝" });
                            }}
                            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 transition-all flex items-center gap-1 text-[10px] font-medium shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
                            title="คัดลอกลงช่องพิมพ์เพื่อแก้ไข"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            <span>แก้ไข/คัดลอก</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* AI Model Response (Antigravity Style) */
                      <div className="w-full space-y-2.5">
                        {/* Antigravity Agent Action Trace (Worked for 1m ˅) */}
                        {m.duration && (
                          <div className="space-y-1.5 font-mono text-[11px]">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedSteps((prev) => ({
                                  ...prev,
                                  [idx]: prev[idx] !== undefined ? !prev[idx] : false,
                                }))
                              }
                              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors py-0.5 cursor-pointer font-medium select-none"
                            >
                              <span>{m.duration}</span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform ${
                                  expandedSteps[idx] === false ? "-rotate-90" : ""
                                }`}
                              />
                            </button>

                            {expandedSteps[idx] !== false && m.actionSteps && m.actionSteps.length > 0 && (
                              <div className="pl-3 border-l border-slate-700/60 space-y-1.5 my-1.5">
                                {m.actionSteps.map((step, sIdx) => (
                                  <div key={sIdx} className="flex items-center gap-2 text-slate-300">
                                    {step.type === "explore" && (
                                      <div className="flex items-center gap-1 text-slate-400">
                                        <span>{step.title}</span>
                                        <span className="text-slate-500">&rsaquo;</span>
                                      </div>
                                    )}
                                    {step.type === "edit" && (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-slate-400">Edited</span>
                                        <span className="text-cyan-400 font-medium">⚛️ {step.title}</span>
                                        {step.diff && (
                                          <>
                                            <span className="text-emerald-400 font-bold">+{step.diff.add}</span>
                                            <span className="text-rose-400 font-bold">-{step.diff.del}</span>
                                          </>
                                        )}
                                      </div>
                                    )}
                                    {step.type === "command" && (
                                      <div className="flex items-center gap-1 text-slate-300 flex-wrap">
                                        <span className="text-slate-400">Ran</span>
                                        <span className="font-mono text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/40 text-[10px]">
                                          {step.title}
                                        </span>
                                        <span className="text-slate-500">&rsaquo;</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Markdown Response Content */}
                        <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-1.5 break-words prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-100 prose-pre:bg-black/90 prose-pre:border prose-pre:border-slate-800 prose-pre:text-slate-100 prose-pre:overflow-x-auto prose-code:text-amber-400 prose-code:bg-amber-950/40 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[11px] prose-strong:font-bold prose-strong:text-amber-400 prose-ul:my-1 prose-li:my-0.5">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {m.content}
                          </ReactMarkdown>
                        </div>

                        {/* Live Web Sources Citation */}
                        {m.webSources && m.webSources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="font-bold text-slate-400 flex items-center gap-1">
                              <Globe className="w-3 h-3 text-blue-400" />
                              แหล่งข้อมูลจากอินเทอร์เน็ตสด:
                            </span>
                            {m.webSources.map((s, sIdx) => (
                              <a
                                key={sIdx}
                                href={s.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 bg-blue-500/10 text-blue-300 hover:underline rounded border border-blue-500/20 truncate max-w-[220px]"
                                title={s.title}
                              >
                                {s.title}
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Code Proposal Card */}
                        {m.codeProposal && (
                          <div className="mt-3 p-3 bg-slate-900 border border-amber-500/40 rounded-xl text-slate-100 shadow-md">
                            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center">
                                  <FileCode className="w-3 h-3" />
                                </div>
                                <span className="text-[11px] font-bold text-white">ข้อเสนอแก้ไขหน้าเว็บ</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-mono">
                                  {m.codeProposal.filePath}
                                </span>
                              </div>
                              {m.codeProposal.applied && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 font-bold">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> บันทึกแล้ว
                                </span>
                              )}
                              {m.codeProposal.rejected && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                  ยกเลิกแล้ว
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                              {m.codeProposal.description}
                            </p>

                            {/* Toggle Code Preview */}
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => setPreviewCodeIndex(previewCodeIndex === idx ? null : idx)}
                                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
                              >
                                {previewCodeIndex === idx ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                <span>{previewCodeIndex === idx ? "ซ่อนดูโค้ด" : "คลิกดูตัวอย่างโค้ดที่ M1 เขียน"}</span>
                              </button>

                              {previewCodeIndex === idx && (
                                <div className="mt-2 p-2.5 bg-black/90 rounded-lg text-[10px] font-mono max-h-52 overflow-y-auto overflow-x-auto border border-slate-800 leading-relaxed select-text">
                                  {m.codeProposal.action === "patch" ? (
                                    <div className="space-y-2">
                                      <div>
                                        <div className="text-rose-400 font-bold mb-0.5 flex items-center gap-1">
                                          <span>- ข้อความเดิมที่จะแทนที่ (Target):</span>
                                        </div>
                                        <pre className="p-2 bg-rose-950/40 text-rose-300 rounded border border-rose-900/60 whitespace-pre-wrap break-all">
                                          {m.codeProposal.target}
                                        </pre>
                                      </div>
                                      <div>
                                        <div className="text-emerald-400 font-bold mb-0.5 flex items-center gap-1">
                                          <span>+ ข้อความใหม่ (Replacement):</span>
                                        </div>
                                        <pre className="p-2 bg-emerald-950/40 text-emerald-300 rounded border border-emerald-900/60 whitespace-pre-wrap break-all">
                                          {m.codeProposal.replacement}
                                        </pre>
                                      </div>
                                    </div>
                                  ) : (
                                    <pre className="text-emerald-400 whitespace-pre-wrap break-all">
                                      {m.codeProposal.code}
                                    </pre>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            {!m.codeProposal.rejected && (
                              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                                {!m.codeProposal.applied ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleApplyCode(idx, m.codeProposal!, false)}
                                      disabled={applyingCode}
                                      className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
                                    >
                                      {applyingCode ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                      <span>อนุมัติและบันทึกไฟล์</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleApplyCode(idx, m.codeProposal!, true)}
                                      disabled={applyingCode || rebuildingCode}
                                      className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
                                    >
                                      <Zap className="w-3 h-3 text-amber-300" />
                                      <span>อนุมัติ บันทึก + Rebuild ทันที</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectCode(idx)}
                                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[11px] transition-colors cursor-pointer"
                                    >
                                      ยกเลิก
                                    </button>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2 flex-wrap w-full">
                                    {m.codeProposal.hasBackup && (
                                      <button
                                        type="button"
                                        onClick={() => handleRollbackCode(idx, m.codeProposal!.filePath)}
                                        disabled={rebuildingCode || activeTask?.status === "running"}
                                        className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>ย้อนกลับ (Rollback ไฟล์เดิม)</span>
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={handleTriggerRebuild}
                                      disabled={rebuildingCode || activeTask?.status === "running"}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
                                    >
                                      {rebuildingCode || activeTask?.status === "running" ? (
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Play className="w-3 h-3" />
                                      )}
                                      <span>
                                        {rebuildingCode || activeTask?.status === "running"
                                          ? `กำลังประมวลผล (${activeTask?.durationSeconds || 0}s)...`
                                          : "Rebuild & PM2 Reload"}
                                      </span>
                                    </button>

                                    {/* Direct link to live page */}
                                    <a
                                      href={m.codeProposal.filePath.replace("src/app/(website)", "").replace("/page.tsx", "") || "/"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                      title="คลิกเพื่อเปิดดูหน้าเว็บจริงทันที"
                                    >
                                      <Globe className="w-3 h-3 text-blue-400" />
                                      <span>เปิดหน้าเว็บจริง ↗</span>
                                    </a>

                                    {/* Live Step Status Message inside Card */}
                                    {(rebuildingCode || (activeTask && activeTask.status === "running")) && (
                                      <div className="w-full text-[11px] text-amber-300/90 font-mono bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 space-y-1.5 mt-2 animate-in fade-in">
                                        <div className="flex items-center justify-between">
                                          <span className="flex items-center gap-1.5 font-bold text-amber-300">
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
                                            {activeTask?.stepMessage || "กำลังเริ่มต้น Rebuild & PM2 Reload..."}
                                          </span>
                                          <span className="font-mono bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px] text-amber-200">
                                            {activeTask?.durationSeconds || 0}s
                                          </span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                                          <div
                                            className={`h-full bg-amber-400 transition-all duration-300 ${
                                              activeTask?.step === "reloading" ? "w-4/5" : "w-2/5 animate-pulse"
                                            }`}
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* Live Success Banner inside Card */}
                                    {activeTask && activeTask.status === "success" && (
                                      <div className="w-full text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 space-y-1 mt-2 animate-in fade-in">
                                        <div className="flex items-center justify-between">
                                          <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                            Rebuild สำเร็จสมบูรณ์! ({activeTask.durationSeconds}s)
                                          </span>
                                          <a
                                            href={m.codeProposal.filePath.replace("src/app/(website)", "").replace("/page.tsx", "") || "/"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold inline-flex items-center gap-1 shadow-sm"
                                          >
                                            <Globe className="w-3 h-3" />
                                            <span>เปิดหน้าเว็บจริง ↗</span>
                                          </a>
                                        </div>
                                        <p className="text-[10px] text-emerald-200/70">
                                          อัปเดตเซิร์ฟเวอร์เรียบร้อยแล้ว หน้าเว็บแสดงผลโค้ดเวอร์ชันใหม่ทันที
                                        </p>
                                      </div>
                                    )}

                                    {/* Live Error Banner inside Card */}
                                    {activeTask && activeTask.status === "error" && (
                                      <div className="w-full text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5 space-y-1.5 mt-2 animate-in fade-in">
                                        <div className="flex items-center justify-between">
                                          <span className="flex items-center gap-1.5 font-bold text-rose-300">
                                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                            {activeTask.stepMessage || "การ Rebuild ไม่สำเร็จ"}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={handleTriggerRebuild}
                                            className="px-2 py-0.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 rounded text-[10px] font-bold cursor-pointer"
                                          >
                                            ลองใหม่อีกครั้ง
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Model & Timestamp Footer */}
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                          <span>{m.modelUsed || "Agent M1"}</span>
                          <span>•</span>
                          <span>{m.timestamp}</span>
                        </div>
                      </div>
                    )}

                    {/* Auto Learning Alert if M1 learned something from this message */}
                    {m.learnedAlert && (
                      <div className="mx-9 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] rounded-xl flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{m.learnedAlert}</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Antigravity Working / Thinking Active Indicator */}
                {isSending && (
                  <div className="flex flex-col gap-2 animate-in fade-in duration-200">
                    <div className="inline-flex items-center gap-2 text-xs text-slate-400 font-medium py-0.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      <span>Working... ({thinkingElapsed}s)</span>
                    </div>
                    <div className="bg-[#181822]/90 border border-white/5 rounded-xl p-3 text-xs text-slate-300 font-mono space-y-1.5 max-w-xl shadow-lg">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-slate-300">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />
                          <span>M1 is analyzing codebase & generating response...</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAbortRequest}
                          className="px-2 py-0.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                          title="Cancel generation"
                        >
                          <Square className="w-2.5 h-2.5 fill-current" />
                          <span>Stop</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Antigravity Floating Input Bar Area */}
            <div className="p-3 sm:p-4 pb-6 sm:pb-4 bg-[#0f0f14] border-t border-white/5 shrink-0">
              <div className="max-w-4xl mx-auto space-y-2">
                {/* Mobile-Friendly Pinned Task Bar (Always visible at bottom above input) */}
                {(rebuildingCode || (activeTask && activeTask.status === "running")) && (
                  <div className="px-3 py-2 bg-[#1c160c] border border-amber-500/40 rounded-xl flex items-center justify-between gap-2 text-xs shadow-lg animate-in fade-in">
                    <div className="flex items-center gap-2 min-w-0">
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-amber-300 truncate text-[11px]">
                          ⚙️ กำลัง Rebuild & PM2 Reload ({activeTask?.durationSeconds || 0}s)
                        </p>
                        <p className="text-[10px] text-amber-200/70 truncate">
                          {activeTask?.stepMessage || "กำลังคอมไพล์ Next.js Turbopack..."}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTaskTerminal(true)}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Terminal className="w-3 h-3" />
                      <span>Console Logs</span>
                    </button>
                  </div>
                )}

                {/* Mobile-Friendly Pinned Success Alert */}
                {activeTask && activeTask.status === "success" && !rebuildingCode && (
                  <div className="px-3 py-2 bg-emerald-950/50 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-2 text-xs shadow-lg animate-in fade-in">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-bold text-emerald-300 truncate text-[11px]">
                        ✅ Rebuild สำเร็จ ({activeTask.durationSeconds}s)! หน้าเว็บอัปเดตแล้ว
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href="/test"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Globe className="w-3 h-3" />
                        <span>เปิดหน้าเว็บ ↗</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setActiveTask(null)}
                        className="w-5 h-5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                        title="ปิดการแจ้งเตือน"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile-Friendly Pinned Error Alert */}
                {activeTask && activeTask.status === "error" && !rebuildingCode && (
                  <div className="px-3 py-2 bg-rose-950/50 border border-rose-500/40 rounded-xl flex items-center justify-between gap-2 text-xs shadow-lg animate-in fade-in">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="font-bold text-rose-300 truncate text-[11px]">
                        {activeTask.stepMessage || "❌ การ Rebuild ล้มเหลว"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleTriggerRebuild}
                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold cursor-pointer"
                      >
                        ลองใหม่
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTaskTerminal(true)}
                        className="px-2 py-0.5 bg-rose-500/20 text-rose-200 border border-rose-500/30 rounded text-[10px] font-bold cursor-pointer"
                      >
                        Logs
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTask(null)}
                        className="w-5 h-5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Queue Tray (คิวคำถามรอส่ง) */}
                {messageQueue.length > 0 && (
                  <div className="px-3 py-2 bg-[#1a1a24] border border-amber-500/30 rounded-xl flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-bold text-amber-300 shrink-0">
                        คิวคำถาม ({messageQueue.length}):
                      </span>
                      <span className="truncate text-slate-300 font-medium max-w-[220px] sm:max-w-md">
                        "{messageQueue[0].text}"
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveFromQueue(messageQueue[0].id)}
                        className="px-2 py-0.5 text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="ยกเลิกคำถามนี้ในคิว"
                      >
                        <X className="w-3 h-3" />
                        <span>ยกเลิก</span>
                      </button>
                      {messageQueue.length > 1 && (
                        <button
                          type="button"
                          onClick={handleClearQueue}
                          className="px-2 py-0.5 text-slate-400 hover:text-slate-200 text-[10px] hover:underline cursor-pointer"
                        >
                          ล้างทั้งหมด
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Unified Antigravity Input Card */}
                <div className="bg-[#181822] border border-[#2d2d3c] hover:border-[#3d3d52] focus-within:border-slate-500/60 rounded-2xl p-3 shadow-xl transition-all">
                  {/* Pre-send Attachment Tray */}
                  {attachments.length > 0 && (
                    <div className="mb-2.5 p-2 bg-[#12121a] rounded-xl border border-white/5 flex flex-wrap gap-2 items-center">
                      {attachments.map((att) => (
                        <div
                          key={att.id}
                          className="relative group flex items-center gap-2 p-1.5 bg-[#1a1a26] border border-white/10 rounded-lg text-xs"
                        >
                          {att.type.startsWith("image/") && att.base64 ? (
                            <img
                              src={att.base64}
                              alt={att.name}
                              className="w-9 h-9 object-cover rounded-md border border-white/10 cursor-pointer"
                              onClick={() => setPreviewImageModal(att.base64!)}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="max-w-[130px] truncate text-[11px]">
                            <p className="font-medium text-slate-200 truncate">{att.name}</p>
                            <p className="text-[9px] text-slate-400">
                              {(att.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(att.id)}
                            className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors ml-0.5 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hidden File & Camera Inputs */}
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) processFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) processFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.txt,.log,.conf,.cfg,.json,.csv,.md,text/*,application/pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) processFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />

                  {/* Multiline Antigravity Textarea */}
                  <textarea
                    ref={chatInputRef}
                    rows={2}
                    placeholder={
                      isSending
                        ? "M1 กำลังประมวลผลคำตอบ... พิมพ์ข้อความแล้วกด Enter เพื่อส่งเข้า 'คิว' ได้ทันที"
                        : "Ask anything, @ to mention, / for actions"
                    }
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    onPaste={handlePaste}
                    className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-xs sm:text-sm resize-none focus:outline-hidden focus:ring-0 leading-relaxed max-h-36 block"
                  />

                  {/* Bottom Toolbar inside card: (+) Attachment, Model Selector Pill, Stop / Send Arrow */}
                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      {/* (+) Attachment button */}
                      <button
                        type="button"
                        onClick={() => setIsAttachModalOpen(true)}
                        className="w-7 h-7 rounded-full bg-[#242432] hover:bg-[#2f2f42] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="แนบรูปภาพ ถ่ายภาพ หรือเอกสาร"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      {/* Model Selector Pill */}
                      <button
                        type="button"
                        onClick={() => setIsModelModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-[#242432] hover:bg-[#2f2f42] text-slate-200 hover:text-white rounded-full text-xs font-medium border border-white/5 transition-colors cursor-pointer shadow-xs"
                        title="คลิกเพื่อเลือกเปลี่ยนโมเดล"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span className="truncate max-w-[120px] sm:max-w-[200px]">
                          {engineMode === "gemini-3.6-flash"
                            ? "Gemini 3.8 Flash"
                            : engineMode === "gemini-3.7-flash"
                            ? "Gemini 3.7 Pro"
                            : "Agent M1 Pro"}
                        </span>
                        <ChevronDown className="w-3 h-3 text-slate-400 opacity-70 ml-0.5" />
                      </button>
                    </div>

                    {/* Right Actions: Stop Generation / Send or Queue */}
                    <div className="flex items-center gap-2">
                      {isSending && (
                        <button
                          type="button"
                          onClick={handleAbortRequest}
                          className="w-7 h-7 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                          title="หยุดการสร้างคำตอบ"
                        >
                          <Square className="w-3 h-3 fill-current" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSendMessage()}
                        disabled={!inputMessage.trim() && attachments.length === 0}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed ${
                          isSending
                            ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                            : "bg-white hover:bg-slate-200 text-black shadow-md"
                        }`}
                        title={isSending ? "เพิ่มคำถามเข้าคิว (Queue)" : "ส่งข้อความ (Enter)"}
                      >
                        {isSending ? (
                          <ListPlus className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
          ) : (
            /* Knowledge Base & Memory Manager Tab */
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {/* Add New Knowledge Box */}
              <form
                onSubmit={handleAddKnowledge}
                className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2.5"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <Plus className="w-4 h-4" />
                  <span>สอนความรู้ใหม่ / กฎใหม่ให้ Agent M1 โดยตรง</span>
                </div>
                <input
                  type="text"
                  placeholder="หัวข้อความรู้ (เช่น รหัสผ่านสวิตช์ใหม่, แผนผังพอร์ตช่างเชื่อม)"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
                <textarea
                  rows={2}
                  placeholder="รายละเอียดข้อเท็จจริงที่ต้องการให้ M1 จดจำตลอดไป..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white resize-none"
                />
                <button
                  type="submit"
                  disabled={isSavingKnowledge || !newTopic.trim() || !newContent.trim()}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>{isSavingKnowledge ? "กำลังบันทึก..." : "บันทึกลงสมอง M1"}</span>
                </button>
              </form>

              {/* Knowledge Items List */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>ความจำระยะยาวในสมอง M1 (Long-Term Memories)</span>
                </h3>

                {knowledgeList.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{item.topic}</span>
                      </h4>
                      <button
                        onClick={() => handleDeleteKnowledge(item._id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                        title="ลบความรู้นี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.content}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <span>ที่มา: {item.source}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString("th-TH")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 1. Attachment Selector Modal */}
      {isAttachModalOpen && (
        <div className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-amber-500" />
                <span>แนบไฟล์และมัลติมีเดียให้ M1</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAttachModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              ส่งภาพถ่ายอุปกรณ์ สวิตช์ สายไฟเบอร์ หรือไฟล์ Config เพื่อให้ M1 ประมวลผลด้วย Vision AI
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Option 1: Live Camera */}
              <button
                type="button"
                onClick={startCamera}
                className="p-3 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-center gap-3 transition-all cursor-pointer text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    ถ่ายภาพสดจากกล้อง (Camera)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    เปิดกล้องถ่ายตู้ Rack, หัวต่อไฟเบอร์, หรือสวิตช์
                  </div>
                </div>
              </button>

              {/* Option 2: Image File */}
              <button
                type="button"
                onClick={() => {
                  setIsAttachModalOpen(false);
                  imageInputRef.current?.click();
                }}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-3 transition-all cursor-pointer text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    เลือกรูปภาพจากเครื่อง (Images)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    PNG, JPG, WEBP, ภาพแคปหน้าจอ
                  </div>
                </div>
              </button>

              {/* Option 3: Document/Log File */}
              <button
                type="button"
                onClick={() => {
                  setIsAttachModalOpen(false);
                  fileInputRef.current?.click();
                }}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-3 transition-all cursor-pointer text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    แนบไฟล์เอกสาร / Config / Logs
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    .txt, .log, .conf, .json, .csv, .pdf
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-1 text-center text-[10px] text-slate-400">
              💡 ทริก: สามารถกด <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 font-mono">Ctrl+V</kbd> เพื่อวางภาพหน้าจอได้ทันที
            </div>
          </div>
        </div>
      )}

      {/* 2. Live Camera Viewfinder Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 max-w-lg w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-white text-xs font-bold">
                <Camera className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>ช่องมองภาพกล้องสด (Camera Viewfinder)</span>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video sm:aspect-4/3 bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-3 flex items-center justify-center pointer-events-none">
                <span className="text-[10px] bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full">
                  จัดอุปกรณ์ให้อยู่ในกรอบภาพเพื่อความคมชัด
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>กดถ่ายภาพนี้</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Image Lightbox Modal */}
      {previewImageModal && (
        <div
          onClick={() => setPreviewImageModal(null)}
          className="fixed inset-0 z-[100001] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewImageModal(null)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageModal}
              alt="Preview Full"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* 4. AI Model Selection Modal */}
      {isModelModalOpen && (
        <div
          className="fixed inset-0 z-[100000] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsModelModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-amber-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>เลือกโมเดลปัญญาประดิษฐ์ AI</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 font-mono">
                      Super Admin
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    สลับเครื่องยนต์สมอง AI เพื่อการวิเคราะห์ระบบที่แม่นยำที่สุด
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Model 1: Gemini 3.6 Flash */}
              <button
                type="button"
                onClick={() => {
                  setEngineMode("gemini-3.6-flash");
                  setIsModelModalOpen(false);
                  toast.success("สลับใช้โมเดล Google AI (Gemini 3.6 Flash)");
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 group ${
                  engineMode === "gemini-3.6-flash"
                    ? "bg-amber-500/10 border-amber-500/70 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30"
                    : "bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-amber-500/40 hover:bg-amber-50/30 dark:hover:bg-amber-950/20"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                    engineMode === "gemini-3.6-flash"
                      ? "bg-gradient-to-br from-amber-500 to-yellow-500 text-slate-950 font-bold"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Gemini 3.6 Flash</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Google AI)</span>
                    </span>
                    {engineMode === "gemini-3.6-flash" ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/50 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> กำลังใช้งาน
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 group-hover:text-amber-500 transition-colors">
                        คลิกเพื่อเลือก
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    ความเร็วสูง โควต้าฟรี 1,000,000 Tokens เหมาะสำหรับสนทนา ถามตอบปัญหา และตรวจเครือข่ายทั่วไป
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                      Google Cloud
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                      ตอบไวมาก (Ultra-Fast)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      1M Context
                    </span>
                  </div>
                </div>
              </button>

              {/* Model 2: Gemini 3.7 Pro Thinking */}
              <button
                type="button"
                onClick={() => {
                  setEngineMode("gemini-3.7-flash");
                  setIsModelModalOpen(false);
                  toast.success("สลับใช้โมเดล Google AI Pro (Gemini 3.7 Thinking)");
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 group ${
                  engineMode === "gemini-3.7-flash"
                    ? "bg-amber-500/10 border-amber-500/70 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30"
                    : "bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-amber-500/40 hover:bg-amber-50/30 dark:hover:bg-amber-950/20"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                    engineMode === "gemini-3.7-flash"
                      ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Gemini 3.7 Pro</span>
                      <span className="text-[10px] text-amber-500 font-semibold">(Thinking Engine)</span>
                    </span>
                    {engineMode === "gemini-3.7-flash" ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/50 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> กำลังใช้งาน
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 group-hover:text-amber-500 transition-colors">
                        คลิกเพื่อเลือก
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    ระบบคิดวิเคราะห์อย่างมีเหตุผล (Chain-of-Thought) สำหรับวางสถาปัตยกรรมระบบ และงานวิศวกรรมไอทีขั้นสูง
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">
                      Thinking Engine
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
                      คิดวิเคราะห์เชิงลึก
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      1M Context
                    </span>
                  </div>
                </div>
              </button>

              {/* Model 3: Agent M1 Local */}
              <button
                type="button"
                onClick={() => {
                  setEngineMode("m1");
                  setIsModelModalOpen(false);
                  toast.success("สลับใช้โมเดล Agent M1 (Local Engine ใน Server)");
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 group ${
                  engineMode === "m1"
                    ? "bg-amber-500/10 border-amber-500/70 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30"
                    : "bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-amber-500/40 hover:bg-amber-50/30 dark:hover:bg-amber-950/20"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                    engineMode === "m1"
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Brain className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Agent M1</span>
                      <span className="text-[10px] text-emerald-500 font-semibold">(Local Engine)</span>
                    </span>
                    {engineMode === "m1" ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/50 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> กำลังใช้งาน
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 group-hover:text-amber-500 transition-colors">
                        คลิกเพื่อเลือก
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    รันบนเครื่องเซิร์ฟเวอร์ KTLTC ในห้องเซิร์ฟเวอร์ ออฟไลน์ 100% ปลอดภัย ไม่ต้องต่อเน็ต มีสิทธิ์แก้ไขโค้ดและรัน SSH
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                      On-Premise LAN
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
                      ออฟไลน์ 100%
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">
                      Code Modifier
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
