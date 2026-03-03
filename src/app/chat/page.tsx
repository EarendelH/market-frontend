"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  content: string;
  sender: "me" | "other";
  time: string;
}

interface Conversation {
  id: number;
  user: string;
  initials: string;
  item: string;
  lastMessage: string;
  time: string;
  unread: number;
  color: string;
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: 1,
    user: "张同学",
    initials: "张",
    item: "机械键盘（青轴）",
    lastMessage: "那个键盘还在吗？",
    time: "10:23",
    unread: 2,
    color: "from-blue-400 to-blue-600",
    messages: [
      { id: 1, content: "你好，那个机械键盘还在卖吗？", sender: "other", time: "10:20" },
      { id: 2, content: "在的！你什么时候方便过来看看？", sender: "me", time: "10:21" },
      { id: 3, content: "那个键盘还在吗？能便宜一点吗", sender: "other", time: "10:23" },
    ],
  },
  {
    id: 2,
    user: "李同学",
    initials: "李",
    item: "AirPods Pro 二代",
    lastMessage: "好的，明天图书馆门口见！",
    time: "昨天",
    unread: 0,
    color: "from-slate-400 to-slate-600",
    messages: [
      { id: 1, content: "AirPods Pro还有吗，1200能接受", sender: "other", time: "昨天 14:00" },
      { id: 2, content: "可以，成色很好的，电量也还不错", sender: "me", time: "昨天 14:05" },
      { id: 3, content: "好的，明天在哪里交易方便？", sender: "other", time: "昨天 14:10" },
      { id: 4, content: "好的，明天图书馆门口见！", sender: "me", time: "昨天 14:12" },
    ],
  },
  {
    id: 3,
    user: "王同学",
    initials: "王",
    item: "高数教材",
    lastMessage: "谢谢！收到了，非常满意",
    time: "周一",
    unread: 0,
    color: "from-amber-400 to-orange-500",
    messages: [
      { id: 1, content: "高数书还有吗", sender: "other", time: "周一 09:00" },
      { id: 2, content: "还有一本，25元", sender: "me", time: "周一 09:10" },
      { id: 3, content: "好的，荔园楼下可以吗", sender: "other", time: "周一 09:15" },
      { id: 4, content: "可以，下午三点见", sender: "me", time: "周一 09:16" },
      { id: 5, content: "谢谢！收到了，非常满意", sender: "other", time: "周一 15:20" },
    ],
  },
  {
    id: 4,
    user: "陈同学",
    initials: "陈",
    item: "Nike跑鞋 42码",
    lastMessage: "发图片看看？",
    time: "周日",
    unread: 1,
    color: "from-red-400 to-rose-600",
    messages: [
      { id: 1, content: "那双Nike跑鞋是42码的吗", sender: "other", time: "周日 16:00" },
      { id: 2, content: "对的，标准42码", sender: "me", time: "周日 16:05" },
      { id: 3, content: "发图片看看？", sender: "other", time: "周日 16:06" },
    ],
  },
];

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showThread, setShowThread] = useState(false); // mobile: show thread panel
  const [inputValue, setInputValue] = useState("");
  const [conversations, setConversations] = useState(mockConversations);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages.length]);

  function handleSelect(conv: Conversation) {
    setSelectedId(conv.id);
    setShowThread(true);
    // clear unread
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
    );
  }

  function handleSend() {
    if (!inputValue.trim() || !selectedId) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newMsg: Message = {
      id: Date.now(),
      content: inputValue.trim(),
      sender: "me",
      time: timeStr,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: inputValue.trim(), time: timeStr }
          : c
      )
    );
    setInputValue("");
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversation list */}
      <div
        className={cn(
          "flex flex-col border-r bg-background w-full md:w-80 shrink-0",
          showThread ? "hidden md:flex" : "flex"
        )}
      >
        <div className="px-4 py-3 border-b">
          <h1 className="font-bold text-lg">消息</h1>
        </div>

        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground py-12">
            <span className="text-5xl">💬</span>
            <p className="text-sm">暂无消息</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelect(conv)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                  selectedId === conv.id && "bg-muted"
                )}
              >
                {/* Avatar */}
                <div className={`h-12 w-12 shrink-0 rounded-full bg-gradient-to-br ${conv.color} flex items-center justify-center text-white font-bold text-base relative`}>
                  {conv.initials}
                  {conv.unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {conv.unread}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-sm">{conv.user}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{conv.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conv.item}</p>
                  <p className={cn("text-sm truncate mt-0.5", conv.unread > 0 ? "font-medium" : "text-muted-foreground")}>
                    {conv.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message thread */}
      <div
        className={cn(
          "flex flex-col flex-1 bg-background",
          !showThread ? "hidden md:flex" : "flex"
        )}
      >
        {selected ? (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-background/95 backdrop-blur-sm">
              <button
                className="md:hidden rounded-full p-1.5 hover:bg-muted transition-colors text-lg leading-none"
                onClick={() => setShowThread(false)}
              >
                ←
              </button>
              <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${selected.color} flex items-center justify-center text-white font-bold text-sm`}>
                {selected.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{selected.user}</p>
                <p className="text-xs text-muted-foreground truncate">{selected.item}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {selected.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex", msg.sender === "me" ? "justify-end" : "justify-start")}
                >
                  <div className="max-w-[72%] space-y-1">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        msg.sender === "me"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      )}
                    >
                      {msg.content}
                    </div>
                    <p className={cn("text-[10px] text-muted-foreground", msg.sender === "me" ? "text-right" : "text-left")}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t px-4 py-3 flex gap-2 items-end bg-background">
              <textarea
                rows={1}
                placeholder="输入消息..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 resize-none rounded-xl bg-muted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all max-h-32"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <span className="text-7xl">💬</span>
            <div className="text-center">
              <p className="font-medium">选择一个对话</p>
              <p className="text-sm mt-1">与卖家/买家沟通交易详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
