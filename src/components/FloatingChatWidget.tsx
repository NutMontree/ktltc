"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button, Input, ScrollShadow, Spinner } from "@heroui/react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
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
    setMessages((prev) => [...prev, userMsg]);
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
        
        if (isFirstChunk) {
          isFirstChunk = false;
          setIsLoading(false); // ปิดจุดไข่ปลาเมื่อคำแรกมาถึง
          setMessages((prev) => [...prev, { id: aiMsgId, role: "ai", content: aiMessage }]);
        } else {
          // อัปเดตข้อความแบบ Real-time
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === aiMsgId ? { ...msg, content: aiMessage } : msg
            )
          );
        }
      }
      
    } catch (error) {
      console.error("Chat Error:", error);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "ai", content: "⚠️ ขออภัย ระบบขัดข้อง ไม่สามารถตอบกลับได้ในขณะนี้" },
      ]);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-12 md:bottom-16 right-0 w-[300px] sm:w-[350px] h-[450px] bg-background/80 backdrop-blur-xl border border-divider shadow-2xl rounded-2xl flex flex-col overflow-hidden origin-bottom-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-divider bg-content1/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/20 text-primary rounded-full">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">KTLTC AI Assistant</h3>
                  <p className="text-xs text-default-500">ถาม-ตอบข้อมูลวิทยาลัย</p>
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => setIsOpen(false)}
                radius="full"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Chat Body */}
            <ScrollShadow className="flex-1 p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-content2 text-foreground rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-2">
                  <div className="bg-content2 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-2 h-2 bg-default-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-default-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-default-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </ScrollShadow>

            {/* Footer / Input */}
            <div className="p-3 border-t border-divider bg-content1/50">
              <div className="flex items-center gap-2">
                <Input
                  classNames={{
                    inputWrapper: "bg-content2 hover:bg-content3 focus-within:bg-content3",
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
                  color="primary"
                  radius="full"
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
            <Button
              isIconOnly
              color="primary"
              radius="full"
              className="shadow-lg h-10 w-10 min-w-10 md:h-12 md:w-12 md:min-w-12"
              onPress={() => setIsOpen(true)}
            >
              <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
