"use client";
import { Message, UserData } from "@/data";
import React, { useState, useRef } from "react";
import { Textarea } from "../ui/textarea";
import { SendHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ChatProps = {
  messages?: Message[];
  selectedUser: UserData;
  isMobile: boolean;
  sendMessage: (newMessage: Message) => void;
};

export const ChatList = ({
  messages,
  selectedUser,
  isMobile,
  sendMessage,
}: ChatProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState("");

  // // set the container ref to scroll to the bottom when a new message is added
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // create a submit function to add a new message
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    handleSend();
    form.reset();

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSend = () => {
    if (inputRef.current) {
      const message = inputRef.current.value;
      const newMessage: Message = {
        id: message.length + 1,
        name: selectedUser.name,
        message: message.trim(),
      };
      sendMessage(newMessage);
      setMessage("");
      inputRef.current.focus();
    }
    formRef.current?.reset();
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className="border container py-2 flex flex-col gap-2 rounded-sm w-full h-full overflow-x-hidden overflow-y-auto"
      >
        <AnimatePresence initial={false}>
          {messages?.map((message, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.1 },
                layout: {
                  type: "spring",
                  bounce: 0.3,
                  duration: messages.indexOf(message) * 0.05 + 0.2,
                },
              }}
              style={{
                originX: 0.5,
                originY: 0.5,
              }}
              className={cn(
                "flex flex-col gap-2 p-4 whitespace-pre-wrap",
                message.name === selectedUser.name ? "items-end" : "items-start"
              )}
            >
              <span className=" bg-accent p-3 rounded-md max-w-xs">
                {message.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="relative h-20 flex gap-2 items-center">
        <form
          ref={formRef}
          className="w-full container flex gap-2 items-center py-2 border"
          onSubmit={handleSubmit}
        >
          <Textarea
            ref={inputRef}
            placeholder="Aa"
            name="message"
            onKeyDown={handleKeyPress}
            className="w-full flex items-center min-h-[36px] h-4 resize-none overflow-hidden bg-background"
          />
          <Button type="submit" className="flex items-center justify-center">
            <SendHorizontal size={20} className="text-muted-foreground" />
          </Button>
        </form>
      </div>
    </>
  );
};
