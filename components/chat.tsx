"use client";

import { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { ChatHeader } from "@/components/chat-header";
import type { Vote } from "@/lib/db/schema";
import { fetcher, generateUUID } from "@/lib/utils";
import { MultimodalInput } from "./multimodal-input";
import { Messages } from "./messages";
import { toast } from "sonner";

import type { Message } from "./message";
import { useRouter } from "next/navigation";

type ChatProps = {
  id: string;
  initialMessages: Array<Message>;
  isReadonly: boolean;
};

export function Chat({
  id,
  initialMessages,
  isReadonly,
}: ChatProps) {
  const { mutate } = useSWRConfig();
  const [messages, setMessages] = useState<Array<Message>>(initialMessages);
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    
    // Check for commands first
    if (input.trim() === "/test") {
      router.push(`/test?chatId=${id}`);
      setInput(""); 
      return;
    }

    if (input.trim() === "/leaderboard") {
      router.push(`/leaderboard`);
      setInput(""); 
      return;
    }
    
    const newMessage: Message = {
      id: generateUUID(),
      role: "user",
      content: input,
    };
    
    // Optimistically update UI
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id, // Chat ID
          messages: [...messages, newMessage], // Send all messages including new one
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch response from the server");
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let receivedText = "";
      
      if (reader) {
        // For streaming response, we need to handle differently
        let isFirstChunk = true;
        let assistantMessageId = generateUUID();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          receivedText += chunk;
          
          // Update UI with streamed response
          setMessages((prevMessages) => {
            if (isFirstChunk) {
              isFirstChunk = false;
              return [
                ...prevMessages,
                { id: assistantMessageId, role: "assistant", content: receivedText },
              ];
            } else {
              return prevMessages.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: receivedText } 
                  : msg
              );
            }
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred, please try again!");
    }
  };

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher
  );

  // Handle streaming response from the server
  useEffect(() => {
    const eventSource = new EventSource(`/api/chat`); // Assuming you create an endpoint for this

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.text) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: generateUUID(), role: "assistant", content: data.text },
        ]);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      toast.error("Error while receiving response");
    };

    return () => {
      eventSource.close();
    };
  }, [id]);

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <ChatHeader
        chatId={id}
        isReadonly={isReadonly}
      />

      <Messages
        chatId={id}
        status="idle"
        votes={votes}
        messages={messages.map((msg) => ({
          ...msg,
          content: msg.content || "",
        }))} // Ensure all messages have string content
        setMessages={setMessages}
        reload={() => Promise.resolve()}
        isReadonly={isReadonly}
      />

      <form
        onSubmit={handleSubmit}
        className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl"
      >
        {!isReadonly && (
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
          />
        )}
      </form>
    </div>
  );
}
