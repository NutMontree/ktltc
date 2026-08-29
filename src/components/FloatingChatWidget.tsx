"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button, Input, ScrollShadow, Spinner, Tooltip } from "@heroui/react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "สวัสดีครับ มีอะไรให้ผมช่วยไหมครับ? พิมพ์ถามมาได้เลย",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // เลื่อนลงสุดเมื่อมีข้อความใหม่
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    // สร้าง Session ID ตอนโหลด Component
    setSessionId(Math.random().toString(36).substring(2, 15));
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = { id: Date.now().toString(), role: "user" as const, content: message };
    const loadingMsg = { id: "loading", role: "ai" as const, content: "typing..." };
    
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, sessionId }),
      });
      
      if (!res.ok) {
        throw new Error("API Error");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      const aiMsgId = Date.now().toString() + "-ai";
      let aiMessage = "";
      let isFirstChunk = true;
      
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunkText = decoder.decode(value, { stream: true });
        aiMessage += chunkText;
        
        // รอให้มีตัวอักษรจริงๆ โผล่มาก่อน ค่อยปิดจุดไข่ปลา
        if (isFirstChunk && aiMessage.trim().length > 0) {
          isFirstChunk = false;
          setIsLoading(false); 
          // ลบกล่อง loading ทิ้ง และใส่ข้อความจริงแทน
          setMessages((prev) => [
            ...prev.filter(m => m.id !== "loading"), 
            { id: aiMsgId, role: "ai", content: aiMessage }
          ]);
        } else if (!isFirstChunk) {
          // อัปเดตข้อความแบบ Real-time
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === aiMsgId ? { ...msg, content: aiMessage } : msg
            )
          );
        }
      }
      
      // กันเหนียว กรณีหลุด loop แล้วยังไม่ได้ปิดจุดไข่ปลา
      setIsLoading(false);
      setMessages((prev) => prev.filter(m => m.id !== "loading"));
      
    } catch (error) {
      console.error("Chat Error:", error);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev.filter(m => m.id !== "loading"),
        { id: Date.now().toString(), role: "ai", content: "⚠️ ขออภัย ระบบขัดข้อง ไม่สามารถตอบกลับได้ในขณะนี้" },
      ]);
    }
  };

  return (
    <div className="print:hidden fixed bottom-16 right-4 md:bottom-20 md:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-12 md:bottom-16 right-0 w-[310px] sm:w-[360px] h-[480px] bg-background/95 backdrop-blur-2xl border border-divider/80 shadow-2xl shadow-indigo-950/20 rounded-3xl flex flex-col overflow-hidden origin-bottom-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-divider bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="relative p-2 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl shadow-md shadow-purple-500/30">
                  <Sparkles size={18} className="text-amber-300 animate-pulse" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-1.5 text-foreground">
                    KTLTC AI Assistant
                  </h3>
                  <p className="text-[11px] text-default-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    พร้อมตอบคำถามข้อมูลวิทยาลัย 24 ชม.
                  </p>
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => setIsOpen(false)}
                radius="full"
                className="text-default-500 hover:text-foreground"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Chat Body */}
            <ScrollShadow className="flex-1 p-4 space-y-4 bg-gradient-to-b from-slate-50/50 via-indigo-50/20 to-purple-50/10 dark:from-slate-950/50 dark:via-indigo-950/20 dark:to-purple-950/10">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-start gap-2`}
                >
                  {msg.role === "ai" && (
                    <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Sparkles size={13} className="text-amber-300" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] px-4 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white rounded-2xl rounded-tr-xs shadow-md shadow-indigo-500/20 font-medium"
                        : "bg-content1 dark:bg-slate-900 text-foreground border border-divider/60 shadow-xs rounded-2xl rounded-tl-xs leading-relaxed"
                    }`}
                  >
                    {msg.content === "typing..." ? (
                      <div className="flex items-center gap-1.5 py-1 px-1">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              <div ref={endOfMessagesRef} />
            </ScrollShadow>

            {/* Footer / Input */}
            <div className="p-3 border-t border-divider/80 bg-background/90 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Input
                  classNames={{
                    inputWrapper: "bg-content2/80 hover:bg-content3/80 focus-within:bg-background focus-within:ring-2 focus-within:ring-purple-500/40 border border-divider/50 transition-all",
                  }}
                  placeholder="พิมพ์ข้อความ..."
                  value={message}
                  onValueChange={setMessage}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  size="sm"
                  radius="full"
                  fullWidth
                />
                <Button
                  isIconOnly
                  radius="full"
                  className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 shrink-0"
                  onPress={handleSend}
                  isDisabled={!message.trim() || isLoading}
                >
                  <Send size={16} className="-ml-0.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Tooltip 
              content="Chat AI Assistant" 
              placement="left" 
              classNames={{
                content: "bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white px-3.5 py-1.5 text-xs rounded-full shadow-xl font-medium border border-white/20 backdrop-blur-md"
              }}
              delay={300}
            >
              <Button
                isIconOnly
                radius="full"
                className="relative shadow-xl shadow-purple-500/40 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white h-11 w-11 min-w-11 md:h-12 md:w-12 md:min-w-12 hover:scale-110 hover:shadow-purple-500/60 transition-all duration-300 ring-2 ring-white/20"
                onPress={() => setIsOpen(true)}
              >
                <div className="relative flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
                  <Sparkles className="h-3 w-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
                </div>
              </Button>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
