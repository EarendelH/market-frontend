"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Conversation {
  id: number;
  buyer_id: number;
  seller_id: number;
  item_id: number;
  item_title?: string;
  item_cover?: string | null;
  other_username?: string;
  other_avatar_url?: string | null;
  last_message?: string | null;
  updated_at?: string;
}

function ChatInner() {
  const searchParams = useSearchParams();
  const initialConv = searchParams.get("conversationId");
  const [selectedId, setSelectedId] = useState<number | null>(initialConv ? Number(initialConv) : null);
  const [inputValue, setInputValue] = useState("");
  const [showList, setShowList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user: currentUser, isAuthenticated, isHydrating } = useAuthStore();

  useEffect(() => {
    const cid = searchParams.get("conversationId");
    if (cid && !Number.isNaN(Number(cid))) {
      setSelectedId(Number(cid));
      setShowList(false);
    }
  }, [searchParams]);

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiClient.get<Conversation[]>("/conversations"),
    enabled: isAuthenticated && !isHydrating,
    refetchInterval: 5000,
  });

  const { data: chatData } = useQuery({
    queryKey: ["messages", selectedId],
    queryFn: () => apiClient.get<{ conversation: Conversation; messages: { id: number; sender_id: number; content: string; created_at?: string }[] }>(`/conversations/${selectedId}/messages`),
    enabled: !!selectedId && isAuthenticated,
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => apiClient.post(`/conversations/${selectedId}/messages`, { content }),
    onSuccess: () => {
      setInputValue("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData?.messages?.length]);

  const selectConversation = (id: number) => {
    setSelectedId(id);
    setShowList(false);
  };

  if (isHydrating) {
    return <div className="flex h-full items-center justify-center text-muted-foreground p-8">加载中…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-muted-foreground">登录后可使用站内聊天</p>
        <Link href="/login?redirect=/chat" className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
          去登录
        </Link>
      </div>
    );
  }

  const selectedConv = conversations.find((c) => c.id === selectedId);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversation list */}
      <div className={cn(
        "flex flex-col border-r bg-background w-full md:w-80 shrink-0",
        !showList && "hidden md:flex"
      )}>
        <div className="px-4 py-3 border-b">
          <h1 className="font-bold text-lg">消息</h1>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">暂无会话</div>
          ) : conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => selectConversation(conv.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/60 border-b",
                selectedId === conv.id && "bg-muted"
              )}
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs overflow-hidden">
                {conv.other_avatar_url ? (
                  <img src={conv.other_avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (conv.other_username || "?").charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{conv.other_username || "用户"}</p>
                  {conv.updated_at && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{conv.item_title || "商品会话"}</p>
                <p className="text-xs truncate mt-0.5 text-muted-foreground">{conv.last_message || "暂无消息"}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message panel */}
      <div className={cn(
        "flex flex-col flex-1 bg-background",
        showList && "hidden md:flex"
      )}>
        {selectedId && chatData ? (
          <>
            <div className="px-4 py-3 border-b flex items-center gap-3 bg-background/95 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setShowList(true)}
                className="md:hidden p-1 hover:bg-muted rounded-full"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{selectedConv?.other_username || "用户"}</p>
                <p className="text-xs text-muted-foreground truncate">{selectedConv?.item_title || "商品会话"}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {chatData.messages.map((msg) => {
                const isMe = Number(msg.sender_id) === Number(currentUser?.id);
                return (
                  <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn("rounded-2xl px-4 py-2.5 text-sm max-w-[85%]", isMe ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t px-4 py-3 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && inputValue.trim() && sendMessageMutation.mutate(inputValue)}
                className="flex-1 rounded-xl bg-muted px-4 py-2.5 outline-none"
                placeholder="输入消息..."
              />
              <button
                type="button"
                onClick={() => inputValue.trim() && sendMessageMutation.mutate(inputValue)}
                disabled={!inputValue.trim() || sendMessageMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium"
              >
                发送
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {conversations.length > 0 ? "选择一个对话" : "暂无会话，去商品页面联系卖家吧"}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center text-muted-foreground">加载中…</div>}>
      <ChatInner />
    </Suspense>
  );
}
