"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("请求失败");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("无法读取响应");

      const decoder = new TextDecoder();
      let assistantMsg = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        assistantMsg += text;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantMsg,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "抱歉，我遇到了一点问题，请稍后再试。" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "200-300元有什么推荐？",
    "夏天适合什么连衣裙？",
    "帮我搭配一身通勤装",
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a96e] text-white shadow-lg transition-all hover:bg-[#a8884a] hover:scale-105"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-80 flex-col rounded-lg bg-white shadow-xl ring-1 ring-black/5 sm:w-96">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#e8e3de] px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c9a96e] text-xs text-white">
              AI
            </div>
            <div>
              <p className="text-sm font-medium text-[#2d2a24]">LUXE 购物助手</p>
              <p className="text-xs text-[#7a746e]">在线为您服务</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4" style={{ maxHeight: 400 }}>
            {messages.length === 0 && (
              <div className="py-8 text-center text-sm text-[#7a746e]">
                <p className="mb-2">👋 您好！我是 LUXE 购物助手</p>
                <p>可以问我关于商品、搭配的问题</p>
                <div className="mt-4 space-y-2">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="block w-full rounded-sm border border-[#e8e3de] px-3 py-2 text-xs text-[#7a746e] transition-colors hover:border-[#c9a96e] hover:text-[#2d2a24]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-sm px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#c9a96e] text-white"
                      : "bg-[#f5f0eb] text-[#2d2a24]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-sm bg-[#f5f0eb] px-3 py-2 text-sm text-[#7a746e]">
                  <span className="animate-pulse">思考中...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[#e8e3de] p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入您的问题..."
                className="flex-1 rounded-sm border border-[#e8e3de] px-3 py-2 text-sm outline-none transition-colors focus:border-[#c9a96e]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-sm bg-[#c9a96e] px-3 py-2 text-sm text-white transition-colors hover:bg-[#a8884a] disabled:opacity-50"
              >
                发送
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
