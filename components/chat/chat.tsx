"use client";
import {Message, UserData} from "@/data";
import React, { useRef } from "react";
import { ChatList } from "./chat-list";

type ChatProps = {
  messages: Message[];
  selectedUser: UserData;
  isMobile: boolean;
}

const Chat = ({messages, selectedUser, isMobile}: ChatProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [userMessages, setMessages] = React.useState<Message[]>(messages);

  const sendMessage = (newMessage: Message) => {
    setMessages([...userMessages, newMessage]);
  };


  return (
    <div className="flex flex-col justify-between w-full h-full">      
      <ChatList messages={userMessages} selectedUser={selectedUser} isMobile={isMobile} sendMessage={sendMessage}/>
    </div>
  );
};

export default Chat;
