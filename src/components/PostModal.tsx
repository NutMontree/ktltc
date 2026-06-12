"use client";

import { useEffect, useState } from "react";
import { Modal, App } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { CloseOutlined, HeartOutlined, HeartFilled, CommentOutlined, ShareAltOutlined, SendOutlined, UserOutlined, PictureOutlined } from "@ant-design/icons";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

interface PostModalProps {
  postId: string | null;
  open: boolean;
  onClose: () => void;
}

export default function PostModal({ postId, open, onClose }: PostModalProps) {
  const { message } = App.useApp();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareText, setShareText] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId: string; userName: string } | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [likesModal, setLikesModal] = useState<{ isOpen: boolean; type: 'post' | 'comment'; targetId: string | null }>({ isOpen: false, type: 'post', targetId: null });
  const [likeUsers, setLikeUsers] = useState<any[]>([]);
  const [isLoadingLikes, setIsLoadingLikes] = useState(false);
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  useEffect(() => {
    if (open && postId) {
      fetchPost(true);
    }
  }, [open, postId]);

  const fetchPost = async (showLoading: boolean = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!session) {
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
        fetchPost();
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleComment = async (parentId: string | null = null) => {
    if (!session) {
      signIn();
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "COMMENT",
          text: commentText,
          image: commentImage,
          parentId,
        }),
      });
      if (res.ok) {
        setCommentText("");
        setCommentImage(null);
        setReplyingTo(null);
        fetchPost(false);
        message.success(parentId ? "ตอบกลับสำเร็จ" : "คอมเมนต์สำเร็จ");
      }
    } catch (error) {
      console.error("Comment error:", error);
      message.error("ไม่สามารถคอมเมนต์ได้");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
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
        setEditingCommentText("");
        fetchPost(false);
        message.success("แก้ไขคอมเมนต์สำเร็จ");
      }
    } catch (error) {
      console.error("Update comment error:", error);
      message.error("ไม่สามารถแก้ไขคอมเมนต์ได้");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("คุณต้องการลบคอมเมนต์นี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "DELETE_COMMENT", commentId }),
      });
      if (res.ok) {
        fetchPost(false);
        message.success("ลบคอมเมนต์สำเร็จ");
      }
    } catch (error) {
      console.error("Delete comment error:", error);
      message.error("ไม่สามารถลบคอมเมนต์ได้");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setCommentImage(data.url);
      } else {
        message.error("ไม่สามารถอัปโหลดรูปภาพได้");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!session) {
      signIn();
      return;
    }
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "LIKE_COMMENT", commentId }),
      });
      if (res.ok) {
        fetchPost();
      }
    } catch (error) {
      console.error("Like comment error:", error);
    }
  };

  const openLikesModal = async (type: 'post' | 'comment', targetId: string | null) => {
    setLikesModal({ isOpen: true, type, targetId });
    setIsLoadingLikes(true);
    setLikeUsers([]);
    try {
      let url = `/api/posts/${postId}/likes`;
      if (type === 'comment' && targetId) {
        url += `?commentId=${targetId}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLikeUsers(data.users || []);
      }
    } catch (err) {
      console.error("Error fetching likes:", err);
    } finally {
      setIsLoadingLikes(false);
    }
  };

  const handleShare = async () => {
    if (!session) {
      signIn();
      return;
    }
    setIsSharing(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SHARE",
          shareText,
          targetId: userId,
          audience: "public",
        }),
      });
      if (res.ok) {
        setShowShareModal(false);
        setShareText("");
        message.success("แชร์โพสต์สำเร็จ");
      }
    } catch (error) {
      console.error("Share error:", error);
      message.error("ไม่สามารถแชร์โพสต์ได้");
    } finally {
      setIsSharing(false);
    }
  };

  const isLiked = post?.likes?.includes(userId);

  if (!open) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      zIndex={9999}
      width="90vw"
      style={{ maxWidth: "800px" }}
      className="post-modal"
      closeIcon={<CloseOutlined className="text-zinc-500 hover:text-zinc-700" />}
      styles={{
        body: { padding: 0, maxHeight: "80vh", overflow: "auto" },
      }}
    >
      <AnimatePresence>
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="text-zinc-500">กำลังโหลด...</div>
          </div>
        ) : post ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-zinc-900"
          >
            {/* Post Header */}
            <div className="flex items-center gap-3 p-4 border-b dark:border-zinc-800">
              <Link href={`/dashboard/profile/${post.authorId || post.userId || '#'}`} className="shrink-0 hover:opacity-80 transition-opacity">
                {post.authorImage ? (
                  <img
                    src={post.authorImage}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <span className="text-zinc-500 dark:text-zinc-400 text-sm font-bold">
                      {post.authorName?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </Link>
              <div className="flex-1">
                <Link href={`/dashboard/profile/${post.authorId || post.userId || '#'}`} className="font-bold text-zinc-900 dark:text-white hover:underline block">{post.authorName}</Link>
                <div className="text-xs text-zinc-500">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: th })}
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-4">
              {post.title && (
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{post.title}</h3>
              )}
              <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{post.content}</p>

              {post.image && (
                <img
                  src={post.image}
                  alt="Post image"
                  className="mt-4 rounded-lg w-full object-cover max-h-96"
                />
              )}

              {post.images && post.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {post.images.map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Post image ${idx + 1}`}
                      className="rounded-lg w-full object-cover max-h-48"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-6 p-4 border-t dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`transition-colors ${isLiked ? 'text-red-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-red-500'}`}
                >
                  {isLiked ? <HeartFilled className="text-xl" /> : <HeartOutlined className="text-xl" />}
                </button>
                <button onClick={() => openLikesModal('post', postId)} className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline cursor-pointer">
                  {post.likes?.length || 0}
                </button>
              </div>
              <button className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-500 transition-colors">
                <CommentOutlined className="text-xl" />
                <span className="text-sm">{post.comments?.length || 0}</span>
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-green-500 transition-colors"
              >
                <ShareAltOutlined className="text-xl" />
              </button>
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t dark:border-zinc-800">
              {replyingTo && (
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    ตอบกลับ {replyingTo.userName}
                  </span>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="User" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <UserOutlined className="text-zinc-400 text-xs" />
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  {commentImage && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border dark:border-zinc-700">
                      <img src={commentImage} alt="Comment Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setCommentImage(null)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center text-xs transition-colors"
                      >
                        <CloseOutlined />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={replyingTo ? "เขียนการตอบกลับ..." : "เขียนคอมเมนต์..."}
                      className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleComment(replyingTo?.commentId || null)}
                    />
                    <input
                      type="file"
                      id="comment-image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <label
                      htmlFor="comment-image-upload"
                      className={`w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ${isUploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {isUploadingImage ? (
                        <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <PictureOutlined className="text-zinc-600 dark:text-zinc-400" />
                      )}
                    </label>
                    <button
                      onClick={() => handleComment(replyingTo?.commentId || null)}
                      disabled={(!commentText.trim() && !commentImage) || isSubmittingComment || isUploadingImage}
                      className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmittingComment ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <SendOutlined className="text-sm" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments */}
            {post.comments && post.comments.length > 0 && (
              <div className="p-4 border-t dark:border-zinc-800">
                <div className="text-sm font-bold text-zinc-900 dark:text-white mb-3">
                  คอมเมนต์ ({post.comments.length})
                </div>
                <div className="space-y-3">
                  {post.comments
                    .filter((c: any) => !c.parentId)
                    .slice(0, 5)
                    .map((comment: any) => (
                      <div key={comment.id} className="flex gap-3">
                        <Link href={`/dashboard/profile/${comment.userId || '#'}`} className="shrink-0 hover:opacity-80 transition-opacity">
                          {comment.userImage ? (
                            <img
                              src={comment.userImage}
                              alt={comment.userName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                              <span className="text-zinc-500 dark:text-zinc-400 text-xs font-bold">
                                {comment.userName?.charAt(0) || "?"}
                              </span>
                            </div>
                          )}
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link href={`/dashboard/profile/${comment.userId || '#'}`} className="font-bold text-sm text-zinc-900 dark:text-white hover:underline">
                              {comment.userName}
                            </Link>
                            <span className="text-xs text-zinc-500">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: th })}
                            </span>
                          </div>

                          {editingCommentId === comment.id ? (
                            <div className="mt-2 flex gap-2">
                              <input
                                type="text"
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleUpdateComment(comment.id)}
                              />
                              <button
                                onClick={() => handleUpdateComment(comment.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
                              >
                                บันทึก
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingCommentText("");
                                }}
                                className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg text-xs hover:bg-zinc-300 dark:hover:bg-zinc-600"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">{comment.text}</p>
                          )}
                          {comment.image && (
                            <div className="mt-2 rounded-lg overflow-hidden border dark:border-zinc-700 max-w-[200px]">
                              <img src={comment.image} alt="Comment attachment" className="w-full h-auto" />
                            </div>
                          )}

                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-xs">
                              <button
                                onClick={() => handleLikeComment(comment.id)}
                                className={`transition-colors ${comment.likes?.includes(userId) ? 'text-red-500' : 'text-zinc-500 hover:text-red-500'}`}
                              >
                                {comment.likes?.includes(userId) ? <HeartFilled /> : <HeartOutlined />}
                              </button>
                              {comment.likes?.length > 0 && (
                                <button onClick={() => openLikesModal('comment', comment.id)} className="text-zinc-500 hover:underline">
                                  <span>{comment.likes.length}</span>
                                </button>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setReplyingTo({ postId: postId || "", commentId: comment.id, userName: comment.userName });
                                setCommentText("");
                              }}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              ตอบกลับ
                            </button>
                            {String(comment.userId) === String(userId) && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditingCommentText(comment.text);
                                  }}
                                  className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                >
                                  แก้ไข
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-xs text-rose-500 hover:text-rose-700"
                                >
                                  ลบ
                                </button>
                              </>
                            )}
                          </div>

                          {/* Nested Replies */}
                          {post.comments
                            .filter((c: any) => c.parentId === comment.id)
                            .map((reply: any) => (
                              <div key={reply.id} className="mt-3 ml-8 flex gap-2 border-l-2 border-zinc-200 dark:border-zinc-700 pl-3">
                                <Link href={`/dashboard/profile/${reply.userId || '#'}`} className="shrink-0 hover:opacity-80 transition-opacity">
                                  {reply.userImage ? (
                                    <img
                                      src={reply.userImage}
                                      alt={reply.userName}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                                      <span className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold">
                                        {reply.userName?.charAt(0) || "?"}
                                      </span>
                                    </div>
                                  )}
                                </Link>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Link href={`/dashboard/profile/${reply.userId || '#'}`} className="font-bold text-xs text-zinc-900 dark:text-white hover:underline">
                                      {reply.userName}
                                    </Link>
                                    <span className="text-[10px] text-zinc-500">
                                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: th })}
                                    </span>
                                  </div>

                                  {editingCommentId === reply.id ? (
                                    <div className="mt-1 flex gap-2">
                                      <input
                                        type="text"
                                        value={editingCommentText}
                                        onChange={(e) => setEditingCommentText(e.target.value)}
                                        className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onKeyPress={(e) => e.key === 'Enter' && handleUpdateComment(reply.id)}
                                      />
                                      <button
                                        onClick={() => handleUpdateComment(reply.id)}
                                        className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] hover:bg-blue-700"
                                      >
                                        บันทึก
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(null);
                                          setEditingCommentText("");
                                        }}
                                        className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg text-[10px] hover:bg-zinc-300 dark:hover:bg-zinc-600"
                                      >
                                        ยกเลิก
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1">{reply.text}</p>
                                  )}
                                  {reply.image && (
                                    <div className="mt-2 rounded-lg overflow-hidden border dark:border-zinc-700 max-w-[150px]">
                                      <img src={reply.image} alt="Reply attachment" className="w-full h-auto" />
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1 text-[10px]">
                                      <button
                                        onClick={() => handleLikeComment(reply.id)}
                                        className={`transition-colors ${reply.likes?.includes(userId) ? 'text-red-500' : 'text-zinc-500 hover:text-red-500'}`}
                                      >
                                        {reply.likes?.includes(userId) ? <HeartFilled /> : <HeartOutlined />}
                                      </button>
                                      {reply.likes?.length > 0 && (
                                        <button onClick={() => openLikesModal('comment', reply.id)} className="text-zinc-500 hover:underline">
                                          <span>{reply.likes.length}</span>
                                        </button>
                                      )}
                                    </div>
                                    {String(reply.userId) === String(userId) && (
                                      <>
                                        <button
                                          onClick={() => {
                                            setEditingCommentId(reply.id);
                                            setEditingCommentText(reply.text);
                                          }}
                                          className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                        >
                                          แก้ไข
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment(reply.id)}
                                          className="text-[10px] text-rose-500 hover:text-rose-700"
                                        >
                                          ลบ
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  {post.comments.length > 5 && (
                    <div className="text-sm text-blue-600 font-bold cursor-pointer hover:underline">
                      ดูคอมเมนต์ทั้งหมด ({post.comments.length})
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="flex items-center justify-center p-20">
            <div className="text-zinc-500">ไม่พบโพสต์</div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <Modal
        open={showShareModal}
        onCancel={() => setShowShareModal(false)}
        title="แชร์โพสต์"
        footer={null}
        centered
        zIndex={10000}
      >
        <div className="space-y-4">
          <textarea
            value={shareText}
            onChange={(e) => setShareText(e.target.value)}
            placeholder="เขียนอะไรบางอย่างเกี่ยวกับโพสต์นี้..."
            className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowShareModal(false)}
              className="px-4 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSharing ? "กำลังแชร์..." : "แชร์"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Likes Modal */}
      <Modal
        open={likesModal.isOpen}
        onCancel={() => setLikesModal({ ...likesModal, isOpen: false })}
        title="รายชื่อคนถูกใจ"
        footer={null}
        centered
        zIndex={10001}
        width={400}
      >
        <div className="max-h-96 overflow-y-auto mt-4 space-y-3">
          {isLoadingLikes ? (
            <div className="flex justify-center p-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : likeUsers.length > 0 ? (
            likeUsers.map((u) => (
              <div key={u._id} className="flex items-center gap-3">
                <Link href={`/dashboard/profile/${u._id}`} className="shrink-0" onClick={() => setLikesModal({ ...likesModal, isOpen: false })}>
                  {u.image ? (
                    <img src={u.image} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                      <span className="text-sm font-bold text-zinc-500">{u.name?.charAt(0)}</span>
                    </div>
                  )}
                </Link>
                <div className="flex-1">
                  <Link href={`/dashboard/profile/${u._id}`} className="font-bold text-sm hover:underline text-zinc-900 dark:text-white" onClick={() => setLikesModal({ ...likesModal, isOpen: false })}>
                    {u.name}
                  </Link>
                  {u.role && (
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{u.role}</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-zinc-500 p-4">ไม่มีผู้ถูกใจ</div>
          )}
        </div>
      </Modal>
    </Modal>
  );
}
