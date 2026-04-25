"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { UserOutlined, PhoneOutlined, MailOutlined, MessageOutlined, SafetyCertificateOutlined, CheckCircleFilled, EditOutlined, GlobalOutlined, LikeOutlined, CommentOutlined, TeamOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import FullPageLoader from "@/components/FullPageLoader";

export default function FriendProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("โพสต์");
  const [activeAboutTab, setActiveAboutTab] = useState("ข้อมูลภาพรวม");
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, postsRes, allUsersRes] = await Promise.all([
          fetch(`/api/users/${id}`),
          fetch(`/api/posts?userId=${id}`),
          fetch("/api/users/all"),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setFormData(data);
        } else {
          router.push("/dashboard/profile");
        }

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          const filtered = postsData.filter(
            (p: any) => p.authorId === id || p.userId === id,
          );
          setUserPosts(filtered);
        }

        if (allUsersRes.ok) {
          const allUsersData = await allUsersRes.json();
          setAllUsers(allUsersData.users || []);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  if (loading) return <FullPageLoader message="กำลังโหลดโปรไฟล์..." />;
  if (!formData) return null;

  const isMyProfile = session?.user && (session.user as any).id === id;

  const renderTabContent = () => {
    switch (activeTab) {
      case "โพสต์":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 border dark:border-zinc-800">
                <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-4">แนะนำตัว</h2>
                <p className="text-center text-zinc-600 dark:text-zinc-400 italic">
                  &quot;{formData.description || "ยังไม่มีคำแนะนำตัว"}&quot;
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 border dark:border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white">รูปภาพ</h2>
                  <span className="text-blue-600 font-bold text-sm cursor-pointer hover:underline">ดูรูปภาพทั้งหมด</span>
                </div>
                <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden border dark:border-zinc-700">
                  {userPosts.filter(p => p.image).slice(0, 9).map((post: any) => (
                    <div key={post._id} className="aspect-square bg-zinc-100 dark:bg-zinc-800">
                      <img src={post.image} className="w-full h-full object-cover" alt="Post" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
               {userPosts.map((post: any) => (
                  <div key={post._id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 border dark:border-zinc-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <UserOutlined className="text-zinc-300" />}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-zinc-900 dark:text-white">{formData.name}</h4>
                        <p className="text-[10px] text-zinc-400 font-bold">{new Date(post.createdAt).toLocaleString("th-TH")}</p>
                      </div>
                    </div>
                    <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>
                    {post.image && <img src={post.image} className="w-full h-auto rounded-xl border dark:border-zinc-800 mb-4" />}
                    <div className="flex items-center gap-4 text-zinc-500 text-sm font-bold border-t dark:border-zinc-800 pt-3">
                       <span className="flex items-center gap-1"><LikeOutlined /> {post.likes?.length || 0} ถูกใจ</span>
                       <span className="flex items-center gap-1"><CommentOutlined /> {post.comments?.length || 0} ความคิดเห็น</span>
                    </div>
                  </div>
               ))}
               {userPosts.length === 0 && (
                  <div className="p-20 text-center bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800">
                    <p className="text-zinc-400 font-bold italic">ยังไม่มีโพสต์</p>
                  </div>
               )}
            </div>
          </div>
        );

      case "เกี่ยวกับ":
        const renderAboutContent = () => {
          switch (activeAboutTab) {
            case "ข้อมูลภาพรวม":
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <SafetyCertificateOutlined className="text-xl text-zinc-400" />
                    <span>ทำงานที่ <b className="text-zinc-900 dark:text-white">{formData.position || "-"}</b> ฝ่าย <b className="text-zinc-900 dark:text-white">{formData.faction || "-"}</b></span>
                  </div>
                  <div className="flex items-center gap-4">
                    <UserOutlined className="text-xl text-zinc-400" />
                    <span>สังกัด <b className="text-zinc-900 dark:text-white">{formData.department || "-"}</b></span>
                  </div>
                  {formData.currentCity && (
                    <div className="flex items-center gap-4">
                      <GlobalOutlined className="text-xl text-zinc-400" />
                      <span>อาศัยอยู่ที่ <b className="text-zinc-900 dark:text-white">{formData.currentCity}</b></span>
                    </div>
                  )}
                </div>
              );
            case "ข้อมูลติดต่อและข้อมูลพื้นฐาน":
              return (
                <div className="space-y-8">
                   <div className="grid gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"><PhoneOutlined /></div>
                      <div>
                        <p className="text-sm font-bold">{formData.phone || "-"}</p>
                        <p className="text-xs text-zinc-400">โทรศัพท์</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"><MailOutlined /></div>
                      <div>
                        <p className="text-sm font-bold">{formData.email || "-"}</p>
                        <p className="text-xs text-zinc-400">อีเมล</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"><UserOutlined /></div>
                      <div>
                        <p className="text-sm font-bold">{formData.relationship || "ไม่ระบุ"}</p>
                        <p className="text-xs text-zinc-400">สถานะความสัมพันธ์</p>
                      </div>
                    </div>
                   </div>
                </div>
              );
            default:
              return <div className="py-20 text-center text-zinc-400 font-bold italic">ข้อมูลในส่วนนี้ยังไม่ได้รับการระบุ</div>;
          }
        };

        return (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-800 p-6 min-h-[500px]">
            <h2 className="text-2xl font-black mb-6">เกี่ยวกับ</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4 border-r dark:border-zinc-800 pr-4 space-y-1">
                {["ข้อมูลภาพรวม", "การทำงานและวุฒิการศึกษา", "สถานที่ที่เคยอาศัย", "ข้อมูลติดต่อและข้อมูลพื้นฐาน"].map((item) => (
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

      default:
        return <div className="py-20 text-center text-zinc-400 font-bold italic">ยังไม่มีข้อมูลที่จะแสดงในหมวดหมู่นี้</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-zinc-950 pb-20">
      <div className="max-w-[1200px] mx-auto">
        {/* Header Section */}
        <div className="bg-white dark:bg-zinc-900 shadow-sm overflow-hidden rounded-b-2xl">
          <div className="h-[200px] sm:h-[350px] relative bg-zinc-200 dark:bg-zinc-800">
            {formData.coverImage && <img src={formData.coverImage} className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          </div>

          <div className="px-4 sm:px-8 pb-6 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-20 mb-6">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative shadow-2xl z-10">
                {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <UserOutlined className="text-5xl text-zinc-300" />}
              </div>
              <div className="flex-1 text-center sm:text-left mb-2 z-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-3">
                  {formData.name} <CheckCircleFilled className="text-blue-500 text-2xl" />
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg mt-1">
                  @{formData.username} • {formData.position || "สมาชิก"}
                </p>
                <div className="flex items-center justify-center sm:justify-start -space-x-2 mt-2">
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
              <div className="flex gap-2 z-10">
                {isMyProfile ? (
                  <button onClick={() => router.push("/dashboard/profile")} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-black flex items-center gap-2">
                    <EditOutlined /> แก้ไขโปรไฟล์
                  </button>
                ) : (
                  <>
                    <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-black flex items-center gap-2">
                      <TeamOutlined /> เป็นเพื่อนแล้ว
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-black flex items-center gap-2">
                      <MessageOutlined /> ข้อความ
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start border-t dark:border-zinc-800 pt-4">
              {["โพสต์", "เกี่ยวกับ", "เพื่อน", "รูปภาพ"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-4 font-black text-sm transition-all border-b-4 ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 px-4">{renderTabContent()}</div>
      </div>
    </div>
  );
}
