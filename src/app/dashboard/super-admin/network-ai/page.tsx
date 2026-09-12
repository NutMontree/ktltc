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
  AlertTriangle,
  ArrowUp,
  MoreVertical,
  Pencil,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneCall,
  PhoneOff,
  AudioLines,
  Headphones,
  SlidersHorizontal,
  Settings,
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
  isTyping?: boolean;
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

  // Engine selection: "m1" | "gemini-3.5-flash" | "gemini-3.7-flash" | "m1-local"
  const [engineMode, setEngineMode] = useState<"gemini-3.7-flash" | "gemini-3.5-flash" | "gemini-3.8-flash" | "m1" | "m1-local">("m1");

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
  const [isTaskCollapsed, setIsTaskCollapsed] = useState(true);
  const [taskTriggerMsgIndex, setTaskTriggerMsgIndex] = useState<number | null>(null);
  const [dismissedTaskIds, setDismissedTaskIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeTask?.status === "success") {
      setIsTaskCollapsed(true);
      const timer = setTimeout(() => {
        setActiveTask(null);
        setTaskTriggerMsgIndex(null);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [activeTask?.status]);

  const handleDismissTask = async (taskId?: string) => {
    setRebuildingCode(false);
    setActiveTask(null);
    if (taskId) {
      setDismissedTaskIds((prev) => ({ ...prev, [taskId]: true }));
      try {
        sessionStorage.setItem(`m1_dismissed_${taskId}`, "true");
      } catch {}
      fetch("/api/super-admin/network-ai/code-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss", taskId }),
      }).catch(() => {});
    }
  };

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
  const [activeSessionMenuId, setActiveSessionMenuId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSessionTitle, setEditingSessionTitle] = useState("");

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

  // Voice Recognition (STT) & Speech Synthesis (TTS) State
  const [isListening, setIsListening] = useState(false);
  const [isSpeechOutputEnabled, setIsSpeechOutputEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<{ id: string; name: string; type: "browser" | "server" }[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("server-niwat");
  const [voiceRate, setVoiceRate] = useState<number>(1.0);
  const [voicePitch, setVoicePitch] = useState<number>(1.0);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isPreviewSpeaking, setIsPreviewSpeaking] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentUtteranceRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const isSpeechOutputEnabledRef = useRef(true);

  // Live Two-Way Voice Call Mode State
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [voiceCallStatus, setVoiceCallStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isVoiceListeningActive, setIsVoiceListeningActive] = useState(false);
  const [isVoiceSoundDetected, setIsVoiceSoundDetected] = useState(false);
  const isVoiceCallActiveRef = useRef(false);
  const voiceCallStatusRef = useRef<"idle" | "listening" | "thinking" | "speaking">("idle");
  const voiceCallSilenceTimerRef = useRef<any>(null);

  // Forcefully unlock both Web Audio API & HTML5 Audio Element on user gesture
  const getAudioContext = () => {
    if (typeof window === "undefined") return null;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch(() => {});
      }
    } catch (e) {
      console.warn("AudioContext error:", e);
    }
    return audioContextRef.current;
  };

  const unlockAudioPlayback = () => {
    if (typeof window === "undefined") return;
    try {
      // 1. Unlock AudioContext with micro-sample buffer
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
        try {
          const buffer = ctx.createBuffer(1, 1, 22050);
          const src = ctx.createBufferSource();
          src.buffer = buffer;
          src.connect(ctx.destination);
          src.start(0);
        } catch {
          // ignore
        }
      }

      // 2. Unlock persistent HTMLAudioElement
      if (!currentAudioRef.current) {
        currentAudioRef.current = new Audio();
      }
      const audio = currentAudioRef.current;
      audio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      audio.volume = 0.001;
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => {
          try {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1.0;
          } catch {}
        }).catch(() => {});
      }
    } catch (e) {
      console.warn("unlockAudioPlayback error:", e);
    }
  };

  // Global listener for user interaction to prime audio system
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleGesture = () => {
      unlockAudioPlayback();
    };
    window.addEventListener("click", handleGesture, { passive: true });
    window.addEventListener("touchstart", handleGesture, { passive: true });
    window.addEventListener("keydown", handleGesture, { passive: true });
    return () => {
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
      window.removeEventListener("keydown", handleGesture);
    };
  }, []);

  useEffect(() => {
    isSpeechOutputEnabledRef.current = isSpeechOutputEnabled;
  }, [isSpeechOutputEnabled]);

  useEffect(() => {
    isVoiceCallActiveRef.current = isVoiceCallActive;
  }, [isVoiceCallActive]);

  useEffect(() => {
    voiceCallStatusRef.current = voiceCallStatus;
  }, [voiceCallStatus]);

  // Load voices from browser + load stored preferences
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedSpeech = localStorage.getItem("m1_speech_output_enabled");
    if (savedSpeech !== null) {
      setIsSpeechOutputEnabled(savedSpeech === "true");
    } else {
      setIsSpeechOutputEnabled(true);
      localStorage.setItem("m1_speech_output_enabled", "true");
    }
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateVoiceList = () => {
      const list: { id: string; name: string; type: "browser" | "server" }[] = [];

      // 1. Studio Neural Voices (Server - Works everywhere, ultra-natural)
      list.push({
        id: "server-niwat",
        name: "🌟 นิวัฒน์ (เสียงนิวรอลผู้ชาย นุ่ม ทุ้ม สตูดิโอ - แนะนำ)",
        type: "server",
      });
      list.push({
        id: "server-premwadee",
        name: "🌟 เปรมวดี (เสียงนิวรอลผู้หญิง หวาน ชัด สตูดิโอ)",
        type: "server",
      });

      // 2. Browser Detected Voices
      if ("speechSynthesis" in window) {
        const rawVoices = window.speechSynthesis.getVoices();
        const thaiVoices = rawVoices.filter((v) => v.lang === "th-TH" || v.lang.startsWith("th"));

        thaiVoices.forEach((v) => {
          let label = v.name;
          if (v.name.includes("Google")) label = `✨ ${v.name} (เสียง Google)`;
          else if (v.name.includes("Natural") || v.name.includes("Online")) label = `💎 ${v.name} (เสียงระบบ)`;
          else if (v.name.includes("Kanya") || v.name.includes("Siri")) label = `🍎 ${v.name} (Apple Siri)`;
          list.push({ id: v.voiceURI, name: label, type: "browser" });
        });
      }

      // 3. Fallback server voice
      list.push({
        id: "server-google",
        name: "☁️ Google Translate TTS (เสียงสังเคราะห์)",
        type: "server",
      });

      setAvailableVoices(list);

      const savedVoice = localStorage.getItem("m1_voice_id");
      const savedRate = localStorage.getItem("m1_voice_rate");
      const savedPitch = localStorage.getItem("m1_voice_pitch");

      if (savedVoice && savedVoice !== "browser-auto") {
        setSelectedVoiceId(savedVoice);
      } else {
        setSelectedVoiceId("server-niwat");
      }
      if (savedRate) setVoiceRate(parseFloat(savedRate));
      if (savedPitch) setVoicePitch(parseFloat(savedPitch));
    };

    updateVoiceList();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = updateVoiceList;
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handleVoiceChange = (id: string) => {
    setSelectedVoiceId(id);
    localStorage.setItem("m1_voice_id", id);
    toast.success("เปลี่ยนเสียงพูดเรียบร้อยแล้ว");
  };

  const handleRateChange = (r: number) => {
    setVoiceRate(r);
    localStorage.setItem("m1_voice_rate", r.toString());
  };

  const handlePitchChange = (p: number) => {
    setVoicePitch(p);
    localStorage.setItem("m1_voice_pitch", p.toString());
  };

  const handleTestVoice = (sampleText = "สวัสดีครับ ผมคือ Agent M1 ระบบเครือข่ายพร้อมทำงานแล้วครับ ได้ยินเสียงผมชัดเจนไหมครับ") => {
    setIsPreviewSpeaking(true);
    speakText(sampleText, () => {
      setIsPreviewSpeaking(false);
    });
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (currentAudioRef.current) {
        try {
          currentAudioRef.current.pause();
        } catch {
          // ignore
        }
        currentAudioRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (voiceCallSilenceTimerRef.current) {
        clearTimeout(voiceCallSilenceTimerRef.current);
      }
    };
  }, []);

  const stopSpeaking = () => {
    // 1. Stop Web Audio API source node
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      } catch {
        // ignore
      }
      audioSourceRef.current = null;
    }
    // 2. Stop HTMLAudioElement (pause and reset without destroying instance)
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {
        // ignore
      }
    }
    // 3. Stop SpeechSynthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    if (currentUtteranceRef.current) {
      currentUtteranceRef.current = null;
    }
    setIsSpeaking(false);
    setIsPreviewSpeaking(false);
  };

  const fallbackBrowserTTS = (cleanedText: string, onEndedCallback?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSpeaking(false);
      if (onEndedCallback) onEndedCallback();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch {
      // ignore
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = "th-TH";
    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;

    const allVoices = window.speechSynthesis.getVoices();
    const thaiVoices = allVoices.filter((v) => v.lang === "th-TH" || v.lang.startsWith("th"));

    if (selectedVoiceId && !selectedVoiceId.startsWith("server-") && selectedVoiceId !== "browser-auto") {
      const match = allVoices.find((v) => v.voiceURI === selectedVoiceId);
      if (match) utterance.voice = match;
      else if (thaiVoices.length > 0) utterance.voice = thaiVoices[0];
    } else if (thaiVoices.length > 0) {
      const natural = thaiVoices.find(
        (v) =>
          v.name.includes("Google") ||
          v.name.includes("Natural") ||
          v.name.includes("Online") ||
          v.name.includes("Kanya") ||
          v.name.includes("Premwadee") ||
          v.name.includes("Siri")
      );
      utterance.voice = natural || thaiVoices[0];
    }

    let isDone = false;
    const finish = () => {
      if (isDone) return;
      isDone = true;
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      if (onEndedCallback) onEndedCallback();
    };

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = finish;
    utterance.onerror = (err) => {
      console.warn("SpeechSynthesis error:", err);
      finish();
    };

    // Safety timeout in case speech synthesis stalls
    const timeoutMs = Math.max(3000, (cleanedText.length / 3) * 1000);
    setTimeout(() => {
      if (!isDone) {
        finish();
      }
    }, timeoutMs);

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const speakText = async (text: string, onEndedCallback?: () => void) => {
    stopSpeaking();

    // Clean text: strip markdown code blocks, links, headers, formatting symbols
    const cleaned = text
      .replace(/```[\s\S]*?```/g, " โค้ดโปรแกรม ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[#*_\-~>]/g, " ")
      .replace(/https?:\/\/\S+/gi, " ")
      .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned) {
      if (onEndedCallback) onEndedCallback();
      return;
    }

    const isServerVoice =
      !selectedVoiceId ||
      selectedVoiceId.startsWith("server-") ||
      selectedVoiceId === "browser-auto" ||
      !window.speechSynthesis?.getVoices().some((v) => v.voiceURI === selectedVoiceId);

    setIsSpeaking(true);

    // 1. Primary: Server Neural Audio (Microsoft Neural Studio Voice - Niwat / Premwadee)
    if (isServerVoice) {
      try {
        const serverVoiceName =
          selectedVoiceId === "server-premwadee"
            ? "th-TH-PremwadeeNeural"
            : "th-TH-NiwatNeural";

        console.log(`[TTS Client] Requesting voice: ${serverVoiceName}, text: "${cleaned.slice(0, 50)}..."`);
        const res = await fetch("/api/super-admin/network-ai/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: cleaned, voice: serverVoiceName }),
        });

        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          console.log("[TTS Client] Received audio bytes:", arrayBuffer.byteLength);
          if (arrayBuffer.byteLength > 200) {
            let audioPlayed = false;

            // Strategy 1: HTMLAudioElement with persistent unlocked instance
            try {
              if (!currentAudioRef.current) {
                currentAudioRef.current = new Audio();
              }
              const audio = currentAudioRef.current;
              const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
              const audioUrl = URL.createObjectURL(blob);
              audio.src = audioUrl;
              audio.playbackRate = voiceRate;
              audio.volume = 1.0;

              let endedTriggered = false;
              const finishPlayback = () => {
                if (endedTriggered) return;
                endedTriggered = true;
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
                audio.onended = null;
                audio.onerror = null;
                if (onEndedCallback) onEndedCallback();
              };

              audio.onended = finishPlayback;
              audio.onerror = (e) => {
                console.warn("[TTS Client] HTMLAudioElement playback error:", e);
                finishPlayback();
              };

              const playPromise = audio.play();
              if (playPromise !== undefined) {
                await playPromise;
                audioPlayed = true;
                console.log("[TTS Client] HTMLAudioElement playback started successfully!");
                return;
              }
            } catch (audioErr) {
              console.warn("[TTS Client] HTMLAudioElement play() rejected:", audioErr);
            }

            // Strategy 2: Web Audio API (if HTMLAudioElement was blocked or threw)
            if (!audioPlayed) {
              try {
                const ctx = getAudioContext();
                if (ctx) {
                  if (ctx.state === "suspended") {
                    await ctx.resume().catch(() => {});
                  }
                  if (ctx.state === "running") {
                    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
                    const source = ctx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.playbackRate.value = voiceRate;

                    const gainNode = ctx.createGain();
                    gainNode.gain.value = 1.0;

                    source.connect(gainNode);
                    gainNode.connect(ctx.destination);
                    audioSourceRef.current = source;

                    source.onended = () => {
                      console.log("[TTS Client] Web Audio playback finished");
                      setIsSpeaking(false);
                      audioSourceRef.current = null;
                      if (onEndedCallback) onEndedCallback();
                    };

                    source.start(0);
                    console.log("[TTS Client] Web Audio API playback started successfully!");
                    return;
                  }
                }
              } catch (webAudioErr) {
                console.warn("[TTS Client] Web Audio API decode/start failed:", webAudioErr);
              }
            }
          }
        } else {
          console.warn("[TTS Client] Server TTS route returned non-200:", res.status);
        }
      } catch (err) {
        console.warn("[TTS Client] Server TTS fetch error:", err);
      }
    }

    // 2. Fallback: Browser Web Speech Synthesis
    fallbackBrowserTTS(cleaned, onEndedCallback);
  };

  // Start Voice Call Continuous Listening Loop
  const startVoiceCallListening = () => {
    if (typeof window === "undefined") return;

    isVoiceCallActiveRef.current = true;
    voiceCallStatusRef.current = "listening";
    setVoiceCallStatus("listening");

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("เบราว์เซอร์นี้ไม่รองรับระบบรับฟังเสียง (แนะนำ Google Chrome หรือ Microsoft Edge)");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "th-TH";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsVoiceListeningActive(true);
      };

      recognition.onsoundstart = () => {
        setIsVoiceSoundDetected(true);
      };

      recognition.onsoundend = () => {
        setIsVoiceSoundDetected(false);
      };

      recognition.onspeechstart = () => {
        setIsVoiceSoundDetected(true);
      };

      recognition.onspeechend = () => {
        setIsVoiceSoundDetected(false);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let currentFinal = "";
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinal += (item[0]?.transcript || "") + " ";
          } else {
            currentInterim += (item[0]?.transcript || "");
          }
        }

        const effective = (currentFinal + currentInterim).trim();
        if (effective) {
          setLiveTranscript(effective);

          // Reset silence timer: when user pauses for 1.4s, automatically send message to M1
          if (voiceCallSilenceTimerRef.current) {
            clearTimeout(voiceCallSilenceTimerRef.current);
          }
          voiceCallSilenceTimerRef.current = setTimeout(() => {
            if (isVoiceCallActiveRef.current && effective.length > 0) {
              try {
                recognition.stop();
              } catch {
                // ignore
              }
              sendVoiceCallMessage(effective);
            }
          }, 1400);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Voice Call SpeechRecognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          toast.error("โปรดอนุญาตการใช้ไมโครโฟนในเบราว์เซอร์");
          setIsVoiceCallActive(false);
          isVoiceCallActiveRef.current = false;
          setVoiceCallStatus("idle");
          voiceCallStatusRef.current = "idle";
          setIsVoiceListeningActive(false);
          setIsVoiceSoundDetected(false);
        } else if (event.error === "audio-capture") {
          toast.error("ไม่พบอุปกรณ์ไมโครโฟน โปรดตรวจสอบไมค์");
          setIsVoiceListeningActive(false);
          setIsVoiceSoundDetected(false);
        }
      };

      recognition.onend = () => {
        setIsVoiceListeningActive(false);
        setIsVoiceSoundDetected(false);
        if (isVoiceCallActiveRef.current && voiceCallStatusRef.current === "listening") {
          setTimeout(() => {
            if (isVoiceCallActiveRef.current && voiceCallStatusRef.current === "listening") {
              try {
                recognition.start();
              } catch (e) {
                console.warn("Recognition restart caught:", e);
              }
            }
          }, 250);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Failed to start voice call listening:", err);
      toast.error("ไม่สามารถเปิดไมโครโฟนได้: " + (err.message || ""));
    }
  };

  const sendVoiceCallMessage = async (transcript: string) => {
    if (!transcript.trim()) return;
    if (voiceCallSilenceTimerRef.current) {
      clearTimeout(voiceCallSilenceTimerRef.current);
      voiceCallSilenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsVoiceListeningActive(false);
    setIsVoiceSoundDetected(false);
    voiceCallStatusRef.current = "thinking";
    setVoiceCallStatus("thinking");
    setLiveTranscript(transcript);
    await executeSend(transcript);
  };

  const handleStartVoiceCall = async () => {
    isVoiceCallActiveRef.current = true;
    voiceCallStatusRef.current = "listening";
    setIsVoiceCallActive(true);
    setVoiceCallStatus("listening");
    setLiveTranscript("");
    stopSpeaking();

    // Pre-unlock both HTMLAudioElement and AudioContext on this direct user click gesture!
    unlockAudioPlayback();

    // Check microphone permission directly
    if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        console.warn("Microphone access error:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          toast.error("กรุณากด 'อนุญาต (Allow)' การใช้ไมโครโฟนบนเบราว์เซอร์ เพื่อสนทนาด้วยเสียง");
          setIsVoiceCallActive(false);
          isVoiceCallActiveRef.current = false;
          setVoiceCallStatus("idle");
          voiceCallStatusRef.current = "idle";
          return;
        }
      }
    }

    startVoiceCallListening();
    toast.success("เปิดโหมดสนทนาด้วยเสียงเรียลไทม์แล้ว พูดคุยกับ M1 ได้เลยครับ", { icon: "🎙️" });
  };

  const handleInterruptVoiceCall = () => {
    unlockAudioPlayback();
    stopSpeaking();
    isVoiceCallActiveRef.current = true;
    voiceCallStatusRef.current = "listening";
    startVoiceCallListening();
    toast("ฟังเสียงคุณต่อ...", { icon: "🎙️", duration: 1500 });
  };

  const handleEndVoiceCall = () => {
    isVoiceCallActiveRef.current = false;
    voiceCallStatusRef.current = "idle";
    setIsVoiceCallActive(false);
    setVoiceCallStatus("idle");
    setLiveTranscript("");
    setIsVoiceListeningActive(false);
    setIsVoiceSoundDetected(false);
    stopSpeaking();
    if (voiceCallSilenceTimerRef.current) {
      clearTimeout(voiceCallSilenceTimerRef.current);
      voiceCallSilenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    toast("สิ้นสุดการสนทนาด้วยเสียงแล้ว", { icon: "📞" });
  };


  const toggleVoiceRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("เบราว์เซอร์นี้ไม่รองรับพิมพ์ด้วยเสียง (แนะนำ Google Chrome หรือ Microsoft Edge)");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "th-TH";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        toast("🎙️ กำลังฟังเสียง... พูดได้เลย", { id: "voice-stt", duration: 3000 });
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("SpeechRecognition error:", event.error);
        setIsListening(false);
        if (event.error !== "no-speech" && event.error !== "aborted") {
          toast.error(`เกิดข้อผิดพลาดในการรับเสียง: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Failed to start voice recognition:", err);
      setIsListening(false);
      toast.error("ไม่สามารถเริ่มไมโครโฟนได้: " + err.message);
    }
  };

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
    if (activeTask?.id) {
      handleDismissTask(activeTask.id);
    }
    setActiveTask(null);
    setTaskTriggerMsgIndex(null);
    setRebuildingCode(false);
    setIsTaskCollapsed(true);
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
    if (activeTask?.id) {
      handleDismissTask(activeTask.id);
    }
    setActiveTask(null);
    setTaskTriggerMsgIndex(null);
    setRebuildingCode(false);
    setIsTaskCollapsed(true);
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

  // Rename a Chat Session
  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      setEditingSessionId(null);
      return;
    }
    try {
      const res = await fetch("/api/super-admin/network-ai/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, title: trimmed }),
      });
      if (res.ok) {
        toast.success("เปลี่ยนชื่อห้องเรียบร้อย");
        setSessionsList((prev) =>
          prev.map((s) => (s.sessionId === sessionId ? { ...s, title: trimmed } : s))
        );
        if (sessionId === currentSessionId) {
          setCurrentSessionTitle(trimmed);
        }
      } else {
        toast.error("เปลี่ยนชื่อไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนชื่อ");
    } finally {
      setEditingSessionId(null);
    }
  };

  // Delete a Chat Session
  const handleDeleteSession = async (sessionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveSessionMenuId(null);
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
    let localTicker: any = null;
    let isCancelled = false;

    const checkTask = async () => {
      try {
        const res = await fetch(`/api/super-admin/network-ai/code-action?_t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isCancelled) return;

        if (!data.task || data.task.status === "idle") {
          setRebuildingCode(false);
          setActiveTask(null);
          return;
        }

        const isDismissed = Boolean(dismissedTaskIds[data.task.id]);

        if (isDismissed) {
          setRebuildingCode(false);
          setActiveTask(null);
          return;
        }

        setActiveTask(data.task);
        if (data.task.status === "running") {
          setRebuildingCode(true);
        } else {
          setRebuildingCode(false);
          if (data.task.status === "success") {
            setIsTaskCollapsed(true);
          }
        }
      } catch {
        // ignore
      }
    };

    // Check once on mount
    checkTask();

    // Re-check when window is focused or tab visibility becomes visible
    const handleVisibility = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        checkTask();
      }
    };
    window.addEventListener("focus", checkTask);
    document.addEventListener("visibilitychange", handleVisibility);

    // Poll every 1.5s while running/active, or every 5s if idle
    const pollInterval = (activeTask?.status === "running" || rebuildingCode) ? 1500 : 5000;
    timer = setInterval(checkTask, pollInterval);

    // Local smooth duration ticker so time never freezes on screen while running
    if (activeTask?.status === "running" || rebuildingCode) {
      localTicker = setInterval(() => {
        setActiveTask((prev) => {
          if (!prev || prev.status !== "running") return prev;
          return { ...prev, durationSeconds: prev.durationSeconds + 1 };
        });
      }, 1000);
    }

    return () => {
      isCancelled = true;
      if (timer) clearInterval(timer);
      if (localTicker) clearInterval(localTicker);
      window.removeEventListener("focus", checkTask);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [activeTask?.status, rebuildingCode, dismissedTaskIds]);

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
    setTaskTriggerMsgIndex(msgIndex);
    setIsTaskCollapsed(false);
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
        handleTriggerRebuild(msgIndex);
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
  const handleTriggerRebuild = async (msgIndex?: number) => {
    if (typeof msgIndex === "number") {
      setTaskTriggerMsgIndex(msgIndex);
    }
    setRebuildingCode(true);
    setShowTaskTerminal(true);
    setIsTaskCollapsed(false);
    setDismissedTaskIds({});
    try {
      const res = await fetch("/api/super-admin/network-ai/code-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rebuild", sessionId: currentSessionId }),
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

      const replyFullText = replyContent;

      // Stop the "Working..." spinner immediately so user sees the message start streaming
      setIsSending(false);

      if (data.sessionId && (!currentSessionId || currentSessionId !== data.sessionId)) {
        setCurrentSessionId(data.sessionId);
      }
      fetchSessions();

      const aiReply: Message = {
        role: "model",
        content: "",
        timestamp: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.modelUsed,
        duration: durationStr,
        actionSteps,
        learnedAlert,
        webSources: data.webSources,
        codeProposal,
        isTyping: true,
      };

      setMessages((prev) => [...prev, aiReply]);

      // Progressive Typewriter Streaming Animation (ค่อยๆ ป้อนข้อความมาแบบนุ่มนวล)
      await new Promise<void>((resolve) => {
        let charIndex = 0;
        const totalLen = replyFullText.length;
        const step = totalLen > 800 ? 8 : totalLen > 400 ? 5 : 3;
        const intervalMs = 15;

        const timer = setInterval(() => {
          charIndex += step;
          if (charIndex >= totalLen) {
            clearInterval(timer);
            setMessages((prev) =>
              prev.map((msg, idx) =>
                idx === prev.length - 1
                  ? { ...msg, content: replyFullText, isTyping: false }
                  : msg
              )
            );
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
            if (isVoiceCallActiveRef.current) {
              setVoiceCallStatus("speaking");
              voiceCallStatusRef.current = "speaking";
              setLiveTranscript(replyFullText);
              speakText(replyFullText, () => {
                if (isVoiceCallActiveRef.current) {
                  voiceCallStatusRef.current = "listening";
                  setVoiceCallStatus("listening");
                  startVoiceCallListening();
                }
              });
            } else if (isSpeechOutputEnabledRef.current) {
              speakText(replyFullText);
            }
            resolve();
          } else {
            const currentSlice = replyFullText.slice(0, charIndex);
            setMessages((prev) =>
              prev.map((msg, idx) =>
                idx === prev.length - 1
                  ? { ...msg, content: currentSlice, isTyping: true }
                  : msg
              )
            );
            if (charIndex % 30 < step) {
              chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }
          }
        }, intervalMs);
      });
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
        if (isVoiceCallActiveRef.current) {
          setVoiceCallStatus("speaking");
          voiceCallStatusRef.current = "speaking";
          setLiveTranscript("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
          speakText("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้งครับ", () => {
            if (isVoiceCallActiveRef.current) {
              voiceCallStatusRef.current = "listening";
              setVoiceCallStatus("listening");
              startVoiceCallListening();
            }
          });
        }
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
    unlockAudioPlayback();
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
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/super-admin"
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="กลับแดชบอร์ด Super Admin"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </Link>
          <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/30 shadow-xs">
            <Brain className="w-5 h-5" />
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            KTLTC Agent M1
          </h1>
        </div>
      </div>



      {/* Fullscreen Chat Backdrop - High z-index to overlay above Navbar (z-9999) */}
      {isFullscreenChat && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99998] transition-opacity"
          onClick={() => setIsFullscreenChat(false)}
        />
      )}

      {/* Main AI Console & Long-Term Memory (Full Width) */}
      <div
        className={`flex flex-col bg-[#0f0f14] border border-[#23232f] rounded-2xl shadow-2xl overflow-hidden transition-all text-slate-100 ${
          isFullscreenChat
            ? "fixed inset-2 sm:inset-4 md:inset-6 z-[99999] shadow-2xl h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-2rem)] md:h-[calc(100dvh-3rem)]"
            : "w-full h-[calc(100dvh-9rem)] min-h-[580px] max-h-[960px]"
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

              {/* Voice Call Button (Live 2-Way Voice Conversation) */}
              <button
                type="button"
                onClick={handleStartVoiceCall}
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-500/20 cursor-pointer transition-all hover:scale-105"
                title="เปิดโหมดสนทนาด้วยเสียงสดกับ M1 (Live 2-Way Voice Call)"
              >
                <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">สนทนาเสียงสด</span>
              </button>

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
                          onClick={() => {
                            setActiveSessionMenuId(null);
                            handleSelectSession(s.sessionId);
                          }}
                          className={`group relative p-2.5 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-between gap-2 border ${
                            s.sessionId === currentSessionId
                              ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold shadow-2xs"
                              : "bg-white/60 dark:bg-slate-900/60 border-slate-200/70 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-amber-500/30 hover:bg-white dark:hover:bg-slate-900"
                          }`}
                        >
                          {editingSessionId === s.sessionId ? (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 flex items-center gap-1.5"
                            >
                              <input
                                type="text"
                                value={editingSessionTitle}
                                onChange={(e) => setEditingSessionTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleRenameSession(s.sessionId, editingSessionTitle);
                                  } else if (e.key === "Escape") {
                                    setEditingSessionId(null);
                                  }
                                }}
                                autoFocus
                                className="flex-1 min-w-0 bg-white dark:bg-slate-950 text-xs px-2 py-1 rounded-lg border border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-slate-100 font-normal shadow-xs"
                                placeholder="ชื่อห้อง..."
                              />
                              <button
                                type="button"
                                onClick={() => handleRenameSession(s.sessionId, editingSessionTitle)}
                                className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 rounded-lg cursor-pointer transition-colors"
                                title="บันทึก"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSessionId(null)}
                                className="p-1 text-slate-400 hover:bg-slate-500/15 rounded-lg cursor-pointer transition-colors"
                                title="ยกเลิก"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <MessageSquare className={`w-3 h-3 shrink-0 ${s.sessionId === currentSessionId ? "text-amber-500" : "text-slate-400 group-hover:text-amber-500"}`} />
                                  <p className="truncate text-xs font-medium">{s.title || "บทสนทนา"}</p>
                                </div>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5 pl-4.5">{s.lastMessage || "..."}</p>
                              </div>

                              <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveSessionMenuId(activeSessionMenuId === s.sessionId ? null : s.sessionId);
                                  }}
                                  className={`p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all cursor-pointer ${
                                    activeSessionMenuId === s.sessionId
                                      ? "opacity-100 text-amber-500 bg-amber-500/10"
                                      : "opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
                                  }`}
                                  title="จัดการห้องนี้"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {activeSessionMenuId === s.sessionId && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-40"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveSessionMenuId(null);
                                      }}
                                    />
                                    <div className="absolute right-0 top-full mt-1 z-50 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 font-normal">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingSessionTitle(s.title || "บทสนทนา");
                                          setEditingSessionId(s.sessionId);
                                          setActiveSessionMenuId(null);
                                        }}
                                        className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-2 transition-colors cursor-pointer"
                                      >
                                        <Pencil className="w-3 h-3 text-amber-500" />
                                        <span>เปลี่ยนชื่อ</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteSession(s.sessionId, e);
                                        }}
                                        className="w-full px-3 py-1.5 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3 h-3 text-rose-500" />
                                        <span>ลบห้องแชต</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </>
                          )}
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
                          {m.isTyping && (
                            <span className="inline-block w-2 h-3.5 ml-1 bg-cyan-400 animate-pulse align-middle shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                          )}
                        </div>

                        {/* Live Web Sources Citation */}
                        {m.webSources && m.webSources.length > 0 && !m.isTyping && (
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
                        {m.codeProposal && !m.isTyping && (
                          <div className="mt-3 p-3 bg-slate-900 border border-amber-500/40 rounded-xl text-slate-100 shadow-md animate-in fade-in zoom-in-95 duration-300">
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
                                      onClick={() => handleApplyCode(idx, m.codeProposal!, true)}
                                      disabled={applyingCode || rebuildingCode}
                                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                                    >
                                      {applyingCode || rebuildingCode ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                                      )}
                                      <span>อนุมัติ บันทึก + Rebuild ทันที</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectCode(idx)}
                                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs transition-colors cursor-pointer"
                                    >
                                      ยกเลิก
                                    </button>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium py-1">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>คำสั่งนี้ดำเนินการบันทึกและปรับใช้โค้ดเรียบร้อยแล้ว</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Task Runner Card right UNDER the M1 comment/proposal that triggered it */}
                        {Boolean(
                          activeTask &&
                          activeTask.status !== "idle" &&
                          !dismissedTaskIds[activeTask.id] &&
                          ((taskTriggerMsgIndex !== null && taskTriggerMsgIndex === idx) ||
                           (taskTriggerMsgIndex === null && Boolean(m.codeProposal)))
                        ) && (
                          <div className="w-full max-w-[95%] sm:max-w-[90%] transition-all">
                            {isTaskCollapsed ? (
                              /* หุบลง (Collapsed Compact Bar) */
                              <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-[#181822] flex items-center justify-between gap-2 text-xs shadow-md animate-in fade-in">
                                <div className="flex items-center gap-2 min-w-0">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  <span className="font-bold text-emerald-300">✅ Rebuild สำเร็จ</span>
                                  <span className="text-[11px] font-mono text-slate-400">({activeTask?.durationSeconds}s)</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <a
                                    href={m.codeProposal?.filePath ? (m.codeProposal.filePath.replace("src/app/(website)", "").replace("/page.tsx", "") || "/") : "/test"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-all hover:scale-105"
                                  >
                                    <Globe className="w-3 h-3" />
                                    <span>เปิดหน้าเว็บจริง ↗</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => setIsTaskCollapsed(false)}
                                    className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                                    title="ขยายดู Console Log"
                                  >
                                    <Terminal className="w-3 h-3 text-amber-400" />
                                    <span>ดู Log</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveTask(null);
                                      setTaskTriggerMsgIndex(null);
                                    }}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                                    title="ปิด"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Expanded while running */
                              <div
                                className={`p-3.5 rounded-2xl border transition-all text-xs space-y-2.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 ${
                                  activeTask?.status === "running"
                                    ? "bg-[#181822] border-amber-500/50 shadow-amber-500/10 ring-1 ring-amber-500/20"
                                    : activeTask?.status === "success"
                                    ? "bg-[#181822] border-emerald-500/50 shadow-emerald-500/10 ring-1 ring-emerald-500/20"
                                    : "bg-[#181822] border-rose-500/50 shadow-rose-500/10 ring-1 ring-rose-500/20"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {activeTask?.status === "running" ? (
                                      <div className="relative flex items-center justify-center">
                                        <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                      </div>
                                    ) : activeTask?.status === "success" ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    ) : (
                                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                    )}
                                    <span className="font-bold text-white flex items-center gap-2 flex-wrap">
                                      {activeTask?.status === "running" && (
                                        <span className="px-2 py-0.5 text-[10px] rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30 animate-pulse">
                                          ⚙️ 1 task running
                                        </span>
                                      )}
                                      {activeTask?.status === "success" && (
                                        <span className="px-2 py-0.5 text-[10px] rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                                          ✅ Task Completed
                                        </span>
                                      )}
                                      {activeTask?.status === "error" && (
                                        <span className="px-2 py-0.5 text-[10px] rounded-md bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/30">
                                          ❌ Task Failed
                                        </span>
                                      )}
                                      <span className="text-[11px] font-mono text-slate-400">
                                        ⏱️ {activeTask?.status === "running" ? `กำลังรัน... ${activeTask.durationSeconds}s` : `เสร็จสิ้นใน ${activeTask?.durationSeconds}s`}
                                      </span>
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setShowTaskTerminal(!showTaskTerminal)}
                                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <Terminal className="w-3 h-3 text-amber-400" />
                                      <span>{showTaskTerminal ? "ซ่อน Console" : "ดู Console Log สด"}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setIsTaskCollapsed(true)}
                                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                      title="หุบลง"
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                    {activeTask?.status !== "running" && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveTask(null);
                                          setTaskTriggerMsgIndex(null);
                                        }}
                                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                        title="ปิด"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Step Message & Web Link */}
                                <div className="text-[11px] text-slate-300 font-mono flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-white/5">
                                  <span className="truncate max-w-xl">{activeTask?.stepMessage || activeTask?.command}</span>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {activeTask?.status === "success" && (
                                      <a
                                        href={m.codeProposal?.filePath ? (m.codeProposal.filePath.replace("src/app/(website)", "").replace("/page.tsx", "") || "/") : "/test"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all hover:scale-105"
                                      >
                                        <Globe className="w-3 h-3" />
                                        <span>เปิดหน้าเว็บจริง ↗</span>
                                      </a>
                                    )}
                                    {activeTask?.status === "error" && (
                                      <button
                                        type="button"
                                        onClick={() => handleTriggerRebuild(idx)}
                                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>ลองใหม่</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Terminal Console Output */}
                                {showTaskTerminal && activeTask?.outputLogs && activeTask.outputLogs.length > 0 && (
                                  <div className="p-3 bg-black/90 rounded-xl font-mono text-[10px] leading-relaxed max-h-56 overflow-y-auto space-y-1 text-slate-300 border border-white/5 scrollbar-thin">
                                    {activeTask.outputLogs.map((log, lIdx) => (
                                      <div
                                        key={lIdx}
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
                          {m.content && (
                            <button
                              type="button"
                              onClick={() => {
                                if (isSpeaking) {
                                  stopSpeaking();
                                } else {
                                  speakText(m.content);
                                }
                              }}
                              className="hover:text-amber-400 text-slate-400 transition-colors cursor-pointer flex items-center gap-1"
                              title="ฟังเสียงอ่านข้อความนี้"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>อ่านออกเสียง</span>
                            </button>
                          )}
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
                          {engineMode === "m1"
                            ? "Agent M1 Pro"
                            : engineMode === "gemini-3.5-flash"
                            ? "Gemini 3.5 Flash"
                            : engineMode === "gemini-3.7-flash"
                            ? "Gemini 3.7 Pro"
                            : "Agent M1 Local"}
                        </span>
                        <ChevronDown className="w-3 h-3 text-slate-400 opacity-70 ml-0.5" />
                      </button>
                    </div>

                    {/* Right Actions: Live Call, Mic, Audio Read Toggle, Stop Generation / Send or Queue */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {/* Live Voice Call Button */}
                      <button
                        type="button"
                        onClick={handleStartVoiceCall}
                        className="w-7 h-7 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                        title="เปิดโหมดสนทนาด้วยเสียงสดกับ M1 (Live 2-Way Voice Call)"
                      >
                        <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
                      </button>

                      {/* Voice STT Microphone Button */}
                      <button
                        type="button"
                        onClick={toggleVoiceRecording}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isListening
                            ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/50 scale-105"
                            : "bg-[#242432] hover:bg-[#2f2f42] text-slate-300 hover:text-white"
                        }`}
                        title={isListening ? "กำลังฟังเสียง (คลิกเพื่อหยุด)" : "พิมพ์ด้วยเสียง (พูดภาษาไทย)"}
                      >
                        {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      </button>

                      {/* Voice TTS Auto-Read Toggle Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isSpeaking) {
                            stopSpeaking();
                          }
                          setIsSpeechOutputEnabled((prev) => {
                            const next = !prev;
                            localStorage.setItem("m1_speech_output_enabled", next ? "true" : "false");
                            if (next) {
                              unlockAudioPlayback();
                            }
                            toast(next ? "เปิดเสียงอ่านคำตอบอัตโนมัติ 🔊" : "ปิดเสียงอ่านอัตโนมัติ 🔇", {
                              icon: next ? "🔊" : "🔇",
                            });
                            return next;
                          });
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isSpeaking
                            ? "bg-amber-500 text-slate-950 animate-bounce shadow-md shadow-amber-500/30"
                            : isSpeechOutputEnabled
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-[#242432] hover:bg-[#2f2f42] text-slate-400 hover:text-slate-200"
                        }`}
                        title={
                          isSpeaking
                            ? "กำลังอ่านออกเสียง (คลิกเพื่อหยุดเสียง)"
                            : isSpeechOutputEnabled
                            ? "เสียงอ่าน AI: เปิดอยู่ (คลิกเพื่อปิด)"
                            : "เสียงอ่าน AI: ปิดอยู่ (คลิกเพื่อเปิด)"
                        }
                      >
                        {isSpeechOutputEnabled ? (
                          <Volume2 className="w-3.5 h-3.5" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5 opacity-60" />
                        )}
                      </button>

                      {/* Voice Settings Button */}
                      <button
                        type="button"
                        onClick={() => setIsVoiceSettingsOpen(true)}
                        className="w-7 h-7 rounded-full bg-[#242432] hover:bg-[#2f2f42] text-slate-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="ตั้งค่าและเปลี่ยนเสียงพูด AI (เลือกเสียง / ปรับความเร็ว / ทดสอบเสียง)"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>

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
              {/* Model 1: Agent M1 Pro (Default & Recommended) */}
              <button
                type="button"
                onClick={() => {
                  setEngineMode("m1");
                  setIsModelModalOpen(false);
                  toast.success("สลับใช้โมเดล Agent M1 Pro (สมองกลอัจฉริยะ M1)");
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
                      ? "bg-gradient-to-br from-amber-500 to-yellow-500 text-slate-950 font-bold"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Agent M1 Pro</span>
                      <span className="text-[10px] text-amber-500 font-semibold">(แนะนำ)</span>
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
                    สุดยอดสมองกลอัจฉริยะ KTLTC ปรับแต่งโค้ด เขียนไฟล์ คอมไพล์ Rebuild และวิเคราะห์เครือข่ายสดแบบอัตโนมัติ รวดเร็วและเสถียรที่สุด
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                      Agent M1 Engine
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                      ตอบไวมาก (Ultra-Fast)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                      รองรับภาพ & โค้ด
                    </span>
                  </div>
                </div>
              </button>

              {/* Model 2: Gemini 3.5 Flash */}
              <button
                type="button"
                onClick={() => {
                  setEngineMode("gemini-3.5-flash");
                  setIsModelModalOpen(false);
                  toast.success("สลับใช้โมเดล Google AI (Gemini 3.5 Flash)");
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 group ${
                  engineMode === "gemini-3.5-flash"
                    ? "bg-amber-500/10 border-amber-500/70 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30"
                    : "bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-amber-500/40 hover:bg-amber-50/30 dark:hover:bg-amber-950/20"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                    engineMode === "gemini-3.5-flash"
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Gemini 3.5 Flash</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Google AI)</span>
                    </span>
                    {engineMode === "gemini-3.5-flash" ? (
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
                    ความเร็วสูง เสถียร ตอบไวใน 1-2 วินาที เหมาะสำหรับสนทนา ถามตอบปัญหา และตรวจเครือข่ายทั่วไป
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                      Google Cloud
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                      ตอบไวมาก (Fast)
                    </span>
                  </div>
                </div>
              </button>

              {/* Model 3: Gemini 3.7 Pro Thinking */}
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
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Gemini 3.7 Pro</span>
                      <span className="text-[10px] text-purple-500 font-semibold">(Thinking Engine)</span>
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
                  </div>
                </div>
              </button>

              {/* Model 4: Agent M1 Local */}
              <button
                type="button"
                onClick={() => {
                  setEngineMode("m1-local");
                  setIsModelModalOpen(false);
                  toast.success("สลับใช้โมเดล Agent M1 (Local Engine ใน Server)");
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 group ${
                  engineMode === "m1-local"
                    ? "bg-amber-500/10 border-amber-500/70 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30"
                    : "bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-amber-500/40 hover:bg-amber-50/30 dark:hover:bg-amber-950/20"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                    engineMode === "m1-local"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Brain className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Agent M1 Local</span>
                      <span className="text-[10px] text-emerald-500 font-semibold">(Ollama Server)</span>
                    </span>
                    {engineMode === "m1-local" ? (
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
                      Server Local
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      Llama 3 (8B)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
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

      {/* Live Two-Way Voice Call Modal (เหมือน Gemini Live / ChatGPT Voice) */}
      {isVoiceCallActive && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-200 select-none">
          {/* Top Bar */}
          <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Agent M1 Live Voice</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                    NEURAL
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">สนทนาสดด้วยเสียงสองทาง (ภาษาไทย)</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Voice Selector in Voice Call */}
              <div className="flex items-center gap-1.5 bg-[#1e1e2c] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                <Headphones className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={selectedVoiceId}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs max-w-[150px] sm:max-w-[200px] truncate"
                >
                  {availableVoices.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#1e1e2c] text-white">
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice Settings Gear */}
              <button
                type="button"
                onClick={() => setIsVoiceSettingsOpen(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                title="ปรับแต่งเสียงพูดและความเร็ว"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* End Call X button */}
              <button
                type="button"
                onClick={handleEndVoiceCall}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="ปิดหน้าต่างสนทนา"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Interactive Voice Orb / Soundwave */}
          <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center gap-6 my-auto">
            {/* Pulsing Avatar Sphere */}
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing ripples when listening or speaking */}
              {voiceCallStatus === "listening" && (
                <>
                  <div className="absolute w-44 h-44 rounded-full bg-blue-500/20 animate-ping opacity-60 pointer-events-none" />
                  <div className="absolute w-56 h-56 rounded-full bg-cyan-500/10 animate-pulse pointer-events-none" />
                </>
              )}
              {voiceCallStatus === "speaking" && (
                <>
                  <div className="absolute w-48 h-48 rounded-full bg-emerald-500/25 animate-ping opacity-75 pointer-events-none" />
                  <div className="absolute w-60 h-60 rounded-full bg-teal-500/15 animate-pulse pointer-events-none" />
                </>
              )}

              {/* Core Orb */}
              <div
                onClick={() => {
                  if (voiceCallStatus === "speaking") {
                    handleInterruptVoiceCall();
                  } else if (voiceCallStatus === "listening") {
                    if (liveTranscript.trim()) {
                      sendVoiceCallMessage(liveTranscript.trim());
                    }
                  } else if (voiceCallStatus === "idle") {
                    startVoiceCallListening();
                  }
                }}
                className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer ${
                  voiceCallStatus === "listening"
                    ? isVoiceSoundDetected
                      ? "bg-gradient-to-tr from-emerald-600 via-cyan-500 to-blue-600 shadow-cyan-400/40 scale-110 ring-4 ring-cyan-400/30"
                      : "bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 shadow-cyan-500/30 scale-105"
                    : voiceCallStatus === "thinking"
                    ? "bg-gradient-to-tr from-amber-600 via-purple-600 to-rose-600 shadow-amber-500/30 animate-pulse"
                    : voiceCallStatus === "speaking"
                    ? "bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 shadow-emerald-500/40 scale-110"
                    : "bg-[#252538] text-slate-400 hover:scale-105"
                }`}
              >
                {voiceCallStatus === "listening" && (
                  <Mic className={`w-14 h-14 sm:w-16 sm:h-16 text-white ${isVoiceSoundDetected ? "animate-bounce" : "animate-pulse"}`} />
                )}
                {voiceCallStatus === "thinking" && (
                  <Sparkles className="w-14 h-14 sm:w-16 sm:h-16 text-amber-200 animate-spin" />
                )}
                {voiceCallStatus === "speaking" && (
                  <AudioLines className="w-14 h-14 sm:w-16 sm:h-16 text-white animate-bounce" />
                )}
                {voiceCallStatus === "idle" && (
                  <MicOff className="w-14 h-14 sm:w-16 sm:h-16 text-slate-400" />
                )}
              </div>
            </div>

            {/* Status Text Indicator */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center">
                {voiceCallStatus === "listening" && (
                  isVoiceSoundDetected ? (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      ตรวจพบเสียงพูดแล้ว...
                    </span>
                  ) : (
                    <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      ไมค์เปิดอยู่ • กำลังฟังเสียงคุณ...
                    </span>
                  )
                )}
                {voiceCallStatus === "thinking" && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    M1 กำลังคิดคำตอบ...
                  </span>
                )}
                {voiceCallStatus === "speaking" && (
                  <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-teal-400 animate-bounce" />
                    M1 กำลังพูดตอบ...
                  </span>
                )}
                {voiceCallStatus === "idle" && (
                  <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-xs font-semibold">
                    แตะเพื่อเริ่มใหม่
                  </span>
                )}
              </div>

              <h4 className="text-base sm:text-lg font-bold tracking-wide text-white">
                {voiceCallStatus === "listening" && (isVoiceSoundDetected ? "กำลังถอดเสียงคำพูด..." : "พูดคำถามกับ M1 ได้เลย")}
                {voiceCallStatus === "thinking" && "M1 กำลังประมวลผลคำตอบ..."}
                {voiceCallStatus === "speaking" && "M1 กำลังพูดตอบ..."}
                {voiceCallStatus === "idle" && "แตะที่ลูกกลมเพื่อเริ่มพูด"}
              </h4>
              <p className="text-xs text-slate-400 font-light max-w-sm mx-auto">
                {voiceCallStatus === "listening" && "พูดคำถามได้เลย เมื่อหยุดพูดระบบจะส่งให้อัตโนมัติ หรือแตะที่ลูกกลมเพื่อส่งทันที"}
                {voiceCallStatus === "thinking" && "กำลังค้นหาข้อมูลและสรุปคำตอบให้คุณ"}
                {voiceCallStatus === "speaking" && "แตะลูกกลม หรือกดปุ่มด้านล่างเพื่อขัดจังหวะ/พูดต่อ"}
                {voiceCallStatus === "idle" && "กดปุ่มด้านล่างเพื่อเปิดไมค์"}
              </p>
            </div>

            {/* Live Subtitle / Transcript Box */}
            <div className="w-full bg-[#181824]/90 border border-white/10 rounded-2xl p-4 sm:p-5 text-center min-h-[90px] flex items-center justify-center shadow-lg">
              {liveTranscript ? (
                <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed break-words">
                  &ldquo;{liveTranscript}&rdquo;
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {voiceCallStatus === "listening" ? "(กำลังดักฟังเสียงผ่านไมโครโฟน... พูดคำถามได้เลย)" : "พร้อมรับฟังคำถาม..."}
                </p>
              )}
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="w-full max-w-md mx-auto flex items-center justify-center gap-6 pt-4 border-t border-white/5">
            {/* Interrupt button (when M1 is speaking) */}
            {voiceCallStatus === "speaking" ? (
              <button
                type="button"
                onClick={handleInterruptVoiceCall}
                className="px-5 py-3 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>ขัดจังหวะ / พูดแทรก</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (voiceCallStatus === "listening") {
                    if (liveTranscript.trim()) {
                      sendVoiceCallMessage(liveTranscript.trim());
                    }
                  } else {
                    startVoiceCallListening();
                  }
                }}
                className={`px-5 py-3 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                  voiceCallStatus === "listening"
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                    : "bg-[#252538] hover:bg-[#303046] text-slate-200"
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{voiceCallStatus === "listening" ? "ส่งคำถามทันที ➔" : "เริ่มฟังเสียง"}</span>
              </button>
            )}

            {/* End Call Button */}
            <button
              type="button"
              onClick={handleEndVoiceCall}
              className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="จบการสนทนาด้วยเสียง"
            >
              <PhoneOff className="w-4 h-4" />
              <span>วางสาย</span>
            </button>
          </div>
        </div>
      )}

      {/* Voice Customization Settings Modal (ตั้งค่าเสียงพูด AI) */}
      {isVoiceSettingsOpen && (
        <div className="fixed inset-0 z-[100001] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161622] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>ปรับแต่งเสียงพูดของ Agent M1</span>
              </div>
              <button
                type="button"
                onClick={() => setIsVoiceSettingsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Voice Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>เลือกเสียงพูด (Voice)</span>
                <span className="text-[10px] text-amber-400/80">ตรวจพบ {availableVoices.length} เสียง</span>
              </label>
              <select
                value={selectedVoiceId}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="w-full bg-[#20202e] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none cursor-pointer focus:border-amber-500/50 transition-colors"
              >
                {availableVoices.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#20202e] text-slate-200">
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Speed / Rate Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">ความเร็วในการพูด (Speed)</span>
                <span className="text-amber-400 font-mono font-bold">{voiceRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={voiceRate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#20202e] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.7x (ช้าชัดเจน)</span>
                <span>1.0x (ปกติ)</span>
                <span>1.3x (คล่องแคล่ว)</span>
              </div>
            </div>

            {/* Tone / Pitch Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">โทนเสียง ทุ้ม/แหลม (Pitch)</span>
                <span className="text-amber-400 font-mono font-bold">
                  {voicePitch < 0.95 ? "เสียงทุ้มนุ่ม" : voicePitch > 1.05 ? "เสียงใสแหลม" : "เสียงปกติ"}
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={voicePitch}
                onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#20202e] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>ทุ้มอบอุ่น</span>
                <span>ปกติ</span>
                <span>สดใส/สูง</span>
              </div>
            </div>

            {/* Preview / Test Button */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleTestVoice()}
                disabled={isPreviewSpeaking}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPreviewSpeaking ? "animate-bounce" : ""}`} />
                <span>{isPreviewSpeaking ? "กำลังทดสอบเสียง..." : "🔊 กดทดสอบฟังเสียงนี้"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsVoiceSettingsOpen(false)}
                className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                เสร็จสิ้น
              </button>
            </div>

            {/* Helper tip */}
            <p className="text-[11px] text-slate-400/90 leading-relaxed bg-white/5 p-2.5 rounded-xl border border-white/5">
              💡 <strong>คำแนะนำ:</strong> หากเปิดใช้งานผ่าน <strong>Google Chrome</strong> จะมีเสียง <strong>&quot;Google ภาษาไทย&quot;</strong> ซึ่งเป็นเสียงธรรมชาติที่มีความลื่นไหลและเพราะที่สุด หรือสามารถปรับระดับความเร็ว 0.90x - 1.05x เพื่อให้เข้ากับหูของคุณได้ครับ
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
