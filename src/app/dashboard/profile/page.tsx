/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import FullPageLoader from "@/components/FullPageLoader";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  MessageOutlined,
  LockOutlined,
  CameraOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  SaveOutlined,
  PictureOutlined,
  EditOutlined,
  CloseOutlined,
  DownOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  EllipsisOutlined,
  DeleteOutlined,
  LikeOutlined,
  LikeFilled,
  CommentOutlined,
  ShareAltOutlined,
  SendOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useSession, signIn } from "next-auth/react";

// Stable Modal Component (defined outside to prevent re-mounts on state change)
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

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
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
  const [postAudience, setPostAudience] = useState<
    "public" | "friends" | "private"
  >("public");
  const [showAudienceMenu, setShowAudienceMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("โพสต์");
  const [activeAboutTab, setActiveAboutTab] = useState("ข้อมูลภาพรวม");
  const [showSettings, setShowSettings] = useState(false);

  // Post states
  const [postText, setPostText] = useState("");
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchFriend, setSearchFriend] = useState("");

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
    relationship: "โสด",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            username: data.username || "",
            email: data.email || "",
            phone: data.phone || "",
            lineId: data.lineId || "",
            role: data.role || "",
            department: data.department || "ไม่มีสังกัด",
            position: data.position || "",
            faction: data.faction || "",
            description: data.description || "",
            program: data.program || "", // Added program
            image: data.image || "",
            coverImage: data.coverImage || "",
            password: "",
            confirmPassword: "",
            friends: data.friends || [],
            work: data.work || "",
            education: data.education || "",
            currentCity: data.currentCity || "",
            hometown: data.hometown || "",
            relationship: data.relationship || "โสด",
          });
          if (data.image) setPreviewImage(data.image);
          if (data.coverImage) setPreviewCover(data.coverImage);
        }
      } catch (error) {
        console.error("Load profile error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        if (res.ok) {
          const data = await res.json();
          // Filter for current user or just show all for now?
          // Usually profiles show only user's posts.
          setUserPosts(data);
        }
      } catch (error) {
        console.error("Fetch posts error:", error);
      }
    };

    const fetchAllUsers = async () => {
      try {
        const res = await fetch("/api/users/all");
        if (res.ok) {
          const data = await res.json();
          setAllUsers(data.users || []);
        }
      } catch (error) {
        console.error("Fetch all users error:", error);
      }
    };

    fetchProfile();
    fetchUserPosts();
    fetchAllUsers();
  }, []);

  // Fix: Scroll to top after loading finishes
  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [loading]);

  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPostImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!session) {
      alert("กรุณาเข้าสู่ระบบก่อนโพสต์");
      signIn();
      return;
    }
    if (!postText.trim() && !postImagePreview) return;

    setIsPosting(true);
    try {
      let imageUrl = "";
      if (postImagePreview) {
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: postImagePreview, folder: "posts" }),
        });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const method = editingPostId ? "PUT" : "POST";
      const url = editingPostId ? `/api/posts/${editingPostId}` : "/api/posts";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Profile Post",
          content: postText,
          image: imageUrl || (editingPostId ? postImagePreview : ""), // Keep old image if not changed
        }),
      });

      if (res.ok) {
        setPostText("");
        setPostImagePreview(null);
        setEditingPostId(null);
        setActiveModal(null);
        // Refresh posts
        const postsRes = await fetch("/api/posts");
        const postsData = await postsRes.json();
        setUserPosts(postsData);
      }
    } catch (error) {
      console.error("Post error:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("คุณต้องการลบโพสต์นี้ใช่หรือไม่?")) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUserPosts((prev) => prev.filter((p) => p._id !== id));
      } else {
        const err = await res.json();
        alert("ลบโพสต์ไม่สำเร็จ: " + (err.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Delete post error:", error);
    }
  };

  async function handleLikePost(id: string) {
    if (!session) {
      alert("กรุณาเข้าสู่ระบบก่อนกดถูกใจ");
      signIn();
      return;
    }
    console.log("Liking post:", id);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "LIKE" }),
      });
      if (res.ok) {
        const postsRes = await fetch("/api/posts");
        const postsData = await postsRes.json();
        setUserPosts(postsData);
      } else {
        const err = await res.json();
        console.error("Like failed:", err);
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  }

  async function handleCommentSubmit(postId: string) {
    if (!session) {
      alert("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
      signIn();
      return;
    }
    if (!newCommentText.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "COMMENT", text: newCommentText }),
      });
      if (res.ok) {
        setNewCommentText("");
        setCommentingPostId(null);
        const postsRes = await fetch("/api/posts");
        const postsData = await postsRes.json();
        setUserPosts(postsData);
      }
    } catch (error) {
      console.error("Comment error:", error);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCover(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("❌ รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
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
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        setActiveModal(null);
        router.refresh();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("❌ เกิดข้อผิดพลาด");
      }
    } catch (_error) {
      alert("❌ เชื่อมต่อ Server ไม่ได้");
    } finally {
      setSaving(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  if (loading) {
    return <FullPageLoader message="กำลังรวบรวมข้อมูลผู้ใช้งาน..." />;
  }

  // Content renderers for different tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case "โพสต์":
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
                  <button
                    onClick={() => setActiveModal("intro")}
                    className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-bold text-sm hover:bg-zinc-200"
                  >
                    แก้ไขคำแนะนำตัว
                  </button>
                  <div className="space-y-3 py-2">
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
                    <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                      <MailOutlined className="text-zinc-400 text-xl" />
                      <span className="text-sm">
                        อีเมล{" "}
                        <b className="text-zinc-900 dark:text-white">
                          {formData.email || "-"}
                        </b>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                      <PhoneOutlined className="text-zinc-400 text-xl" />
                      <span className="text-sm">
                        โทรศัพท์{" "}
                        <b className="text-zinc-900 dark:text-white">
                          {formData.phone || "-"}
                        </b>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                      <MessageOutlined className="text-zinc-400 text-xl" />
                      <span className="text-sm">
                        LINE ID{" "}
                        <b className="text-zinc-900 dark:text-white">
                          {formData.lineId || "-"}
                        </b>
                      </span>
                    </div>
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
                    <h2 className="text-xl font-black mb-0">เพื่อนร่วมงาน</h2>
                    <p className="text-xs text-zinc-400 font-bold">
                      {allUsers.length} คน
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
                  {allUsers.slice(0, 9).map((u) => (
                    <div
                      key={u._id}
                      onClick={() => router.push(`/dashboard/profile/${u._id}`)}
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
                  {allUsers.length === 0 && (
                    <div className="col-span-3 py-4 text-center text-zinc-400 text-xs italic">
                      กำลังโหลดข้อมูลเพื่อนร่วมงาน...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {/* What's on your mind? */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 border dark:border-zinc-800">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-400 to-indigo-500 overflow-hidden flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserOutlined className="text-zinc-300" />
                    )}
                  </div>
                  <div
                    onClick={() => {
                      if (!session) {
                        alert("กรุณาเข้าสู่ระบบเพื่อใช้งานส่วนนี้");
                        signIn();
                        return;
                      }
                      setActiveModal("post");
                    }}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-4 py-2.5 text-zinc-500 font-medium cursor-pointer hover:bg-zinc-200 transition-colors"
                  >
                    {!session
                      ? "เข้าสู่ระบบเพื่อเริ่มโพสต์..."
                      : `คุณกำลังคิดอะไรอยู่ ${formData.name?.split(" ")[0]}?`}
                  </div>
                </div>
                <hr className="my-4 border-zinc-50 dark:border-zinc-800" />
                <div className="flex justify-center">
                  <div
                    onClick={() => {
                      if (!session) {
                        alert("กรุณาเข้าสู่ระบบเพื่อใช้งานส่วนนี้");
                        signIn();
                        return;
                      }
                      setActiveModal("post");
                      // Delay a bit to let modal open then trigger input
                      setTimeout(() => postImageInputRef.current?.click(), 100);
                    }}
                    className="flex items-center gap-2 text-zinc-500 font-bold text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 py-2 px-4 rounded-lg flex-1 justify-center transition-all"
                  >
                    <PictureOutlined className="text-emerald-500 text-xl" />{" "}
                    รูปภาพ/วิดีโอ
                  </div>
                </div>
              </div>

              {/* Mock Posts Feed */}
              <div className="space-y-4">
                {userPosts.map((post: any) => (
                  <div
                    key={post._id}
                    className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 border dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-400 to-indigo-500 overflow-hidden flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                          {previewImage ? (
                            <img
                              src={previewImage}
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

                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenPostMenuId(
                              openPostMenuId === post._id ? null : post._id,
                            )
                          }
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
                              <div
                                onClick={() => {
                                  setEditingPostId(post._id);
                                  setPostText(post.content);
                                  setPostImagePreview(post.image);
                                  setActiveModal("post");
                                  setOpenPostMenuId(null);
                                }}
                                className="px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-3 transition-colors"
                              >
                                <EditOutlined className="text-zinc-400" />
                                <span className="text-sm font-bold">
                                  แก้ไขโพสต์
                                </span>
                              </div>
                              <div
                                onClick={() => {
                                  handleDeletePost(post._id);
                                  setOpenPostMenuId(null);
                                }}
                                className="px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer flex items-center gap-3 transition-colors text-red-500"
                              >
                                <DeleteOutlined />
                                <span className="text-sm font-bold">
                                  ลบโพสต์
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed mb-4 whitespace-pre-wrap">
                      {post.content}
                    </p>
                    {post.image && (
                      <div className="w-full rounded-xl overflow-hidden border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 mb-4">
                        <img
                          src={post.image}
                          className="w-full h-auto max-h-[500px] object-contain mx-auto"
                          alt="Post content"
                        />
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
                        <span>0 แชร์</span>
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
                        )}{" "}
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

                    {commentingPostId === post._id && (
                      <div className="mt-4 pt-4 border-t dark:border-zinc-800">
                        <div className="flex gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                            {previewImage && (
                              <img
                                src={previewImage}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 relative">
                            <input
                              value={newCommentText}
                              onChange={(e) =>
                                setNewCommentText(e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                handleCommentSubmit(post._id)
                              }
                              placeholder="เขียนความคิดเห็น..."
                              className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-2 pr-10 outline-none text-sm"
                            />
                            <button
                              onClick={() => handleCommentSubmit(post._id)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:scale-110 transition-transform"
                            >
                              <SendOutlined />
                            </button>
                          </div>
                        </div>

                        {post.comments?.map((comment: any, idx: number) => (
                          <div key={idx} className="flex gap-3 mb-3 last:mb-0">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0" />
                            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-2 flex-1">
                              <p className="text-xs font-black text-zinc-900 dark:text-white">
                                {comment.userName}
                              </p>
                              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {userPosts.length === 0 && (
                  <div className="p-10 text-center bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800">
                    <p className="text-zinc-400 font-bold italic font-serif">
                      ไม่มีโพสต์ที่จะแสดงในขณะนี้
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "เกี่ยวกับ":
        const renderAboutContent = () => {
          switch (activeAboutTab) {
            case "ข้อมูลภาพรวม":
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
                    <SafetyCertificateOutlined className="text-xl text-zinc-400" />
                    <span>ทำงานที่ <b className="text-zinc-900 dark:text-white">{formData.position || "-"}</b> ฝ่าย <b className="text-zinc-900 dark:text-white">{formData.faction || "-"}</b></span>
                  </div>
                  <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
                    <UserOutlined className="text-xl text-zinc-400" />
                    <span>สังกัด <b className="text-zinc-900 dark:text-white">{formData.department || "-"}</b></span>
                  </div>
                  {formData.work && (
                    <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
                      <DatabaseOutlined className="text-xl text-zinc-400" />
                      <span>เคยทำงานที่ <b className="text-zinc-900 dark:text-white">{formData.work}</b></span>
                    </div>
                  )}
                  {formData.currentCity && (
                    <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
                      <GlobalOutlined className="text-xl text-zinc-400" />
                      <span>อาศัยอยู่ที่ <b className="text-zinc-900 dark:text-white">{formData.currentCity}</b></span>
                    </div>
                  )}
                </div>
              );
            case "การทำงานและวุฒิการศึกษา":
              return (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-zinc-500 text-xs font-bold uppercase mb-4">การทำงาน</h3>
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <DatabaseOutlined />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{formData.work || "ยังไม่ได้เพิ่มสถานที่ทำงาน"}</p>
                          <p className="text-xs text-zinc-400">สถานที่ทำงาน</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveModal("profile")} className="text-blue-600 font-bold text-xs">แก้ไข</button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-zinc-500 text-xs font-bold uppercase mb-4">วุฒิการศึกษา</h3>
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <SafetyCertificateOutlined />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{formData.education || "ยังไม่ได้เพิ่มประวัติการศึกษา"}</p>
                          <p className="text-xs text-zinc-400">มหาวิทยาลัย/โรงเรียน</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveModal("profile")} className="text-blue-600 font-bold text-xs">แก้ไข</button>
                    </div>
                  </div>
                </div>
              );
            case "สถานที่ที่เคยอาศัย":
              return (
                <div className="space-y-8">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <GlobalOutlined />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{formData.currentCity || "ยังไม่ได้เพิ่มเมืองปัจจุบัน"}</p>
                        <p className="text-xs text-zinc-400">เมืองปัจจุบัน</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveModal("profile")} className="text-blue-600 font-bold text-xs">แก้ไข</button>
                  </div>
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <GlobalOutlined />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{formData.hometown || "ยังไม่ได้เพิ่มบ้านเกิด"}</p>
                        <p className="text-xs text-zinc-400">บ้านเกิด</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveModal("profile")} className="text-blue-600 font-bold text-xs">แก้ไข</button>
                  </div>
                </div>
              );
            case "ข้อมูลติดต่อและข้อมูลพื้นฐาน":
              return (
                <div className="space-y-8">
                  <div className="grid gap-6">
                    <h3 className="text-zinc-500 text-xs font-bold uppercase">ข้อมูลการติดต่อ</h3>
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <PhoneOutlined />
                        </div>
                        <div>
                          <a href={`tel:${formData.phone}`} className="text-sm font-bold text-blue-600 hover:underline">{formData.phone || "-"}</a>
                          <p className="text-xs text-zinc-400">โทรศัพท์</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <MailOutlined />
                        </div>
                        <div>
                          <a href={`mailto:${formData.email}`} className="text-sm font-bold text-blue-600 hover:underline">{formData.email || "-"}</a>
                          <p className="text-xs text-zinc-400">อีเมล</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="dark:border-zinc-800" />
                  <div className="grid gap-6">
                    <h3 className="text-zinc-500 text-xs font-bold uppercase">ข้อมูลพื้นฐาน</h3>
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <UserOutlined />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{formData.relationship || "ไม่ระบุ"}</p>
                          <p className="text-xs text-zinc-400">สถานะความสัมพันธ์</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveModal("profile")} className="text-blue-600 font-bold text-xs">แก้ไข</button>
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
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-6">เกี่ยวกับ</h2>
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
              <div className="md:col-span-8">
                {renderAboutContent()}
              </div>
            </div>
          </div>
        );

      case "เพื่อน":
        const filteredUsers = allUsers.filter(u => 
          u.name?.toLowerCase().includes(searchFriend.toLowerCase()) ||
          u.username?.toLowerCase().includes(searchFriend.toLowerCase()) ||
          u.department?.toLowerCase().includes(searchFriend.toLowerCase())
        );

        return (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-800 p-6 min-h-[600px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">เพื่อนร่วมงาน</h2>
                <p className="text-sm text-zinc-400 font-bold tracking-tight">บุคลากรทั้งหมด {allUsers.length} คน</p>
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
                  key={u._id}
                  onClick={() => router.push(`/dashboard/profile/${u._id}`)}
                  className="group flex items-center gap-4 p-4 rounded-2xl border dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5"
                >
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-linear-to-tr from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center shrink-0">
                    {u.image ? (
                      <img src={u.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={u.name} />
                    ) : (
                      <UserOutlined className="text-2xl text-zinc-400" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-black text-sm text-zinc-900 dark:text-white truncate">{u.name}</h4>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-0.5 truncate">{u.position || "สมาชิก"}</p>
                    <p className="text-[10px] text-zinc-400 font-bold truncate">
                      {u.department || "ไม่มีสังกัด"}
                    </p>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <p className="text-zinc-400 font-bold italic">ไม่พบข้อมูลเพื่อนร่วมงานที่ค้นหา</p>
                </div>
              )}
            </div>
          </div>
        );

      case "รูปภาพ":
        return (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">รูปภาพ</h2>
              <button className="text-blue-600 font-bold text-sm bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
                เพิ่มรูปภาพ/วิดีโอ
              </button>
            </div>
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

      default:
        return (
          <div className="p-20 text-center text-zinc-400 font-bold">
            ฟีเจอร์นี้กำลังอยู่ระหว่างการพัฒนา...
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-zinc-950 transition-colors duration-500 pb-20">
      <motion.div
        className="max-w-[1200px] mx-auto shadow-sm"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* --- Modals --- */}
        <ProfileModal
          isOpen={activeModal === "profile"}
          onClose={() => setActiveModal(null)}
          title="แก้ไขข้อมูลพื้นฐาน"
          saving={saving}
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">
                ชื่อ-นามสกุล
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">
                  LINE ID
                </label>
                <input
                  type="text"
                  value={formData.lineId}
                  onChange={(e) =>
                    setFormData({ ...formData, lineId: e.target.value })
                  }
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">
                อีเมลติดต่อ
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <hr className="dark:border-zinc-800" />
            <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">การทำงานและการศึกษา</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">สถานที่ทำงาน</label>
                <input
                  type="text"
                  value={formData.work}
                  onChange={(e) => setFormData({ ...formData, work: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น วิทยาลัยเทคโนโลยี..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">ประวัติการศึกษา</label>
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น มหาวิทยาลัย..."
                />
              </div>
            </div>

            <hr className="dark:border-zinc-800" />
            <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">สถานที่ที่เคยอาศัย</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">เมืองปัจจุบัน</label>
                <input
                  type="text"
                  value={formData.currentCity}
                  onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">บ้านเกิด</label>
                <input
                  type="text"
                  value={formData.hometown}
                  onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <hr className="dark:border-zinc-800" />
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">สถานะความสัมพันธ์</label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="โสด">โสด</option>
                <option value="มีแฟนแล้ว">มีแฟนแล้ว</option>
                <option value="หมั้นแล้ว">หมั้นแล้ว</option>
                <option value="แต่งงานแล้ว">แต่งงานแล้ว</option>
                <option value="จดทะเบียนสมรสแล้ว">จดทะเบียนสมรสแล้ว</option>
                <option value="ความสัมพันธ์แบบซับซ้อน">ความสัมพันธ์แบบซับซ้อน</option>
              </select>
            </div>
          </div>
        </ProfileModal>

        <ProfileModal
          isOpen={activeModal === "intro"}
          onClose={() => setActiveModal(null)}
          title="แก้ไขแนะนำตัว & สังกัด"
          saving={saving}
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">
                แนะนำตัวสั้นๆ (Bio)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none min-h-[100px] focus:ring-2 focus:ring-blue-500"
                placeholder="เขียนอะไรบางอย่างเกี่ยวกับคุณ..."
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">
                สังกัด / ฝ่ายงาน
              </label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none font-bold focus:ring-2 focus:ring-blue-500"
              >
                <option value="ไม่มีสังกัด">- ไม่ระบุสังกัด -</option>
                <option value="ผู้บริหารสถานศึกษา">ผู้บริหารสถานศึกษา</option>
                <option value="งานบริหารงานทั่วไป">งานบริหารงานทั่วไป</option>
                <option value="ช่างยนต์">ช่างยนต์</option>
                <option value="เทคโนโลยีธุรกิจดิจิทัล">
                  เทคโนโลยีธุรกิจดิจิทัล
                </option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">
                  ตำแหน่งหลัก
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">
                  ฝ่ายงานย่อย
                </label>
                <input
                  type="text"
                  value={formData.faction}
                  onChange={(e) =>
                    setFormData({ ...formData, faction: e.target.value })
                  }
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </ProfileModal>

        <ProfileModal
          isOpen={activeModal === "security"}
          onClose={() => setActiveModal(null)}
          title="ความปลอดภัย"
          saving={saving}
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">
                รหัสผ่านใหม่
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">
                ยืนยันรหัสผ่านใหม่
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="••••••••"
              />
            </div>
          </div>
        </ProfileModal>

        <ProfileModal
          isOpen={activeModal === "post"}
          onClose={() => {
            setActiveModal(null);
            setPostImagePreview(null);
            setPostText("");
            setEditingPostId(null);
          }}
          title={editingPostId ? "แก้ไขโพสต์" : "สร้างโพสต์"}
          saving={isPosting}
          onSubmit={handleCreatePost}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-400 to-indigo-500 overflow-hidden flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                {previewImage ? (
                  <img
                    src={previewImage}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserOutlined className="text-zinc-300 px-2" />
                )}
              </div>
              <div className="relative">
                <h4 className="font-black text-sm text-zinc-900 dark:text-white uppercase tracking-tight">
                  {formData.name || "User"}
                </h4>
                <div
                  onClick={() => setShowAudienceMenu(!showAudienceMenu)}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  {postAudience === "public" && (
                    <>
                      <GlobalOutlined className="w-2.5 h-2.5" /> สาธารณะ
                    </>
                  )}
                  {postAudience === "friends" && (
                    <>
                      <TeamOutlined className="w-2.5 h-2.5" /> เพื่อน
                    </>
                  )}
                  {postAudience === "private" && (
                    <>
                      <LockOutlined className="w-2.5 h-2.5" /> เฉพาะฉัน
                    </>
                  )}
                  <DownOutlined className="text-[8px]" />
                </div>

                <AnimatePresence>
                  {showAudienceMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute left-0 mt-1 w-32 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-xl z-50 py-1"
                    >
                      <div
                        onClick={() => {
                          setPostAudience("public");
                          setShowAudienceMenu(false);
                        }}
                        className="px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-[10px] font-bold"
                      >
                        <GlobalOutlined /> สาธารณะ
                      </div>
                      <div
                        onClick={() => {
                          setPostAudience("friends");
                          setShowAudienceMenu(false);
                        }}
                        className="px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-[10px] font-bold"
                      >
                        <TeamOutlined /> เพื่อน
                      </div>
                      <div
                        onClick={() => {
                          setPostAudience("private");
                          setShowAudienceMenu(false);
                        }}
                        className="px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-[10px] font-bold"
                      >
                        <LockOutlined /> เฉพาะฉัน
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="w-full text-xl sm:text-2xl outline-none bg-transparent min-h-[120px] resize-none dark:text-white"
              placeholder={`คุณกำลังคิดอะไรอยู่ ${formData.name?.split(" ")[0] || "คุณ"}?`}
            />

            {postImagePreview && (
              <div className="relative rounded-xl overflow-hidden border dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <img
                  src={postImagePreview}
                  className="w-full h-auto max-h-[300px] object-contain mx-auto"
                />
                <button
                  onClick={() => setPostImagePreview(null)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <CloseOutlined />
                </button>
              </div>
            )}

            <div
              onClick={() => postImageInputRef.current?.click()}
              className="p-3 border dark:border-zinc-800 rounded-xl flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
            >
              <span className="text-sm font-bold ml-2 text-zinc-700 dark:text-zinc-300">
                เพิ่มลงในโพสต์ของคุณ
              </span>
              <div className="flex gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                  <PictureOutlined className="text-emerald-500 text-xl" />
                </div>
              </div>
              <input
                type="file"
                ref={postImageInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePostImageChange}
              />
            </div>
          </div>
        </ProfileModal>

        {/* --- Top Header Section --- */}
        <section className="bg-white dark:bg-zinc-900 shadow-sm rounded-b-xl overflow-hidden mb-4 border-b dark:border-zinc-800">
          <div
            className="group relative h-[180px] sm:h-[300px] lg:h-[400px] w-full bg-zinc-200 dark:bg-zinc-800 cursor-pointer overflow-hidden"
            onClick={() => coverInputRef.current?.click()}
          >
            {previewCover ? (
              <img
                src={previewCover}
                alt="Cover"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-b from-blue-400/20 to-indigo-600/30 backdrop-blur-3xl" />
            )}
            <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm border border-zinc-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 transition-all">
              <CameraOutlined className="text-zinc-700 dark:text-zinc-200" />
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-200">
                แก้ไขรูปหน้าปก
              </span>
            </div>
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="px-4 sm:px-8 pb-4 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 sm:-mt-20 mb-6 px-2">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-40 w-40 sm:h-44 sm:w-44 lg:h-48 lg:w-48 rounded-full overflow-hidden border-4 border-white dark:border-zinc-900 bg-white dark:bg-zinc-800 shadow-xl transition-transform group-hover:scale-[1.01]">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 text-zinc-200">
                      <UserOutlined className="text-6xl" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <CameraOutlined className="text-white text-3xl" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 flex items-center justify-center shadow-md">
                  <CameraOutlined className="text-zinc-700 dark:text-zinc-300 text-xs" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              <div className="flex-1 text-center sm:text-left mb-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {formData.name || formData.username}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg mt-1 mb-4 flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">
                    @{formData.username}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300" />
                  <span className="opacity-80">
                    {formData.position || "สมาชิกวิทยาลัย"}
                  </span>
                </p>
                <div className="flex items-center justify-center sm:justify-start -space-x-2">
                  {allUsers.slice(0, 8).map((u) => (
                    <div
                      key={u._id}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 overflow-hidden shadow-sm flex items-center justify-center"
                    >
                      {u.image ? (
                        <img src={u.image} className="w-full h-full object-cover" alt="Friend" />
                      ) : (
                        <UserOutlined className="text-[10px] text-zinc-400" />
                      )}
                    </div>
                  ))}
                  <span className="ml-4 text-sm font-bold text-zinc-400 tracking-tight">
                    เพื่อนร่วมงาน {allUsers.length} คน
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mb-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveModal("profile")}
                  className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <EditOutlined /> แก้ไขโปรไฟล์
                </button>
                <div className="relative">
                  <div
                    onClick={() => setShowSettings(!showSettings)}
                    className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-200 cursor-pointer flex items-center justify-center transition-all h-full"
                  >
                    <DownOutlined
                      className={`transition-transform duration-300 ${showSettings ? "rotate-180" : ""}`}
                    />
                  </div>

                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-100 dark:border-zinc-800 py-2 z-50 overflow-hidden"
                      >
                        <div
                          onClick={() => {
                            setActiveModal("security");
                            setShowSettings(false);
                          }}
                          className="px-4 py-3 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <SafetyCertificateOutlined className="text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-black">
                              รหัสผ่านและความปลอดภัย
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              เปลี่ยนรหัสผ่านและตั้งค่ายืนยันตัวตน
                            </p>
                          </div>
                        </div>
                        <hr className="my-1 border-zinc-100 dark:border-zinc-800" />
                        <div className="px-4 py-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                          การจัดการบัญชี
                        </div>
                        <div className="px-4 py-3 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors opacity-50 grayscale">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <DatabaseOutlined />
                          </div>
                          <div>
                            <p className="text-sm font-black">
                              ดาวน์โหลดข้อมูลของคุณ
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800 hidden sm:block" />
            <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:-mb-1 px-1 overflow-x-auto no-scrollbar scroll-smooth">
              {[
                "โพสต์",
                "เกี่ยวกับ",
                "เพื่อน",
                "รูปภาพ",
                "วิดีโอ",
                "เพิ่มเติม",
              ].map((tab) => (
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
        </section>

        {/* --- Dynamic Content Area --- */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-4 sm:px-0"
        >
          {renderTabContent()}
        </motion.div>
        {/* Share Modal */}
        <ProfileModal
          isOpen={activeModal === "share"}
          onClose={() => setActiveModal(null)}
          title="แชร์โพสต์"
          saving={false}
          onSubmit={() => setActiveModal(null)}
        >
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
              <ShareAltOutlined className="text-3xl text-blue-500" />
            </div>
            <div>
              <h4 className="text-lg font-black dark:text-white">
                ขออภัยในความไม่สะดวก
              </h4>
              <p className="text-zinc-500">
                ฟีเจอร์นี้กำลังอยู่ระหว่างการพัฒนา...
              </p>
            </div>
          </div>
        </ProfileModal>
      </motion.div>
    </div>
  );
}
