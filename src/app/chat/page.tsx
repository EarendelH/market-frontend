"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(s => s.user);

  // 获取会话列表
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiClient.get<any[]>("/conversations"),
    refetchInterval: 5000, // 每 5 秒轮询一次刷新列表
  });

  // 获取选中会话的消息
  const { data: chatData } = useQuery({
    queryKey: ["messages", selectedId],
    queryFn: () => apiClient.get<any>(`/conversations/${selectedId}/messages`),
    enabled: !!selectedId,
    refetchInterval: 3000, // 轮询拉取最新消息
  });

  // 发送消息
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => 
      apiClient.post(`/conversations/${selectedId}/messages`, { content }),
    onSuccess: () => {
      setInputValue("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData?.messages?.length]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* 左侧会话列表 */}
      <div className="flex flex-col border-r bg-background w-full md:w-80 shrink-0">
        <div className="px-4 py-3 border-b"><h1 className="font-bold text-lg">消息</h1></div>
        <div className="overflow-y-auto flex-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={cn("w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/60 border-b", selectedId === conv.id && "bg-muted")}
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                {conv.seller_id === currentUser?.id ? "买" : "卖"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">商品 ID: {conv.item_id}</p>
                <p className="text-sm truncate mt-0.5">{conv.last_message || "暂无消息"}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 右侧聊天区域 */}
      <div className="flex flex-col flex-1 bg-background">
        {selectedId && chatData ? (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {chatData.messages.map((msg: any) => {
                const isMe = msg.sender_id === currentUser?.id;
                return (
                  <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn("rounded-2xl px-4 py-2.5 text-sm", isMe ? "bg-primary text-primary-foreground" : "bg-muted")}>
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
                onKeyDown={(e) => e.key === "Enter" && sendMessageMutation.mutate(inputValue)}
                className="flex-1 rounded-xl bg-muted px-4 outline-none"
                placeholder="输入消息..."
              />
              <button 
                onClick={() => sendMessageMutation.mutate(inputValue)}
                disabled={!inputValue.trim() || sendMessageMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl"
              >
                发送
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">选择一个对话</div>
        )}
      </div>
    </div>
  );
}