/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import FullPageLoader from "@/components/FullPageLoader";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  ShareAltOutlined,
  PictureOutlined,
  DeleteOutlined,
  CameraOutlined,
  SendOutlined,
  SmileOutlined,
  TeamOutlined,
  SettingOutlined,
  CloseOutlined,
  EllipsisOutlined,
  CheckCircleFilled,
  MessageOutlined,
  UserDeleteOutlined,
  SaveOutlined,
  UserAddOutlined,
  DownOutlined,
  MenuOutlined,
  LockOutlined,
  SearchOutlined,
  LikeFilled,
  LikeOutlined,
  CommentOutlined,
  LeftOutlined,
  RightOutlined
} from "@ant-design/icons";
import { Dropdown, Popover, message, Popconfirm } from "antd";
import { useSession, signIn } from "next-auth/react";
import imageCompression from "browser-image-compression";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Item Component for dnd-kit
const SortableItem = ({ item, idx, onRemove }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative aspect-square rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 group shadow-sm cursor-grab active:cursor-grabbing bg-white dark:bg-zinc-800 ${isDragging ? "opacity-50 scale-105 shadow-2xl ring-2 ring-blue-500" : ""}`}
    >
      <img
        src={item.src}
        className="w-full h-full object-cover pointer-events-none"
        alt={`Preview ${idx}`}
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 shadow-lg transform hover:scale-110 transition-all"
        >
          <DeleteOutlined className="text-xs" />
        </button>
      </div>
      <div className="absolute bottom-2 left-2 bg-blue-600 text-[10px] text-white px-2 py-0.5 rounded-full font-black shadow-sm">
        {idx + 1}
      </div>
    </div>
  );
};

// Shared Modal Component
const ProfileModal = ({
  isOpen,
  title,
  children,
  onClose,
  onSubmit,
  saving,
}: {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: (e: any) => void;
  saving: boolean;
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="text-xl font-black text-zinc-900 dark:text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200"
            >
              <CloseOutlined className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {children}
          </div>
          <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              ยกเลิก
            </button>
            <button
              onClick={(e) => {
                onSubmit(e);
              }}
              className="px-8 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/20"
            >
              {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function FriendProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPostImagePreviews((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const postImageInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<
    "profile" | "intro" | "security" | "post" | "share" | null
  >(null);

  const [activeTab, setActiveTab] = useState("โพสต์");
  const [activeAboutTab, setActiveAboutTab] = useState("ข้อมูลภาพรวม");
  const [showSettings, setShowSettings] = useState(false);

  // Post states
  const [postText, setPostText] = useState("");
  const [postImagePreviews, setPostImagePreviews] = useState<
    { id: string; src: string }[]
  >([]);
  const [isPosting, setIsPosting] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Social states
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    postId: string;
    commentId: string;
  } | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<string[]>([]);
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const commentImageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    lineId: "",
    role: "",
    department: "ไม่มีสังกัด",
    position: "",
    faction: "",
    description: "",
    program: "",
    image: "",
    coverImage: "",
    password: "",
    confirmPassword: "",
    friends: [],
    work: "",
    education: "",
    currentCity: "",
    hometown: "",
    relationship: "ไม่ระบุ",
  });

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchFriend, setSearchFriend] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    images: string[];
    index: number;
  } | null>(null);
  const [dismissedUsers, setDismissedUsers] = useState<string[]>([]);

  const [friendStatus, setFriendStatus] = useState<"none" | "request_sent" | "request_received" | "friends" | "me">("none");
  const [friendRequestId, setFriendRequestId] = useState<string | null>(null);
  const [postAudience, setPostAudience] = useState<"public" | "friends" | "private">("public");
  const [showAudienceMenu, setShowAudienceMenu] = useState(false);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      message.error("ไม่สามารถเข้าถึงกล้องได้");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      const data = canvasRef.current.toDataURL("image/jpeg");
      setCommentImage(data);
      stopCamera();
    }
  };

  const handleCommentImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setCommentImage(reader.result as string);
      };
    } catch (error) {
      console.error("Image compression error:", error);
    }
  };


  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result as string);
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Profile compression error:", error);
      }
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewCover(reader.result as string);
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Cover compression error:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("❌ รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image: previewImage,
          coverImage: previewCover,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setActiveModal(null);
        fetchData();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderContentWithLinks = (content: string) => {
    if (!content) return null;
    const combinedRegex = /(https?:\/\/[^\s]+|#[^\s#]+)/g;
    const parts = content.split(combinedRegex);
    return parts.map((part, i) => {
      if (part.match(/^https?:\/\//)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {part}
          </a>
        );
      } else if (part.match(/^#/)) {
        return (
          <span key={i} className="font-black text-blue-600 dark:text-blue-400">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const fetchFriendStatus = async () => {
    try {
      const res = await fetch(`/api/friends/status?id=${id}`);
      const data = await res.json();
      setFriendStatus(data.status);
      setFriendRequestId(data.requestId || null);
    } catch (error) {
      console.error("Fetch friend status error:", error);
    }
  };

  const handleRequestFriend = async (targetId: string) => {
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: targetId }),
      });
      if (res.ok) {
        message.success("ส่งคำขอเป็นเพื่อนแล้ว");
        fetchData();
      } else {
        const error = await res.json();
        message.error(error.error || "ไม่สามารถส่งคำขอได้");
      }
    } catch (error) {
      console.error("Request friend error:", error);
    }
  };

  const handleAddFriend = async () => {
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: id }),
      });
      if (res.ok) {
        message.success("ส่งคำขอเป็นเพื่อนแล้ว");
        fetchFriendStatus();
      }
    } catch (error) {
      console.error("Add friend error:", error);
    }
  };

  const handleAcceptFriend = async () => {
    if (!friendRequestId) return;
    try {
      const res = await fetch("/api/friends/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: friendRequestId }),
      });
      if (res.ok) {
        message.success("คุณเป็นเพื่อนกันแล้ว");
        fetchFriendStatus();
      }
    } catch (error) {
      console.error("Accept friend error:", error);
    }
  };

  const handleUnfriend = async () => {
    try {
      const res = await fetch("/api/friends/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: id }),
      });
      if (res.ok) {
        message.success("เลิกเป็นเพื่อนแล้ว");
        fetchFriendStatus();
      }
    } catch (error) {
      console.error("Unfriend error:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, postsRes, allUsersRes] = await Promise.all([
        fetch(`/api/users/${id}`),
        fetch(`/api/posts?userId=${id}`),
        fetch("/api/users/all"),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setFormData({
          ...data,
          password: "",
          confirmPassword: "",
        });
        if (data.image) setPreviewImage(data.image);
        if (data.coverImage) setPreviewCover(data.coverImage);
      }
      if (postsRes.ok) {
        setUserPosts(await postsRes.json());
      }
      if (allUsersRes.ok) {
        const data = await allUsersRes.json();
        setAllUsers(data.users || []);
      }
      
      await fetchFriendStatus();
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [loading]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;

      if (e.key === "ArrowLeft") {
        setSelectedImage((prev) =>
          prev
            ? {
                ...prev,
                index:
                  (prev.index - 1 + prev.images.length) % prev.images.length,
              }
            : null,
        );
      } else if (e.key === "ArrowRight") {
        setSelectedImage((prev) =>
          prev
            ? {
                ...prev,
                index: (prev.index + 1) % prev.images.length,
              }
            : null,
        );
      } else if (e.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage]);

  const handleLikePost = async (postId: string) => {
    if (!session) {
      alert("กรุณาเข้าสู่ระบบก่อนกดถูกใจ");
      signIn();
      return;
    }
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "LIKE" }),
      });
      if (res.ok) {
        fetchData(); // Refresh posts
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleCommentSubmit = async (
    postId: string,
    parentId: string | null = null,
  ) => {
    if (!session) {
      alert("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
      signIn();
      return;
    }
    if (!newCommentText.trim() && !commentImage) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "COMMENT",
          text: newCommentText,
          image: commentImage,
          parentId,
        }),
      });
      if (res.ok) {
        setNewCommentText("");
        setCommentImage(null);
        setCommentingPostId(null);
        setReplyingTo(null);
        fetchData(); // Refresh posts
      }
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
    if (!session) {
      alert("กรุณาเข้าสู่ระบบก่อนกดถูกใจ");
      signIn();
      return;
    }

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "LIKE_COMMENT",
          commentId,
        }),
      });
      if (res.ok) {
        fetchData(); // Refresh posts
      }
    } catch (error) {
      console.error("Like comment error:", error);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm("คุณต้องการลบคอมเม้นนี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "DELETE_COMMENT", commentId }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Delete comment error:", error);
    }
  };

  const handleUpdateComment = async (postId: string, commentId: string) => {
    if (!editingCommentText.trim()) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "UPDATE_COMMENT",
          commentId,
          newText: editingCommentText,
        }),
      });
      if (res.ok) {
        setEditingCommentId(null);
        fetchData();
      }
    } catch (error) {
      console.error("Update comment error:", error);
    }
  };

  const handlePostImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      for (const file of fileList) {
        try {
          const compressedFile = await imageCompression(file, options);
          const reader = new FileReader();
          reader.onloadend = () => {
            setPostImagePreviews((prev) => [...prev, { id: Math.random().toString(36).substring(7), src: reader.result as string }]);
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          console.error("Compression error:", error);
        }
      }
    }
  };

  const removeImage = (imgId: string) => {
    setPostImagePreviews((prev) => prev.filter((img) => img.id !== imgId));
  };

  const handleCreatePost = async () => {
    if (!session) { alert("กรุณาเข้าสู่ระบบก่อนโพสต์"); signIn(); return; }
    if (!postText.trim() && postImagePreviews.length === 0) return;
    setIsPosting(true);
    try {
      const imageUrls: string[] = [];
      for (const item of postImagePreviews) {
        if (item.src.startsWith("http")) { imageUrls.push(item.src); continue; }
        const formData = new FormData();
        // Convert base64 to Blob
        const fetchRes = await fetch(item.src);
        const blob = await fetchRes.blob();
        formData.append("file", blob, `post-${Date.now()}.jpg`);
        formData.append("folder", "posts");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        imageUrls.push(uploadData.secure_url);
      }
      const method = editingPostId ? "PUT" : "POST";
      const url = editingPostId ? `/api/posts/${editingPostId}` : "/api/posts";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Profile Post",
          content: postText,
          images: imageUrls,
          targetUserId: id, // Posting on this user's profile
        }),
      });
      if (res.ok) {
        setPostText("");
        setPostImagePreviews([]);
        setEditingPostId(null);
        setActiveModal(null);
        fetchData();
      }
    } catch (error) {
      console.error("Post error:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("คุณต้องการลบโพสต์นี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Delete post error:", error);
    }
  };

  if (loading) return <FullPageLoader message="กำลังโหลดโปรไฟล์..." />;
  if (!formData) return null;

  const isMyProfile = session?.user && (session.user as any).id === id;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "โพสต์": {
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 space-y-4">
              {/* Intro Section */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 border dark:border-zinc-800">
                <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-4">
                  แนะนำตัว
                </h2>
                <div className="space-y-4">
                  <p className="text-center text-zinc-600 dark:text-zinc-400 italic">
                    &quot;
                    {formData.description || "เขียนอะไรบางอย่างเกี่ยวกับคุณ..."}
                    &quot;
                  </p>
                  {isMyProfile && (
                    <button
                      onClick={() => setActiveModal("intro")}
                      className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-bold text-sm hover:bg-zinc-200"
                    >
                      แก้ไขคำแนะนำตัว
                    </button>
                  )}

                  <div className="space-y-3 py-2 border-t dark:border-zinc-800 mt-2 pt-4">
                    <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                      <SafetyCertificateOutlined className="text-zinc-400 text-xl" />
                      <span className="text-sm">
                        ตำแหน่ง{" "}
                        <b className="text-zinc-900 dark:text-white">
                          {formData.position || "-"}
                        </b>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                      <UserOutlined className="text-zinc-400 text-xl" />
                      <span className="text-sm">
                        แผนก{" "}
                        <b className="text-zinc-900 dark:text-white">
                          {formData.department || "-"}
                        </b>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                      <DatabaseOutlined className="text-zinc-400 text-xl" />
                      <span className="text-sm">
                        ฝ่าย{" "}
                        <b className="text-zinc-900 dark:text-white">
                          {formData.faction || "-"}
                        </b>
                      </span>
                    </div>
                    {formData.currentCity && (
                      <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                        <GlobalOutlined className="text-zinc-400 text-xl" />
                        <span className="text-sm">
                          อาศัยอยู่ที่{" "}
                          <b className="text-zinc-900 dark:text-white">
                            {formData.currentCity}
                          </b>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Photos Section */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 border dark:border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-black mb-0">รูปภาพ</h2>
                  <span
                    onClick={() => setActiveTab("รูปภาพ")}
                    className="text-blue-600 text-sm font-bold cursor-pointer hover:underline"
                  >
                    ดูรูปภาพทั้งหมด
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden border dark:border-zinc-700">
                  {userPosts
                    .filter((p) => p.image)
                    .slice(0, 9)
                    .map((post: any) => (
                      <div
                        key={post._id}
                        className="aspect-square bg-zinc-100 dark:bg-zinc-800 hover:opacity-80 cursor-pointer transition-all overflow-hidden"
                      >
                        <img
                          src={post.image}
                          className="w-full h-full object-cover"
                          alt="Post thumbnail"
                        />
                      </div>
                    ))}
                  {userPosts.filter((p) => p.image).length === 0 && (
                    <div className="col-span-3 py-10 text-center text-zinc-400 text-xs italic">
                      ยังไม่มีรูปภาพ
                    </div>
                  )}
                </div>
              </div>

              {/* Friends Section */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 border dark:border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-black mb-0">เพื่อน</h2>
                    <p className="text-xs text-zinc-400 font-bold">
                      {allUsers.length > 0 ? allUsers.length - 1 : 0} คน
                    </p>
                  </div>
                  <span
                    onClick={() => setActiveTab("เพื่อน")}
                    className="text-blue-600 font-bold text-sm cursor-pointer hover:underline"
                  >
                    ดูทั้งหมด
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {allUsers
                    .filter(
                      (u) =>
                        String(u._id) !== String((session?.user as any)?.id),
                    )
                    .slice(0, 9)
                    .map((u) => (
                      <div
                        key={String(u._id)}
                        onClick={() => {
                          if (String(u._id) === String(id)) return;
                          router.push(`/dashboard/profile/${String(u._id)}`);
                        }}
                        className="cursor-pointer group"
                      >
                        <div className="aspect-square rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-1 border dark:border-zinc-800">
                          {u.image ? (
                            <img
                              src={u.image}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                              alt={u.name}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserOutlined className="text-xl text-zinc-300" />
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] font-black truncate dark:text-white">
                          {u.name?.split(" ")[0]}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {/* What's on your mind? (Create Post Section) */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 border dark:border-zinc-800">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-400 to-indigo-500 overflow-hidden flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 shrink-0">
                    {previewImage ? (
                      <img src={previewImage} className="w-full h-full object-cover" />
                    ) : (
                      <UserOutlined className="text-zinc-300" />
                    )}
                  </div>
                  <div
                    onClick={() => {
                      if (!session) { alert("กรุณาเข้าสู่ระบบเพื่อใช้งานส่วนนี้"); signIn(); return; }
                      setActiveModal("post");
                    }}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-4 py-2.5 text-zinc-500 font-medium cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {isMyProfile 
                      ? `${session?.user?.name?.split(" ")[0]} คุณกำลังคิดอะไรอยู่?`
                      : `เขียนอะไรบางอย่างให้ ${formData.name?.split(" ")[0]}...`
                    }
                  </div>
                </div>
                <hr className="my-4 border-zinc-50 dark:border-zinc-800" />
                <div className="flex justify-center">
                  <div
                    onClick={() => {
                      if (!session) { alert("กรุณาเข้าสู่ระบบเพื่อใช้งานส่วนนี้"); signIn(); return; }
                      setActiveModal("post");
                      setTimeout(() => postImageInputRef.current?.click(), 100);
                    }}
                    className="flex items-center gap-2 text-zinc-500 font-bold text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 py-2 px-4 rounded-lg flex-1 justify-center transition-all"
                  >
                    <PictureOutlined className="text-emerald-500 text-xl" /> รูปภาพ/วิดีโอ
                  </div>
                </div>
              </div>

              {/* People you may know */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 border dark:border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <TeamOutlined className="text-zinc-500" />
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white">People you may know</h3>
                  </div>
                  <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
                    <EllipsisOutlined />
                  </button>
                </div>
                
                <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
                  {allUsers
                    .filter((u) => {
                      const myId = (session?.user as any)?.id;
                      const isMe = String(u._id) === String(myId);
                      const isAlreadyFriend = (formData?.friends || []).some((fId: any) => String(fId) === String(u._id));
                      const isDismissed = dismissedUsers.includes(String(u._id));
                      return !isMe && !isAlreadyFriend && !isDismissed;
                    })
                    .slice(0, 10)
                    .map((u) => {
                      const myFriendsIds = (formData?.friends || []).map((fId: any) => String(fId));
                      const uFriendsIds = (u.friends || []).map((fId: any) => String(fId));
                      const mutualCount = uFriendsIds.filter((fId: any) => myFriendsIds.includes(fId)).length;

                      return (
                        <div 
                          key={String(u._id)} 
                          onClick={() => router.push(`/dashboard/profile/${String(u._id)}`)}
                          className="min-w-[200px] w-[200px] bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border dark:border-zinc-700/50 overflow-hidden flex flex-col snap-start group cursor-pointer hover:shadow-md transition-all"
                        >
                          <div className="relative aspect-square">
                            {u.image ? (
                              <img src={u.image} className="w-full h-full object-cover" alt={u.name} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-700">
                                <UserOutlined className="text-4xl text-zinc-400" />
                              </div>
                            )}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setDismissedUsers(prev => [...prev, String(u._id)]);
                              }}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-all z-10"
                            >
                              <CloseOutlined className="text-[10px]" />
                            </button>
                          </div>
                          <div className="p-3 flex-1 flex flex-col">
                            <h4 className="font-black text-sm text-zinc-900 dark:text-white truncate mb-1">
                              {u.name}
                            </h4>
                            <p className="text-[10px] text-zinc-500 font-bold flex items-center gap-1 mb-4">
                              <TeamOutlined className="text-[8px]" /> {mutualCount} mutual friend{mutualCount !== 1 ? 's' : ''}
                            </p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestFriend(String(u._id));
                              }}
                              className="mt-auto w-full py-2 rounded-lg bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white font-black text-xs transition-all flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white"
                            >
                              <UserAddOutlined /> Add friend
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                <div className="mt-2 text-center">
                  <button className="text-blue-600 font-black text-xs hover:underline">
                    See all
                  </button>
                </div>
              </div>

              {/* Posts Feed */}
              <div className="space-y-4">
                {userPosts.map((post: any) => (
                  <div
                    key={post._id}
                    className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 border dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
                          {formData.image ? (
                            <img
                              src={formData.image}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserOutlined className="text-zinc-300" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-zinc-900 dark:text-white">
                            {formData.name}
                          </h4>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                            {new Date(post.createdAt).toLocaleString("th-TH")} •
                            โลก
                          </p>
                        </div>
                      </div>

                      {(String(post.authorId || post.userId) === String((session?.user as any)?.id) || isMyProfile) && (
                        <div className="relative">
                          <button
                            onClick={() => setOpenPostMenuId(openPostMenuId === post._id ? null : post._id)}
                            className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-all"
                          >
                            <EllipsisOutlined className="text-xl text-zinc-500" />
                          </button>

                          <AnimatePresence>
                            {openPostMenuId === post._id && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl shadow-2xl z-40 py-2 overflow-hidden"
                              >
                                {String(post.authorId || post.userId) === String((session?.user as any)?.id) && (
                                  <div
                                    onClick={() => {
                                      setEditingPostId(post._id);
                                      setPostText(post.content);
                                      const images = post.images || (post.image ? [post.image] : []);
                                      setPostImagePreviews(images.map((src: string) => ({ id: Math.random().toString(36).substring(7), src })));
                                      setActiveModal("post" as any);
                                      setOpenPostMenuId(null);
                                    }}
                                    className="px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-3 text-zinc-600 dark:text-zinc-300 transition-colors"
                                  >
                                    <EditOutlined /> <span className="text-sm font-bold">แก้ไขโพสต์</span>
                                  </div>
                                )}
                                <div
                                  onClick={() => {
                                    handleDeletePost(post._id);
                                    setOpenPostMenuId(null);
                                  }}
                                  className="px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer flex items-center gap-3 text-red-500 transition-colors"
                                >
                                  <DeleteOutlined /> <span className="text-sm font-bold">ลบโพสต์</span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed mb-4 whitespace-pre-wrap">
                      {expandedPosts.includes(post._id) ||
                      (post.content?.length || 0) <= 200 ? (
                        renderContentWithLinks(post.content)
                      ) : (
                        <>
                          {renderContentWithLinks(post.content.slice(0, 200))}
                          ...{" "}
                          <span
                            onClick={() =>
                              setExpandedPosts((prev) => [...prev, post._id])
                            }
                            className="text-zinc-500 font-black cursor-pointer hover:underline ml-1"
                          >
                            ดูเพิ่มเติม
                          </span>
                        </>
                      )}
                    </div>
                    {/* Image Grid */}
                    {(post.images || post.image) && (
                      <div
                        className={`w-full rounded-xl overflow-hidden border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 mb-4 grid gap-1 
                          ${
                            (post.images?.length || 1) === 1
                              ? "grid-cols-1"
                              : "grid-cols-2"
                          }`}
                      >
                        {(post.images || [post.image])
                          .slice(0, 4)
                          .map((img: string, idx: number, arr: string[]) => {
                            const totalImages = (post.images || [post.image])
                              .length;
                            return (
                              <div
                                key={idx}
                                className={`relative overflow-hidden ${
                                  totalImages === 3 && idx === 0
                                    ? "row-span-2 h-full"
                                    : totalImages >= 3
                                      ? "h-[150px] sm:h-[250px]"
                                      : "h-[200px] sm:h-[300px]"
                                } ${totalImages === 1 ? "h-auto" : ""}`}
                              >
                                <img
                                  src={img}
                                  onClick={() =>
                                    setSelectedImage({
                                      images: post.images || [post.image],
                                      index: idx,
                                    })
                                  }
                                  className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-500"
                                  alt={`Post ${idx}`}
                                />
                                {totalImages > 4 && idx === 3 && (
                                  <div
                                    onClick={() =>
                                      setSelectedImage({
                                        images: post.images || [post.image],
                                        index: idx,
                                      })
                                    }
                                    className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer group"
                                  >
                                    <span className="text-white text-3xl font-black group-hover:scale-110 transition-transform">
                                      +{totalImages - 4}
                                    </span>
                                    <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">
                                      ดูรูปภาพเพิ่มเติม
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}

                    <div className="flex items-center justify-between px-2 py-1 mb-2">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                        {(post.likes?.length || 0) > 0 && (
                          <>
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <LikeFilled className="text-white text-[10px]" />
                            </div>
                            <span className="font-bold">
                              {post.likes.length}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-zinc-500 text-sm font-bold">
                        <span>{post.comments?.length || 0} ความคิดเห็น</span>
                      </div>
                    </div>

                    <hr className="border-zinc-100 dark:border-zinc-800 mb-2" />

                    <div className="flex items-center justify-around gap-1">
                      <button
                        onClick={() => handleLikePost(post._id)}
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 ${post.likes?.includes((session?.user as any)?.id) ? "text-blue-600" : "text-zinc-500"}`}
                      >
                        {post.likes?.includes((session?.user as any)?.id) ? (
                          <LikeFilled className="text-lg" />
                        ) : (
                          <LikeOutlined className="text-lg" />
                        )}
                        ถูกใจ
                      </button>
                      <button
                        onClick={() =>
                          setCommentingPostId(
                            commentingPostId === post._id ? null : post._id,
                          )
                        }
                        className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 font-bold text-sm text-zinc-500 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        <CommentOutlined className="text-lg" /> แสดงความคิดเห็น
                      </button>
                      <button
                        onClick={() => setActiveModal("share")}
                        className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 font-bold text-sm text-zinc-500 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        <ShareAltOutlined className="text-lg" /> แชร์
                      </button>
                    </div>

                    {(post.comments?.length > 0 ||
                      commentingPostId === post._id) && (
                      <div className="mt-4 pt-4 border-t dark:border-zinc-800">
                        {/* Comment List */}
                        <div className="space-y-4 mb-6">
                          {post.comments
                            ?.filter((c: any) => !c.parentId)
                            ?.map((comment: any, idx: number) => {
                              const commentId = comment.id || comment._id;
                              const isCommentOwner =
                                String(comment.userId) === String((session?.user as any)?.id) ||
                                (comment.userId?.$oid && String(comment.userId.$oid) === String((session?.user as any)?.id));
                              const isEditing = editingCommentId === commentId;
                              const replies =
                                post.comments?.filter(
                                  (c: any) => c.parentId === commentId,
                                ) || [];

                              return (
                                <div
                                  key={comment.id || idx}
                                  className="space-y-3"
                                >
                                  {/* Main Comment */}
                                  <div className="flex gap-2 group/comment">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 mt-1 shadow-sm border dark:border-zinc-700">
                                      {comment.userImage ? (
                                        <img
                                          src={comment.userImage}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <UserOutlined className="text-zinc-300 text-[10px]" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center gap-2 group">
                                        {isEditing ? (
                                          <div className="flex-1 flex flex-col gap-2">
                                            <textarea
                                              value={editingCommentText}
                                              onChange={(e) =>
                                                setEditingCommentText(
                                                  e.target.value,
                                                )
                                              }
                                              className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 py-2 outline-none text-sm resize-none border dark:border-zinc-700 focus:ring-2 focus:ring-blue-500"
                                              rows={2}
                                            />
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() =>
                                                  handleUpdateComment(
                                                    post._id,
                                                    commentId,
                                                  )
                                                }
                                                className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-xs font-bold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                                              >
                                                บันทึก
                                              </button>
                                              <button
                                                onClick={() =>
                                                  setEditingCommentId(null)
                                                }
                                                className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-full text-xs font-bold hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all active:scale-95"
                                              >
                                                ยกเลิก
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <div className="bg-zinc-100 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl px-3.5 py-2 relative shadow-xs max-w-[90%]">
                                              <p className="text-[11px] font-black text-zinc-900 dark:text-white mb-0.5 hover:underline cursor-pointer">
                                                {comment.userName}
                                              </p>
                                              <p className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-tight">
                                                {comment.text}
                                              </p>
                                              {comment.image && (
                                                <div className="mt-2 rounded-lg overflow-hidden border dark:border-zinc-700 bg-black/5">
                                                  <img
                                                    src={comment.image}
                                                    className="max-w-full h-auto block cursor-pointer hover:opacity-95 transition-opacity"
                                                    onClick={() =>
                                                      setSelectedImage({
                                                        images: [comment.image],
                                                        index: 0,
                                                      })
                                                    }
                                                  />
                                                </div>
                                              )}

                                              {(comment.likes?.length || 0) >
                                                0 && (
                                                <div className="absolute -bottom-1.5 -right-2 flex items-center bg-white dark:bg-zinc-800 rounded-full shadow-md border dark:border-zinc-700 px-1 py-0.5 scale-75 origin-left">
                                                  <div className="flex -space-x-1">
                                                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center ring-1 ring-white dark:ring-zinc-800">
                                                      <LikeFilled className="text-white text-[8px]" />
                                                    </div>
                                                  </div>
                                                  <span className="text-[10px] font-bold text-zinc-500 ml-1">
                                                    {comment.likes.length}
                                                  </span>
                                                </div>
                                              )}
                                            </div>

                                            {isCommentOwner && (
                                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Dropdown
                                                  menu={{
                                                    items: [
                                                      {
                                                        key: "edit",
                                                        label: "แก้ไขคอมเม้น",
                                                        icon: <EditOutlined />,
                                                        onClick: () => {
                                                          setEditingCommentId(
                                                            commentId,
                                                          );
                                                          setEditingCommentText(
                                                            comment.text,
                                                          );
                                                        },
                                                      },
                                                      {
                                                        key: "delete",
                                                        label: "ลบคอมเม้น",
                                                        icon: (
                                                          <DeleteOutlined />
                                                        ),
                                                        danger: true,
                                                        onClick: () =>
                                                          handleDeleteComment(
                                                            post._id,
                                                            commentId,
                                                          ),
                                                      },
                                                    ],
                                                  }}
                                                  trigger={["click"]}
                                                  placement="bottomRight"
                                                >
                                                  <button className="w-7 h-7 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center">
                                                    <EllipsisOutlined className="text-zinc-400" />
                                                  </button>
                                                </Dropdown>
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>

                                      {!isEditing && (
                                        <div className="flex items-center gap-4 pl-3 text-[11px] font-black text-zinc-500 dark:text-zinc-400">
                                          <span className="hover:underline cursor-pointer">
                                            {formatDistanceToNow(
                                              new Date(
                                                comment.createdAt || Date.now(),
                                              ),
                                              { addSuffix: false, locale: th },
                                            )}
                                          </span>
                                          <span
                                            onClick={() =>
                                              handleLikeComment(
                                                post._id,
                                                commentId,
                                              )
                                            }
                                            className={`hover:underline cursor-pointer ${comment.likes?.includes((session?.user as any)?.id) ? "text-blue-600" : "text-zinc-600 dark:text-zinc-300"}`}
                                          >
                                            ถูกใจ
                                          </span>
                                          <span
                                            onClick={() => {
                                              setReplyingTo({
                                                postId: post._id,
                                                commentId: commentId,
                                              });
                                              setNewCommentText("");
                                            }}
                                            className="hover:underline cursor-pointer text-zinc-600 dark:text-zinc-300"
                                          >
                                            ตอบกลับ
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Replies */}
                                  {replies.length > 0 && (
                                    <div className="pl-10 space-y-3 relative">
                                      <div className="absolute left-4 top-0 bottom-4 w-[1.5px] bg-zinc-200 dark:bg-zinc-800" />

                                      {replies.map(
                                        (reply: any, replyIdx: number) => (
                                          <div
                                            key={
                                              reply.id || `reply-${replyIdx}`
                                            }
                                            className="flex gap-2 group/reply relative"
                                          >
                                            <div className="absolute -left-6 top-4 w-6 h-[1.5px] bg-zinc-200 dark:bg-zinc-800" />

                                            <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 mt-1 border dark:border-zinc-700">
                                              {reply.userImage ? (
                                                <img
                                                  src={reply.userImage}
                                                  className="w-full h-full object-cover"
                                                />
                                              ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                  <UserOutlined className="text-zinc-300 text-[8px]" />
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                              <div className="flex items-center gap-2 group">
                                                <div className="bg-zinc-100 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl px-3 py-1.5 shadow-xs max-w-[90%]">
                                                  <p className="text-[10px] font-black text-zinc-900 dark:text-white mb-0.5">
                                                    {reply.userName}
                                                  </p>
                                                  <p className="text-[12px] text-zinc-700 dark:text-zinc-300 leading-tight">
                                                    {reply.text}
                                                  </p>
                                                  {reply.image && (
                                                    <div className="mt-2 rounded-lg overflow-hidden border dark:border-zinc-700 bg-black/5">
                                                      <img
                                                        src={reply.image}
                                                        className="max-w-full h-auto block cursor-pointer hover:opacity-95 transition-opacity"
                                                        onClick={() =>
                                                          setSelectedImage({
                                                            images: [reply.image],
                                                            index: 0,
                                                          })
                                                        }
                                                      />
                                                    </div>
                                                  )}
                                                </div>
                                                {(String(reply.userId) === String((session?.user as any)?.id) || 
                                                  (reply.userId?.$oid && String(reply.userId.$oid) === String((session?.user as any)?.id))) && (
                                                  <Dropdown
                                                    menu={{
                                                      items: [
                                                        {
                                                          key: "edit",
                                                          label: "แก้ไข",
                                                          icon: <EditOutlined />,
                                                          onClick: () => {
                                                            setEditingCommentId(reply.id || reply._id);
                                                            setEditingCommentText(reply.text);
                                                          }
                                                        },
                                                        {
                                                          key: "delete",
                                                          label: "ลบ",
                                                          icon: <DeleteOutlined />,
                                                          danger: true,
                                                          onClick: () => handleDeleteComment(post._id, reply.id || reply._id)
                                                        }
                                                      ]
                                                    }}
                                                    trigger={['click']}
                                                  >
                                                    <button className="opacity-0 group-hover/reply:opacity-100 transition-opacity w-6 h-6 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center">
                                                      <EllipsisOutlined className="text-zinc-400 text-xs" />
                                                    </button>
                                                  </Dropdown>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-4 pl-2 text-[10px] font-black text-zinc-500 dark:text-zinc-400">
                                                <span>
                                                  {formatDistanceToNow(
                                                    new Date(
                                                      reply.createdAt ||
                                                        Date.now(),
                                                    ),
                                                    {
                                                      addSuffix: false,
                                                      locale: th,
                                                    },
                                                  )}
                                                </span>
                                                <span 
                                                  onClick={() => handleLikeComment(post._id, reply.id || reply._id)}
                                                  className={`hover:underline cursor-pointer ${reply.likes?.includes((session?.user as any)?.id) ? "text-blue-600" : ""}`}
                                                >
                                                  ถูกใจ
                                                </span>
                                                <span 
                                                  onClick={() => {
                                                    setReplyingTo({
                                                      postId: post._id,
                                                      commentId: commentId,
                                                    });
                                                    setNewCommentText("");
                                                  }}
                                                  className="hover:underline cursor-pointer"
                                                >
                                                  ตอบกลับ
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  )}

                                  {/* Reply Input */}
                                  {replyingTo?.commentId === comment.id && (
                                    <div className="pl-10 mt-2 relative">
                                      {/* Curved Line connector */}
                                      <div className="absolute -left-6 top-0 w-6 h-6 border-l-[1.5px] border-b-[1.5px] border-zinc-200 dark:border-zinc-800 rounded-bl-xl" />

                                      <div className="flex gap-2 group/reply-input">
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 mt-1 border dark:border-zinc-700 shadow-sm">
                                          {session?.user?.image ? (
                                            <img
                                              src={session.user.image}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                              <UserOutlined className="text-zinc-300 text-[10px]" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 bg-zinc-100 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl p-3 border dark:border-zinc-700/50 shadow-sm focus-within:ring-1 focus-within:ring-blue-500/30 transition-all">
                                          <div className="flex flex-col gap-2">
                                            <input
                                              autoFocus
                                              value={newCommentText}
                                              onChange={(e) =>
                                                setNewCommentText(
                                                  e.target.value,
                                                )
                                              }
                                              onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                handleCommentSubmit(
                                                  post._id,
                                                  commentId,
                                                )
                                              }
                                              placeholder="เขียนตอบกลับ..."
                                              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-zinc-400 min-w-[100px]"
                                            />
                                            {commentImage && (
                                              <div className="relative w-32 h-32 mt-1 group">
                                                <img
                                                  src={commentImage}
                                                  className="w-full h-full object-cover rounded-lg border-2 border-white dark:border-zinc-700 shadow-sm"
                                                />
                                                <button
                                                  onClick={() =>
                                                    setCommentImage(null)
                                                  }
                                                  className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-800 text-white rounded-full flex items-center justify-center text-[12px] hover:bg-zinc-700 shadow-md transition-all"
                                                >
                                                  <CloseOutlined />
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/30">
                                            <div className="flex items-center gap-3">
                                              <Popover
                                                content={
                                                  <div className="grid grid-cols-6 gap-2">
                                                    {[
                                                      "😊",
                                                      "😂",
                                                      "🥰",
                                                      "😮",
                                                      "😢",
                                                      "😡",
                                                      "👍",
                                                      "❤️",
                                                      "🔥",
                                                      "✨",
                                                      "🙌",
                                                      "🙏",
                                                    ].map((emoji) => (
                                                      <span
                                                        key={emoji}
                                                        className="text-xl cursor-pointer hover:scale-125 transition-transform"
                                                        onClick={() =>
                                                          setNewCommentText(
                                                            (prev) =>
                                                              prev + emoji,
                                                          )
                                                        }
                                                      >
                                                        {emoji}
                                                      </span>
                                                    ))}
                                                  </div>
                                                }
                                                trigger="click"
                                                placement="top"
                                              >
                                                <SmileOutlined className="text-zinc-400 hover:text-blue-500 cursor-pointer text-sm transition-colors" />
                                              </Popover>
                                              <CameraOutlined
                                                onClick={startCamera}
                                                className="text-zinc-400 hover:text-blue-500 cursor-pointer text-sm transition-colors"
                                              />
                                              <PictureOutlined
                                                onClick={() =>
                                                  commentImageInputRef.current?.click()
                                                }
                                                className="text-zinc-400 hover:text-blue-500 cursor-pointer text-sm transition-colors"
                                              />
                                            </div>
                                            <button
                                              onClick={() =>
                                                handleCommentSubmit(
                                                  post._id,
                                                  commentId,
                                                )
                                              }
                                              className={`transition-all ${newCommentText.trim() || commentImage ? "text-blue-600 scale-110" : "text-zinc-300"}`}
                                            >
                                              <SendOutlined className="text-lg" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => setReplyingTo(null)}
                                        className="text-[10px] text-zinc-500 hover:underline mt-1 ml-10 font-bold"
                                      >
                                        ยกเลิกการตอบกลับ
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>

                        {/* Comment Input (Moved to bottom) */}
                        {commentingPostId === post._id && (
                          <div className="flex gap-2 mt-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 mt-1 shadow-sm border dark:border-zinc-700">
                              {session?.user?.image ? (
                                <img
                                  src={session.user.image}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <UserOutlined className="text-zinc-300 text-[10px]" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl px-4 py-2 relative border dark:border-zinc-700/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                              <input
                                value={newCommentText}
                                onChange={(e) =>
                                  setNewCommentText(e.target.value)
                                }
                                onKeyDown={(e) =>
                                  e.key === "Enter" &&
                                  handleCommentSubmit(post._id)
                                }
                                placeholder={`แสดงความคิดเห็นในนาม ${session?.user?.name}`}
                                className="w-full bg-transparent outline-none text-[13px] py-1 placeholder:text-zinc-400"
                              />
                              {commentImage && (
                                <div className="relative w-32 h-32 my-2 group">
                                  <img
                                    src={commentImage}
                                    className="w-full h-full object-cover rounded-xl border-2 border-white dark:border-zinc-700 shadow-md"
                                  />
                                  <button
                                    onClick={() => setCommentImage(null)}
                                    className="absolute -top-2 -right-2 w-7 h-7 bg-zinc-800 text-white rounded-full flex items-center justify-center text-sm hover:bg-zinc-700 shadow-lg transition-all"
                                  >
                                    <CloseOutlined />
                                  </button>
                                </div>
                              )}
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700/50">
                                <div className="flex items-center gap-2.5">
                                  <Popover
                                    content={
                                      <div className="grid grid-cols-6 gap-2">
                                        {[
                                          "😊",
                                          "😂",
                                          "🥰",
                                          "😮",
                                          "😢",
                                          "😡",
                                          "👍",
                                          "❤️",
                                          "🔥",
                                          "✨",
                                          "🙌",
                                          "🙏",
                                        ].map((emoji) => (
                                          <span
                                            key={emoji}
                                            className="text-xl cursor-pointer hover:scale-125 transition-transform"
                                            onClick={() =>
                                              setNewCommentText(
                                                (prev) => prev + emoji,
                                              )
                                            }
                                          >
                                            {emoji}
                                          </span>
                                        ))}
                                      </div>
                                    }
                                    trigger="click"
                                    placement="top"
                                  >
                                    <SmileOutlined className="text-zinc-400 hover:text-blue-500 cursor-pointer text-sm transition-colors" />
                                  </Popover>
                                  <CameraOutlined
                                    onClick={startCamera}
                                    className="text-zinc-400 hover:text-blue-500 cursor-pointer text-sm"
                                  />
                                  <PictureOutlined
                                    onClick={() =>
                                      commentImageInputRef.current?.click()
                                    }
                                    className="text-zinc-400 hover:text-blue-500 cursor-pointer text-sm"
                                  />
                                </div>
                                <button
                                  onClick={() => handleCommentSubmit(post._id)}
                                  className={`p-1.5 rounded-full transition-all ${newCommentText.trim() || commentImage ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-zinc-300"}`}
                                >
                                  <SendOutlined className="text-sm" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {userPosts.length === 0 && (
                  <div className="p-10 text-center bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800">
                    <p className="text-zinc-400 font-bold italic">
                      ไม่มีโพสต์ที่จะแสดงในขณะนี้
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      case "เกี่ยวกับ": {
        const renderAboutContent = () => {
          switch (activeAboutTab) {
            case "ข้อมูลภาพรวม":
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
                    <SafetyCertificateOutlined className="text-xl text-zinc-400" />
                    <span>
                      ทำงานที่{" "}
                      <b className="text-zinc-900 dark:text-white">
                        {formData.position || "-"}
                      </b>{" "}
                      ฝ่าย{" "}
                      <b className="text-zinc-900 dark:text-white">
                        {formData.faction || "-"}
                      </b>
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
                    <UserOutlined className="text-xl text-zinc-400" />
                    <span>
                      สังกัด{" "}
                      <b className="text-zinc-900 dark:text-white">
                        {formData.department || "-"}
                      </b>
                    </span>
                  </div>
                  {formData.work && (
                    <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
                      <DatabaseOutlined className="text-xl text-zinc-400" />
                      <span>
                        เคยทำงานที่{" "}
                        <b className="text-zinc-900 dark:text-white">
                          {formData.work}
                        </b>
                      </span>
                    </div>
                  )}
                  {formData.currentCity && (
                    <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
                      <GlobalOutlined className="text-xl text-zinc-400" />
                      <span>
                        อาศัยอยู่ที่{" "}
                        <b className="text-zinc-900 dark:text-white">
                          {formData.currentCity}
                        </b>
                      </span>
                    </div>
                  )}
                </div>
              );
            case "การทำงานและวุฒิการศึกษา":
              return (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-zinc-500 text-xs font-bold uppercase mb-4">
                      การทำงาน
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <DatabaseOutlined />
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          {formData.work || "ยังไม่ได้เพิ่มสถานที่ทำงาน"}
                        </p>
                        <p className="text-xs text-zinc-400">สถานที่ทำงาน</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-zinc-500 text-xs font-bold uppercase mb-4">
                      วุฒิการศึกษา
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <SafetyCertificateOutlined />
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          {formData.education ||
                            "ยังไม่ได้เพิ่มประวัติการศึกษา"}
                        </p>
                        <p className="text-xs text-zinc-400">
                          มหาวิทยาลัย/โรงเรียน
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            case "สถานที่ที่เคยอาศัย":
              return (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <GlobalOutlined />
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {formData.currentCity || "ยังไม่ได้เพิ่มเมืองปัจจุบัน"}
                      </p>
                      <p className="text-xs text-zinc-400">เมืองปัจจุบัน</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <GlobalOutlined />
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {formData.hometown || "ยังไม่ได้เพิ่มบ้านเกิด"}
                      </p>
                      <p className="text-xs text-zinc-400">บ้านเกิด</p>
                    </div>
                  </div>
                </div>
              );
            case "ข้อมูลติดต่อและข้อมูลพื้นฐาน":
              return (
                <div className="space-y-8">
                  <div className="grid gap-6">
                    <h3 className="text-zinc-500 text-xs font-bold uppercase">
                      ข้อมูลการติดต่อ
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <PhoneOutlined />
                      </div>
                      <div>
                        <a
                          href={`tel:${formData.phone}`}
                          className="text-sm font-bold text-blue-600 hover:underline"
                        >
                          {formData.phone || "-"}
                        </a>
                        <p className="text-xs text-zinc-400">โทรศัพท์</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <MailOutlined />
                      </div>
                      <div>
                        <a
                          href={`mailto:${formData.email}`}
                          className="text-sm font-bold text-blue-600 hover:underline"
                        >
                          {formData.email || "-"}
                        </a>
                        <p className="text-xs text-zinc-400">อีเมล</p>
                      </div>
                    </div>
                  </div>
                  <hr className="dark:border-zinc-800" />
                  <div className="grid gap-6">
                    <h3 className="text-zinc-500 text-xs font-bold uppercase">
                      ข้อมูลพื้นฐาน
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <UserOutlined />
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          {formData.relationship || "ไม่ระบุ"}
                        </p>
                        <p className="text-xs text-zinc-400">
                          สถานะความสัมพันธ์
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            default:
              return null;
          }
        };

        return (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-800 p-6 min-h-[500px]">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-6">
              เกี่ยวกับ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4 border-r dark:border-zinc-800 pr-4 space-y-1">
                {[
                  "ข้อมูลภาพรวม",
                  "การทำงานและวุฒิการศึกษา",
                  "สถานที่ที่เคยอาศัย",
                  "ข้อมูลติดต่อและข้อมูลพื้นฐาน",
                ].map((item) => (
                  <div
                    key={item}
                    onClick={() => setActiveAboutTab(item)}
                    className={`px-4 py-3 rounded-lg font-bold text-sm cursor-pointer transition-all ${activeAboutTab === item ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="md:col-span-8">{renderAboutContent()}</div>
            </div>
          </div>
        );
      }

      case "เพื่อน": {
        const filteredUsers = allUsers.filter(
          (u) =>
            String(u._id) !== String(id) &&
            (formData?.friends || []).some((fId: any) => String(fId) === String(u._id)) &&
            (u.name?.toLowerCase().includes(searchFriend.toLowerCase()) ||
              u.username?.toLowerCase().includes(searchFriend.toLowerCase()) ||
              u.department?.toLowerCase().includes(searchFriend.toLowerCase())),
        );

        return (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-800 p-6 min-h-[600px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                  เพื่อน
                </h2>
                <p className="text-sm text-zinc-400 font-bold tracking-tight">
                  เพื่อนทั้งหมด {(formData?.friends || []).length} คน
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchFriend}
                  onChange={(e) => setSearchFriend(e.target.value)}
                  placeholder="ค้นหาตามชื่อ หรือ แผนก..."
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-full px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((u) => (
                <div
                  key={String(u._id)}
                  onClick={() => {
                    if (String(u._id) === String(id)) return;
                    router.push(`/dashboard/profile/${String(u._id)}`);
                  }}
                  className="group flex items-center gap-4 p-4 rounded-2xl border dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5"
                >
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-linear-to-tr from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center shrink-0">
                    {u.image ? (
                      <img
                        src={u.image}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        alt={u.name}
                      />
                    ) : (
                      <UserOutlined className="text-2xl text-zinc-400" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-black text-sm text-zinc-900 dark:text-white truncate">
                      {u.name}
                    </h4>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-0.5 truncate">
                      {u.position || "สมาชิก"}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-bold truncate">
                      {u.department || "ไม่มีสังกัด"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "รูปภาพ": {
        return (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-800 p-6">
            <h2 className="text-2xl font-black mb-6">รูปภาพ</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {userPosts
                .filter((p) => p.image)
                .map((post: any) => (
                  <div
                    key={post._id}
                    className="aspect-square rounded-lg bg-zinc-100 dark:bg-zinc-800 border dark:border-zinc-700 hover:scale-[1.02] transition-transform cursor-pointer overflow-hidden"
                  >
                    <img
                      src={post.image}
                      className="w-full h-full object-cover"
                      alt="User gallery"
                    />
                  </div>
                ))}
              {userPosts.filter((p) => p.image).length === 0 && (
                <div className="col-span-full py-20 text-center text-zinc-400 font-bold italic">
                  ไม่พบรูปภาพที่จะแสดง
                </div>
              )}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-zinc-950 transition-colors duration-500 pb-20">
      <motion.div
        className="max-w-[1200px] mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header Section */}
        <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-b-xl overflow-hidden mb-4 border-b dark:border-zinc-800">
          <div className="h-[180px] sm:h-[300px] lg:h-[400px] relative bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            {formData.coverImage && (
              <img
                src={formData.coverImage}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          </div>

          <div className="px-2 pb-4 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pt-10 -mt-12 sm:-mt-20 mb-6 px-2">
              <div className="relative group">
                <div className="h-40 w-40 sm:h-44 sm:w-44 lg:h-48 lg:w-48 rounded-full overflow-hidden border-4 border-white dark:border-zinc-900 bg-white dark:bg-zinc-800 shadow-xl transition-transform group-hover:scale-[1.01]">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      className="w-full h-full object-cover"
                      alt="Profile"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 text-zinc-200">
                      <UserOutlined className="text-6xl" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left mb-2 z-10 overflow-hidden">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight truncate">
                  {formData.name}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg mt-1 mb-4 flex items-center justify-center sm:justify-start gap-2 truncate">
                  <span className="text-blue-600 dark:text-blue-400">
                    @{formData.username}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300" />
                  <span className="opacity-80">
                    {formData.position || "สมาชิก"}
                  </span>
                </p>
                <div className="flex items-center justify-center sm:justify-start -space-x-2">
                  {allUsers
                    .filter(
                      (u) =>
                        String(u._id) !== String(id) &&
                        (formData?.friends || []).some((fId: any) => String(fId) === String(u._id))
                    )
                    .slice(0, 8)
                    .map((u) => (
                      <div
                        key={String(u._id)}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 overflow-hidden shadow-sm flex items-center justify-center"
                      >
                        {u.image ? (
                          <img
                            src={u.image}
                            className="w-full h-full object-cover"
                            alt="Friend"
                          />
                        ) : (
                          <UserOutlined className="text-[10px] text-zinc-400" />
                        )}
                      </div>
                    ))}
                  <span className="ml-4 text-sm font-bold text-zinc-400 tracking-tight">
                    เพื่อน {(formData?.friends || []).length} คน
                  </span>
                </div>
              </div>
              <div className="flex gap-2 z-10">
                {isMyProfile ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveModal("profile")}
                      className="px-6 py-2 rounded-lg bg-blue-600 text-white font-black flex items-center gap-2 transition-all hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-600/20"
                    >
                      <EditOutlined /> แก้ไขโปรไฟล์
                    </button>
                    <button
                      onClick={() => setActiveModal("security")}
                      className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 transition-all active:scale-95 border dark:border-zinc-700"
                    >
                      <SettingOutlined className="text-xl text-zinc-600 dark:text-zinc-400" />
                    </button>
                  </div>
                ) : (
                  <>
                    {friendStatus === "none" && (
                      <button
                        onClick={handleAddFriend}
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-black flex items-center gap-2 transition-all hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-600/20"
                      >
                        <UserOutlined /> เพิ่มเพื่อน
                      </button>
                    )}
                    {friendStatus === "request_sent" && (
                      <button
                        className="px-6 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-black flex items-center gap-2 cursor-default"
                      >
                        <SafetyCertificateOutlined /> ส่งคำขอแล้ว
                      </button>
                    )}
                    {friendStatus === "request_received" && (
                      <button
                        onClick={handleAcceptFriend}
                        className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-black flex items-center gap-2 transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/20"
                      >
                        <CheckCircleFilled /> ยอมรับเป็นเพื่อน
                      </button>
                    )}
                    {friendStatus === "friends" && (
                      <Popconfirm
                        title="เลิกเป็นเพื่อน"
                        description="คุณต้องการเลิกเป็นเพื่อนกับผู้ใช้นี้ใช่หรือไม่?"
                        onConfirm={handleUnfriend}
                        okText="ใช่, เลิกเป็นเพื่อน"
                        cancelText="ยกเลิก"
                        okButtonProps={{ danger: true }}
                      >
                        <button
                          className="px-6 py-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-black flex items-center gap-2 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-all border border-blue-100 dark:border-blue-500/20 hover:border-rose-100 dark:hover:border-rose-500/20 shadow-sm"
                        >
                          <TeamOutlined /> เพื่อน
                        </button>
                      </Popconfirm>
                    )}
                    <button className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-black flex items-center gap-2 transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95">
                      <MessageOutlined /> ข้อความ
                    </button>
                  </>
                )}
              </div>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800 hidden sm:block" />
            <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mt-1 sm:-mb-1 px-1 overflow-x-auto no-scrollbar">
              {["โพสต์", "เกี่ยวกับ", "เพื่อน", "รูปภาพ"].map((tab) => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-bold text-sm sm:text-base cursor-pointer whitespace-nowrap transition-all relative group ${
                    activeTab === tab
                      ? "text-blue-600"
                      : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="active-tab-line"
                      className="absolute bottom-0 left-4 right-4 h-1 bg-blue-600 rounded-t-full"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 px-4 sm:px-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>

        {/* Share Modal */}
        <ProfileModal
          isOpen={activeModal === "share"}
          onClose={() => setActiveModal(null)}
          title="แชร์โปรไฟล์"
          saving={false}
          onSubmit={() => setActiveModal(null)}
        >
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
              <ShareAltOutlined className="text-3xl text-blue-500" />
            </div>
            <div>
              <h4 className="text-lg font-black dark:text-white">
                ฟีเจอร์แชร์โปรไฟล์
              </h4>
              <p className="text-zinc-500">
                กําลังพัฒนาระบบการแชร์ลิงก์และคิวอาร์โค้ด...
              </p>
            </div>
          </div>
        </ProfileModal>

      <ProfileModal
        isOpen={activeModal === "profile"}
        title="แก้ไขข้อมูลโปรไฟล์"
        onClose={() => setActiveModal(null)}
        onSubmit={handleSubmit}
        saving={saving}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-zinc-400">รูปประจำตัว</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all overflow-hidden"
              >
                {previewImage ? (
                  <img src={previewImage} className="w-full h-full object-cover" />
                ) : (
                  <CameraOutlined className="text-3xl text-zinc-300" />
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} hidden accept="image/*" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-zinc-400">รูปหน้าปก</label>
              <div 
                onClick={() => coverInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all overflow-hidden"
              >
                {previewCover ? (
                  <img src={previewCover} className="w-full h-full object-cover" />
                ) : (
                  <PictureOutlined className="text-3xl text-zinc-300" />
                )}
                <input type="file" ref={coverInputRef} onChange={handleCoverChange} hidden accept="image/*" />
              </div>
            </div>
          </div>
          
          <div className="grid gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-zinc-500 uppercase">ชื่อ-นามสกุล</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-500 uppercase">เบอร์โทรศัพท์</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-500 uppercase">Line ID</label>
                <input
                  value={formData.lineId}
                  onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-500 uppercase">ตำแหน่ง</label>
                <input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-500 uppercase">แผนก</label>
                <input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-500 uppercase">การทำงาน</label>
                <input
                  value={formData.work}
                  onChange={(e) => setFormData({ ...formData, work: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-500 uppercase">การศึกษา</label>
                <input
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </ProfileModal>

      <ProfileModal
        isOpen={activeModal === "security"}
        title="ความปลอดภัยและรหัสผ่าน"
        onClose={() => setActiveModal(null)}
        onSubmit={handleSubmit}
        saving={saving}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-zinc-500 uppercase">รหัสผ่านใหม่</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-zinc-500 uppercase">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="ยืนยันรหัสผ่านอีกครั้ง"
            />
          </div>
        </div>
      </ProfileModal>

      <ProfileModal
        isOpen={activeModal === "intro"}
        title="แก้ไขคำแนะนำตัว"
        onClose={() => setActiveModal(null)}
        onSubmit={handleSubmit}
        saving={saving}
      >
        <div className="space-y-4">
          <label className="text-xs font-black text-zinc-500 uppercase">คำแนะนำตัวสั้นๆ</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full h-32 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="เขียนอะไรบางอย่างเกี่ยวกับคุณ..."
          />
        </div>
      </ProfileModal>

      <ProfileModal
        isOpen={activeModal === "post"}
        title={editingPostId ? "แก้ไขโพสต์" : "สร้างโพสต์ใหม่"}
        onClose={() => {
          setActiveModal(null);
          setEditingPostId(null);
          setPostText("");
          setPostImagePreviews([]);
        }}
        onSubmit={handleCreatePost}
        saving={isPosting}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              {previewImage && <img src={previewImage} className="w-full h-full object-cover" />}
            </div>
            <div>
              <p className="font-black text-zinc-900 dark:text-white">{formData.name}</p>
              <button 
                onClick={(e) => { e.preventDefault(); setShowAudienceMenu(!showAudienceMenu); }}
                className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold text-zinc-500"
              >
                <GlobalOutlined /> {postAudience === "public" ? "สาธารณะ" : postAudience === "friends" ? "เพื่อน" : "เฉพาะฉัน"} <DownOutlined className="text-[8px]" />
              </button>
            </div>
          </div>
          
          <textarea
            autoFocus
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder={isMyProfile ? `${formData.name?.split(" ")[0]} คุณกำลังคิดอะไรอยู่?` : `เขียนอะไรบางอย่างให้ ${formData.name?.split(" ")[0]}...`}
            className="w-full min-h-[150px] bg-transparent border-none text-lg placeholder:text-zinc-400 focus:ring-0 resize-none dark:text-white"
          />

          <div className="grid grid-cols-3 gap-2">
            <SortableContext items={postImagePreviews.map(i => i.id)} strategy={rectSortingStrategy}>
              {postImagePreviews.map((item, idx) => (
                <SortableItem key={item.id} item={item} idx={idx} onRemove={removeImage} />
              ))}
            </SortableContext>
            
            <button
              onClick={() => postImageInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-zinc-400"
            >
              <PictureOutlined className="text-2xl mb-1" />
              <span className="text-[10px] font-black uppercase">เพิ่มรูป</span>
              <input type="file" ref={postImageInputRef} onChange={handlePostImageChange} multiple hidden accept="image/*" />
            </button>
          </div>
        </div>
      </ProfileModal>
      </motion.div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-100 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            {/* Navigation Buttons */}
            {selectedImage.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage((prev) =>
                      prev
                        ? {
                            ...prev,
                            index:
                              (prev.index - 1 + prev.images.length) %
                              prev.images.length,
                          }
                        : null,
                    );
                  }}
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-50 border border-white/20"
                >
                  <LeftOutlined className="text-xl" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage((prev) =>
                      prev
                        ? {
                            ...prev,
                            index: (prev.index + 1) % prev.images.length,
                          }
                        : null,
                    );
                  }}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-50 border border-white/20"
                >
                  <RightOutlined className="text-xl" />
                </button>
              </>
            )}

            <motion.div
              key={selectedImage.index}
              initial={{ scale: 0.9, opacity: 0, x: 20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.9, opacity: 0, x: -20 }}
              className="relative max-w-6xl w-full flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative group">
                <img
                  src={selectedImage.images[selectedImage.index]}
                  className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl mx-auto"
                  alt="Full view"
                />

                {/* Photo Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-black border border-white/10">
                  {selectedImage.index + 1} / {selectedImage.images.length}
                </div>
              </div>

              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-14 right-0 text-white/70 hover:text-white transition-colors p-2"
              >
                <CloseOutlined className="text-3xl" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden input for comment image */}
      <input
        type="file"
        ref={commentImageInputRef}
        onChange={handleCommentImageSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800"
            >
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 border-20 border-black/20 pointer-events-none" />
              </div>
              <div className="p-6 flex justify-between items-center bg-zinc-900">
                <button
                  onClick={stopCamera}
                  className="px-6 py-2 rounded-xl font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={takePhoto}
                  className="w-16 h-16 rounded-full bg-white border-4 border-zinc-700 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-xl"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-zinc-200" />
                </button>
                <div className="w-20" /> {/* Spacer */}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
