"use client";
import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";

type Msg = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  loading?: boolean;
};

export default function AIAssistant() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeFileOp, setActiveFileOp] = useState<string | null>(null);
  const [filePath, setFilePath] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  const uid = () => Math.random().toString(36).slice(2, 10);

  const addMsg = (role: "user" | "ai", content: string, loading = false) => {
    const msg: Msg = { id: uid(), role, content, timestamp: new Date(), loading };
    setMessages(prev => [...prev, msg]);
    return msg.id;
  };

  const updateMsg = (id: string, content: string, loading = false) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, content, loading } : m));
  };

  const callAPI = async (body: Record<string, string>) => {
    const res = await fetch("/api/ai/file-manager", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  };

  const formatResponse = (data: { success: boolean; result?: any; error?: string }, fp?: string) => {
    if (!data.success) return `❌ Error: ${data.error}`;
    const r = data.result;
    if (r?.response) return r.response;
    if (r?.aiExplanation) return `📄 **${fp}**\n\n${r.aiExplanation}\n\n---\n\`\`\`\n${r.fileContent}\n\`\`\``;
    if (r?.aiGenerated) return `✅ เขียนไฟล์สำเร็จ: **${r.path}**\n\n\`\`\`\n${r.preview}\n\`\`\``;
    if (r?.aiEdited) return `✅ แก้ไขไฟล์สำเร็จ: **${r.path}**`;
    if (r?.files) return r.files.map((f: { name: string; type: string }) => f.type === "directory" ? `📁 ${f.name}/` : `📄 ${f.name}`).join("\n");
    if (r?.content) return `\`\`\`\n${r.content}\n\`\`\``;
    return JSON.stringify(r, null, 2);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !activeFileOp) return;

    // Show user message
    const displayText = activeFileOp 
      ? `${fileOpIcon(activeFileOp)} ${activeFileOp === "list" ? `📂 ${filePath || "."}` : `${filePath}`}\n${text}`
      : text;
    addMsg("user", displayText);
    setInput("");

    // AI loading
    const aiId = addMsg("ai", "", true);
    setIsTyping(true);

    try {
      let body: Record<string, string>;
      if (activeFileOp === "list") {
        body = { action: "list", dirPath: filePath || "." };
      } else if (activeFileOp === "read") {
        body = { action: "ai-read", filePath };
      } else if (activeFileOp === "write") {
        body = { action: "ai-write", filePath, message: text };
      } else if (activeFileOp === "edit") {
        body = { action: "ai-edit", filePath, message: text };
      } else {
        body = { action: "ai-chat", message: text };
      }

      const data = await callAPI(body);
      const formatted = formatResponse(data, filePath);
      updateMsg(aiId, formatted);
    } catch (err: any) {
      updateMsg(aiId, `❌ Error: ${err.message}`);
    }

    setIsTyping(false);
    setActiveFileOp(null);
    setFilePath("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  function fileOpIcon(op: string) {
    switch (op) {
      case "list": return "📂";
      case "read": return "📖";
      case "write": return "✏️";
      case "edit": return "🔧";
      default: return "💬";
    }
  }

  // Simple markdown-like renderer
  const renderContent = (content: string) => {
    if (!content) return null;

    const parts: ReactNode[] = [];
    let key = 0;
    const lines = content.split("\n");
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let codeLang = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith("```")) {
        if (inCodeBlock) {
          parts.push(
            <div key={key++} className="my-2 rounded-lg overflow-hidden border border-gray-700">
              {codeLang && <div className="bg-gray-800 px-3 py-1 text-xs text-gray-400 border-b border-gray-700">{codeLang}</div>}
              <pre className="bg-[#0d1117] p-3 overflow-x-auto text-sm">
                <code className="text-gray-300">{codeLines.join("\n")}</code>
              </pre>
            </div>
          );
          codeLines = [];
          codeLang = "";
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLang = line.slice(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      // Bold
      const boldParsed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Inline code
      const codeParsed = boldParsed.replace(/`([^`]+)`/g, '<code class="bg-gray-700/60 px-1.5 py-0.5 rounded text-sm text-blue-300">$1</code>');

      if (line.startsWith("### ")) {
        parts.push(<h3 key={key++} className="text-lg font-semibold mt-3 mb-1" dangerouslySetInnerHTML={{ __html: codeParsed.slice(4) }} />);
      } else if (line.startsWith("## ")) {
        parts.push(<h2 key={key++} className="text-xl font-bold mt-3 mb-1" dangerouslySetInnerHTML={{ __html: codeParsed.slice(3) }} />);
      } else if (line.startsWith("# ")) {
        parts.push(<h1 key={key++} className="text-2xl font-bold mt-3 mb-2" dangerouslySetInnerHTML={{ __html: codeParsed.slice(2) }} />);
      } else if (line.startsWith("---")) {
        parts.push(<hr key={key++} className="border-gray-700 my-3" />);
      } else if (line.startsWith("- ") || line.startsWith("• ")) {
        parts.push(<div key={key++} className="flex gap-2 ml-2"><span className="text-gray-500">•</span><span dangerouslySetInnerHTML={{ __html: codeParsed.replace(/^[•-]\s/, "") }} /></div>);
      } else if (line.trim() === "") {
        parts.push(<div key={key++} className="h-2" />);
      } else {
        parts.push(<p key={key++} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: codeParsed }} />);
      }
    }

    // Unclosed code block
    if (inCodeBlock && codeLines.length > 0) {
      parts.push(
        <pre key={key++} className="bg-[#0d1117] p-3 rounded-lg my-2 overflow-x-auto text-sm border border-gray-700">
          <code className="text-gray-300">{codeLines.join("\n")}</code>
        </pre>
      );
    }

    return parts;
  };

  const fileOps = [
    { id: "list", icon: "📂", label: "ลิสต์ไฟล์" },
    { id: "read", icon: "📖", label: "อ่านไฟล์" },
    { id: "write", icon: "✏️", label: "เขียนไฟล์" },
    { id: "edit", icon: "🔧", label: "แก้ไขไฟล์" },
  ] as const;

    const suggestions = [
    "ช่วยอธิบายโครงสร้างโปรเจกต์ให้หน่อย",
    "อ่านไฟล์ package.json ให้หน่อย",
    "ช่วยเขียน API route ใหม่",
    "แก้ไขบัคในโค้ดให้หน่อย",
    "ลิสต์ไฟล์ในโฟลเดอร์ src/app",
    "ช่วย refactor โค้ดให้ดีขึ้น",
    "เขียน unit test ให้หน่อย",
    "อธิบายฟังก์ชันนี้ทำอะไร",
  ];
  return (
// ในส่วนของ Container หลัก
<div className="flex flex-col h-screen bg-white text-gray-900">

<div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white">
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">K</div>
    <div>
      <h1 className="text-sm font-semibold">KTLTC AI Assistant</h1>
      <p className="text-xs text-gray-500">Workers AI · Cloudflare</p>
    </div>
  </div>
  <div className="flex items-center gap-2">
    <button
      onClick={() => setMessages([])}
      className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
    >
      🗑️ ล้างแชท
    </button>
  </div>
</div>

<div className="flex-1 overflow-y-auto">
  {messages.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-orange-500/20">
        🤖
      </div>
      <h2 className="text-2xl font-bold mb-2">สวัสดีครับ! ผมคือ AI Assistant</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        ผมช่วยคุณอ่าน เขียน แก้ไขไฟล์ และตอบคำถามเกี่ยวกับโปรเจกต์ KTLTC ได้
      </p>
      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => { setInput(s); inputRef.current?.focus(); }}
            className="text-left p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm text-gray-700"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  ) : (
    <div className="max-w-3xl mx-auto py-6">
      {messages.map((msg) => (
        <div key={msg.id} className={`px-5 py-4 ${msg.role === "user" ? "bg-gray-50" : "bg-white"}`}>
          <div className="max-w-3xl mx-auto flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              {msg.role === "user" ? (
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">U</div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-xs">🤖</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 mb-1.5 font-medium">
                {msg.role === "user" ? "คุณ" : "AI Assistant"}
              </div>
              {msg.loading ? (
                <div className="flex items-center gap-1.5 py-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              ) : (
                <div className="text-[15px] leading-relaxed text-gray-800">
                  {renderContent(msg.content)}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      {isTyping && !messages.some(m => m.loading) && (
        <div className="px-5 py-4 bg-white">
          <div className="max-w-3xl mx-auto flex gap-4">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-xs">🤖</div>
            <div className="flex items-center gap-1.5 py-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )}
</div>

{activeFileOp && (
  <div className="border-t border-gray-200 bg-white px-5 py-2">
    <div className="max-w-3xl mx-auto flex items-center gap-2">
      <span className="text-xs text-gray-500">
        {fileOpIcon(activeFileOp)} {activeFileOp === "list" ? "ลิสต์ไฟล์" : activeFileOp === "read" ? "อ่านไฟล์" : activeFileOp === "write" ? "เขียนไฟล์" : "แก้ไขไฟล์"}
      </span>
      <input
        type="text"
        value={filePath}
        onChange={(e) => setFilePath(e.target.value)}
        placeholder="path: เช่น src/app/page.tsx"
        className="flex-1 text-sm p-1.5 rounded bg-gray-50 border border-gray-300 text-gray-800 focus:border-orange-500 focus:outline-none"
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSend(); }}}
      />
      <button onClick={() => { setActiveFileOp(null); setFilePath(""); }} className="text-xs text-gray-500 hover:text-red-400">✕ ยกเลิก</button>
    </div>
  </div>
)}

<div className="border-t border-gray-200 bg-white px-5 py-3">
  <div className="max-w-3xl mx-auto">
    {/* Quick Actions */}
    <div className="flex gap-1.5 mb-2">
      {fileOps.map((op) => (
        <button
          key={op.id}
          onClick={() => setActiveFileOp(activeFileOp === op.id ? null : op.id)}
          className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
            activeFileOp === op.id
              ? "bg-orange-600 text-white"
              : "bg-gray-50 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          }`}
        >
          {op.icon} {op.label}
        </button>
      ))}
    </div>

    {/* Input Box */}
    <div className="flex gap-2 items-end">
      <div className="flex-1 relative">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="พิมพ์ข้อความ... (Enter ส่ง, Shift+Enter ขึ้นบรรทัดใหม่)"
          rows={1}
          className="w-full p-3 pr-12 rounded-xl bg-gray-50 border border-gray-300 text-gray-800 text-[15px] resize-none focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 placeholder-gray-500 transition-all"
          style={{ minHeight: "44px", maxHeight: "120px" }}
          onInput={(e) => {
            const t = e.target as HTMLTextAreaElement;
            t.style.height = "44px";
            t.style.height = Math.min(t.scrollHeight, 120) + "px";
          }}
        />
      </div>
      <button
        onClick={handleSend}
        disabled={isTyping || (!input.trim() && !activeFileOp)}
        className="p-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-gray-300 disabled:text-gray-500 text-white transition-colors flex-shrink-0"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
    <p className="text-[11px] text-gray-500 mt-1.5 text-center">KTLTC AI Assistant · Cloudflare Workers AI</p>
  </div>
</div>
    </div>);
}
