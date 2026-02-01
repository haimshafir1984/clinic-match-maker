import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isClosed: boolean;
}

export function ChatMessages({ messages, isClosed }: ChatMessagesProps) {
  const { data: myProfile } = useProfile();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <p className="text-muted-foreground mb-2">אין הודעות עדיין</p>
          <p className="text-sm text-muted-foreground">
            {isClosed ? "ההתאמה נסגרה" : "שלח הודעה ראשונה!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message, index) => {
        const isMe = message.sender_id === myProfile?.id;
        const showTime = 
          index === 0 || 
          new Date(message.created_at).getTime() - 
          new Date(messages[index - 1].created_at).getTime() > 300000;

        return (
          <div key={message.id}>
            {showTime && (
              <p className="text-center text-xs text-muted-foreground my-2">
                {format(new Date(message.created_at), "EEEE, HH:mm", { locale: he })}
              </p>
            )}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex",
                isMe ? "justify-start" : "justify-end"
              )}
            >
              <div
                className={cn(
                  "max-w-[75%] px-4 py-2 rounded-2xl",
                  isMe
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-secondary-foreground rounded-bl-sm"
                )}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </motion.div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
