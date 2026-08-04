import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  EditOutlined,
  HeartFilled,
  HeartOutlined,
  MessageFilled,
  MessageOutlined,
  UserAddOutlined,
  CheckOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { BriefcaseIcon } from "lucide-react";

interface ProfileCardProps {
  user: any;
  isMe: boolean;
  onEditClick: () => void;
  friendStatus: string;
  onFriendAction: () => void;
  isFollowingUser: boolean;
  onToggleFollow: () => void;
  isProfileLiked: boolean;
  onToggleLike: () => void;
  onMessage?: () => void;
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onImageClick?: () => void;
  onCoverClick?: () => void;
  children?: React.ReactNode;
}

export default function ProfileCard({
  user,
  isMe,
  onEditClick,
  friendStatus,
  onFriendAction,
  isFollowingUser,
  onToggleFollow,
  isProfileLiked,
  onToggleLike,
  onMessage,
  tabs,
  activeTab,
  onTabChange,
  onImageClick,
  onCoverClick,
  children
}: ProfileCardProps) {
  // Helper to render empty states with an edit button
  const renderEmptyState = (title: string, onAdd: () => void) => (
    <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 text-center mt-2">
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">{title}</p>
      {isMe && (
        <button
          onClick={onAdd}
          className="text-xs font-bold px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 transition-all"
        >
          <EditOutlined className="mr-1.5" /> เพิ่มข้อมูล
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden shadow-xl border border-zinc-100 transition-all font-sans text-zinc-900">
      {/* Cover Image */}
      <div
        className="relative h-48 sm:h-64 md:h-80 lg:h-96 w-full bg-linear-to-r from-[#b372ff] to-[#8a3cff] overflow-hidden group cursor-pointer"
        onClick={onCoverClick}
      >
        {user?.coverImage && (
          <img
            src={user.coverImage}
            alt="Cover"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 hover:scale-105"
          />
        )}

        {/* Top Right Actions */}
        <div className="absolute top-4 right-4 z-20">
          {/* Message button removed as per user request */}
        </div>

        {/* Decorative Wave/Curve matching Profile 2 */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-0">
          <svg viewBox="0 0 1440 320" className="w-full h-[60px] sm:h-[80px] md:h-[100px] lg:h-[120px] block" preserveAspectRatio="none">
            <path fill="#ffffff" fillOpacity="1" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,160C672,160,768,192,864,208C960,224,1056,224,1152,202.7C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      <div className="px-2 relative">
        {/* Top Header Row (Avatar left, Stats/Actions right) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-10 sm:gap-4 mb-4">

          {/* Avatar Container */}
          <div className="relative shrink-0">
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[6px] border-white overflow-hidden bg-zinc-100 relative z-10 shadow-sm cursor-pointer"
              onClick={onImageClick}
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt="Profile"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                  <UserOutlined className="text-4xl text-zinc-400" />
                </div>
              )}
            </div>

          </div>

          {/* Stats & Actions */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 md:gap-6 w-full sm:w-auto pt-2 sm:pt-0">
            {/* Stats */}
            <div className="flex flex-col items-center group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 p-2 sm:p-3 rounded-2xl transition-all min-w-[70px] sm:min-w-[80px]">
              <p className="text-xl sm:text-2xl font-black text-zinc-900 leading-none">
                {user?.followers?.length || 0}
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-500 mt-1 uppercase">FOLLOWERS</p>
            </div>
            <div className={`flex flex-col items-center group cursor-pointer p-2 sm:p-3 rounded-2xl transition-all min-w-[70px] sm:min-w-[80px] ${isProfileLiked
              ? "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}>
              <p className={`text-xl sm:text-2xl font-black leading-none ${isProfileLiked ? "text-emerald-600" : "text-zinc-900"
                }`}>
                {user?.profileLikes?.length || 0}
              </p>
              <p className={`text-[10px] sm:text-xs font-bold mt-1 uppercase ${isProfileLiked ? "text-emerald-500" : "text-zinc-500"
                }`}>LIKES</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {!isMe ? (
                <>
                  <button
                    onClick={onToggleFollow}
                    className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all ${isFollowingUser
                      ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                  >
                    {isFollowingUser ? "Following" : "Follow"}
                  </button>
                  <button
                    onClick={onFriendAction}
                    className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${friendStatus === "friends"
                      ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200"
                      : friendStatus === "request_sent"
                        ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200"
                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200"
                      }`}
                  >
                    {friendStatus === "friends" ? <><CheckOutlined /> เพื่อน</> :
                      friendStatus === "request_sent" ? <><ClockCircleOutlined /> ส่งคำขอแล้ว</> :
                        friendStatus === "request_received" ? "รับคำขอเป็นเพื่อน" :
                          <><UserAddOutlined /> เพิ่มเพื่อน</>}
                  </button>
                  <button
                    onClick={() => {
                      if (onMessage) onMessage();
                      else alert("ระบบส่งข้อความกำลังพัฒนา");
                    }}
                    className="px-5 sm:px-6 py-2 sm:py-2.5 bg-white hover:bg-zinc-50 text-zinc-800 rounded-full font-bold text-xs sm:text-sm transition-all border border-zinc-200 shadow-sm flex items-center gap-1.5"
                  >
                    <MessageOutlined className="text-zinc-500" /> ข้อความ
                  </button>
                  <button
                    onClick={onToggleLike}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all border ${isProfileLiked
                      ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200"
                      : "bg-white hover:bg-zinc-50 text-zinc-500 border-zinc-200"
                      }`}
                  >
                    {isProfileLiked ? <HeartFilled className="text-emerald-600 text-lg" /> : <HeartOutlined className="text-lg" />}
                  </button>
                </>
              ) : (
                <button
                  onClick={onEditClick}
                  className="px-5 sm:px-6 py-2 sm:py-2.5 bg-zinc-900 hover:bg-black text-white rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
                >
                  <EditOutlined /> แก้ไขข้อมูล
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-6 mt-4 sm:mt-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              {user?.name || "ไม่ระบุชื่อ"}
            </h1>
            {user?.role && (
              <span className="px-3 py-0.5 bg-purple-50 text-purple-600 text-[11px] font-bold rounded-full border border-purple-100">
                {user.role}
              </span>
            )}
          </div>

          {user?.description ? (
            <p className="text-sm sm:text-base text-zinc-600 font-medium mb-4 max-w-2xl">
              {user.description}
            </p>
          ) : (
            <p className="text-sm text-zinc-400 font-medium mb-4 italic">
              ยังไม่มีข้อมูลแนะนำตัว
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-zinc-500 font-bold">
            {user?.username && (
              <span><span className="text-zinc-400">@</span> {user.username}</span>
            )}
            {user?.username && user?.role && <span className="text-zinc-300">•</span>}
            {user?.role && <span>{user.role}</span>}
            {(user?.username || user?.role) && <span className="text-zinc-300">•</span>}
            <span>Joined {user?.createdAt ? formatDistanceToNow(new Date(user.createdAt), { locale: th }) : "Jan 2026"}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-zinc-200 mb-6 overflow-x-auto custom-scrollbar px-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`pb-3 text-sm sm:text-base font-bold transition-all relative whitespace-nowrap px-1 ${activeTab === tab
                ? "text-blue-600"
                : "text-zinc-500 hover:text-zinc-800"
                }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabProfileCard"
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === tabs[1] || activeTab === "Profile" || activeTab === "เกี่ยวกับ" ? (
              <div className="space-y-6">
                {/* About Section */}
                <div className="bg-zinc-50/50 dark:bg-[#1e1e1e] p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-[15px] font-black text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                    เกี่ยวกับ <span className="text-lg">👋</span>
                  </h3>
                  {user?.description ? (
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                      {user.description}
                    </p>
                  ) : (
                    renderEmptyState("ผู้ใช้ยังไม่ได้เขียนแนะนำตัว", onEditClick)
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Location */}
                  <div className="bg-zinc-50/50 dark:bg-[#1e1e1e] p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white mb-3">สถานที่อยู่</h3>
                    {(user?.currentCity || user?.addressProvince) ? (
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                        <EnvironmentOutlined className="text-zinc-400 dark:text-zinc-500" />
                        {user?.currentCity || `${user?.addressProvince} ประเทศไทย`}
                      </p>
                    ) : (
                      renderEmptyState("ยังไม่ได้ระบุที่อยู่", onEditClick)
                    )}
                  </div>

                  {/* Social Media */}
                  <div className="bg-zinc-50/50 dark:bg-[#1e1e1e] p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white mb-3">บัญชีโซเชียลมีเดีย</h3>
                    {user?.lineId ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#00B900] flex items-center justify-center text-white cursor-pointer shadow-sm"><span className="font-bold text-[10px]">LINE</span></div>
                      </div>
                    ) : (
                      renderEmptyState("ยังไม่ได้เชื่อมต่อโซเชียลมีเดีย", onEditClick)
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-zinc-50/50 dark:bg-[#1e1e1e] p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white mb-3">ทักษะความสามารถ</h3>
                  {user?.skills?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-zinc-200 dark:bg-[#2c2c2c] text-zinc-800 dark:text-zinc-300 text-xs font-bold rounded-full border border-zinc-300 dark:border-zinc-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    renderEmptyState("ยังไม่ได้เพิ่มทักษะความสามารถ", onEditClick)
                  )}
                </div>

                {/* Experience */}
                <div className="bg-zinc-50/50 dark:bg-[#1e1e1e] p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white mb-4">ประสบการณ์ / การศึกษา</h3>
                  {(user?.work || user?.education) ? (
                    <div className="space-y-4">
                      {user?.work && (
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-[#0ea5e9]/20 shrink-0 flex items-center justify-center text-blue-600 dark:text-[#0ea5e9] font-black text-xs">
                            งาน
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-zinc-900 dark:text-white">{user.work}</h4>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">{user?.position || "ตำแหน่ง"}</p>
                            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mt-1">{user?.department || "แผนก"}</p>
                          </div>
                        </div>
                      )}
                      {user?.education && (
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 shrink-0 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xs">
                            เรียน
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-zinc-900 dark:text-white">{user.education}</h4>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">{user?.program || "นักศึกษา"}</p>
                            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mt-1">{user?.academicLevel || "ระดับชั้น"}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    renderEmptyState("ยังไม่ได้เพิ่มประสบการณ์ หรือการศึกษา", onEditClick)
                  )}
                </div>
              </div>
            ) : (
              children
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
