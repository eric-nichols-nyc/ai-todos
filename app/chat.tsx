"use client";
import {
  ChatMessageList,
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";
import {
    CopyIcon,
    CornerDownLeft,
    Mic,
    Paperclip,
    RefreshCcw,
    Volume2,
  } from "lucide-react";

const ChatAiIcons = [
    {
      icon: CopyIcon,
      label: "Copy",
    },
    {
      icon: RefreshCcw,
      label: "Refresh",
    },
    {
      icon: Volume2,
      label: "Volume",
    },
  ];

interface ChatMessage {
    id: number;
    message: string;
    role: "user" | "ai";
    suggestedTask?: string;
  }
  
export const Chat = () => {
    const { tasks, addNewTask, updateTask, removeTask } = useTasks();

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [inputMessage, setInputMessage] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    // return if inputMessage is empty
    if (!inputMessage?.trim()) return;
    const userMessage: ChatMessage = {
        id: Date.now(),
        message: inputMessage,
        role: "user",
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInputMessage("");
      setIsLoading(true);
      
      // Reset the form
      if (formRef.current) {
        formRef.current.reset();
      }
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: inputMessage }),
        });
  
        if (!response.ok) throw new Error("Failed to get AI response");
  
        const data = await response.json();
  
        const aiMessage: ChatMessage = {
          id: Date.now() + 1,
          message: data.message,
          role: "ai",
          suggestedTask: data.suggestedTask,
        };

        console.log('aiMessage:', aiMessage);
  
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
  
        if (
          inputMessage.toLowerCase().startsWith("update task") ||
          inputMessage.toLowerCase().startsWith("change task")
        ) {
          console.log("update task");
          handleUpdate(inputMessage);
        }
  
        if (data.newTasks && data.newTasks.length > 0) {
          console.log("data:", data.newTasks);
          const newTasks = [];
          for (const task of data.newTasks) {
            console.log(task);
            const newTask = addNewTask(task.task, task.priority || "medium");
            newTasks.push(newTask);
          }
        } else if (
          inputMessage.toLowerCase().includes("delete task") ||
          inputMessage.toLowerCase().includes("remove task")
        ) {
          await handleTaskOperation(inputMessage);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: ChatMessage = {
          id: Date.now() + 1,
          message: "Sorry, I encountered an error. Please try again.",
          role: "ai",
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }

  };

  const handleUpdate = async (message: string) => {
    const match = message.match(/(update|change) task (.*) to (.*)/i);
    console.log(match);
    if (!match) {
      return `I'm sorry, I couldn't understand the task update request. Please use the format 'update task [old task] to [new task]'.`;
    }

    const [, oldTaskName, newTaskName] = match;

    const taskToUpdate = tasks.find((task) =>
      task.task.toLowerCase().includes(oldTaskName.toLowerCase())
    );

    if (taskToUpdate) {
      try {
        await updateTask(taskToUpdate.id, { task: newTaskName });
        return `Task "${taskToUpdate.task}" has been updated to "${newTaskName}"`;
      } catch (error) {
        return `I'm sorry, there was an error updating the task: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
      }
    } else {
      return `I couldn't find a task matching "${oldTaskName}" in your list. Would you like to add "${newTaskName}" as a new task instead?`;
    }
  };

  const handleTaskOperation = async (message: string) => {
    console.log("message:", message);
    const words = message.toLowerCase().split(" ");
    const taskIndex = words.indexOf("task");
    if (taskIndex === -1) return;

    const taskId = words[taskIndex + 1];
    if (message.toLowerCase().includes("update task")) {
      const newTaskDetails = message.slice(
        message.toLowerCase().indexOf("to") + 3
      );
      await updateTask(taskId, { task: newTaskDetails });
    } else if (message.toLowerCase().includes("remove task")) {
      await removeTask(taskId);
    }
  };

  const handleOptionClick = (option: string) => {
    setInputMessage(option);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isGenerating || isLoading || !inputMessage) return;
      setIsGenerating(true);
      onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const getMessageVariant = (role: string) => role === "ai" ? "received" : "sent";

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-y-auto bg-red-300">
            {/* Initial Message */}
            {messages.length === 0 && (
          <div className='w-full bg-background shadow-sm border rounded-lg p-8 flex flex-col gap-2'>
            <h1 className='font-bold'>Welcome to this example app.</h1>
            <p className='text-muted-foreground text-sm'>This is a simple Next.JS example application created using <a href="https://github.com/jakobhoeg/shadcn-chat" className='font-bold inline-flex flex-1 justify-center gap-1 leading-4 hover:underline'>shadcn-chat
              <svg aria-hidden="true" height="7" viewBox="0 0 6 6" width="7" className="opacity-70"><path d="M1.25215 5.54731L0.622742 4.9179L3.78169 1.75597H1.3834L1.38936 0.890915H5.27615V4.78069H4.40513L4.41109 2.38538L1.25215 5.54731Z" fill="currentColor"></path></svg>
            </a> components. It uses <a href="https://sdk.vercel.ai/" className='font-bold inline-flex flex-1 justify-center gap-1 leading-4 hover:underline'>Vercel AI SDK
                <svg aria-hidden="true" height="7" viewBox="0 0 6 6" width="7" className="opacity-70"><path d="M1.25215 5.54731L0.622742 4.9179L3.78169 1.75597H1.3834L1.38936 0.890915H5.27615V4.78069H4.40513L4.41109 2.38538L1.25215 5.54731Z" fill="currentColor"></path></svg>
              </a> for the AI integration. Build chat interfaces like this at lightspeed with shadcn and shadcn-chat.</p>
            <p className='text-muted-foreground text-sm'>Make sure to also checkout the shadcn-chat support component at the bottom right corner.</p>
          </div>
        )}

        <ChatMessageList ref={messagesContainerRef}>
          <AnimatePresence>
            {messages.map((message, index) => {
              const variant = getMessageVariant(message.role!);
              return (
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
                      duration: index * 0.05 + 0.2,
                    },
                  }}
                  style={{ originX: 0.5, originY: 0.5 }}
                  className="flex flex-col gap-2 p-4"
                >
                  <ChatBubble key={index} variant={variant}>
                    <Avatar>
                      {message.role === "user" ? (
                        <AvatarImage
                          src='/avatar.jpeg'
                          alt="User Avatar"
                        />
                      ) : (
                        <AvatarFallback>🤖</AvatarFallback>
                      )}
                    </Avatar>
                    <ChatBubbleMessage
                      isLoading={isLoading}
                      variant={variant}
                    >
                      {message.message}
                      {message.role === "ai" && (
                        <div className="flex items-center mt-1.5 gap-1">
                          {!isLoading && (
                            <>
                              {ChatAiIcons.map((icon, index) => {
                                const Icon = icon.icon;
                                return (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="icon"
                                    className="size-5"
                                  >
                                    <Icon className="size-3" />
                                  </Button>
                                );
                              })}
                            </>
                          )}
                        </div>
                      )}
                    </ChatBubbleMessage>
                  </ChatBubble>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </ChatMessageList>
      </div>
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="relative rounded-lg h-[86px] border bg-background focus-within:ring-1 focus-within:ring-ring flex-shrink-0"
      >
        <ChatInput
          ref={inputRef}
          onKeyDown={onKeyDown}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message here..."
          className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
        />
        <Button
          disabled={!inputMessage || isLoading}
          type="submit"
          size="sm"
          className="ml-auto gap-1.5"
        >
          Send Message
          <CornerDownLeft className="size-3.5" />
        </Button>
      </form>
    </div>
  );
};
