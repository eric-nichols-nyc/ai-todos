"use client";
import {
  ChatMessageList,
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef, useEffect } from "react";
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

// Icons for AI message actions
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

// Interface for chat messages
interface ChatMessage {
    id: number;
    message: string;
    role: "user" | "ai";
    suggestedTask?: string;
  }
  
export const Chat = () => {
    // Hook to manage tasks
    const { tasks, addNewTask, updateTask, removeTask } = useTasks();

  // Refs for DOM elements
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // State management
  const [inputMessage, setInputMessage] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        const scrollContainer = messagesContainerRef.current;
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    };

    scrollToBottom();

    // Use a timeout to ensure the scroll happens after the DOM update
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [messages]);
  

  // Handle form submission
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputMessage?.trim()) return;

    createUserMessage(inputMessage);
 
    resetInputAndForm();

    setIsLoading(true);
    setIsGenerating(true);

    try {
      const data = await sendMessageToAPI(inputMessage);
      const aiMessage = createAIMessage(data);
      addMessageToChat(aiMessage);
      console.log(1)

      await handleTaskOperations(inputMessage, data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  // Create a user message object and add it to the chat
  const createUserMessage = (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now(),
      message,
      role: "user",
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
  };

  // Create an AI message object
  const createAIMessage = (data: any): ChatMessage => ({
    id: Date.now() + 1,
    message: data.message,
    role: "ai",
    suggestedTask: data.suggestedTask,
  });

  // Add a message to the chat
  const addMessageToChat = (message: ChatMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  // Reset input and form after submission
  const resetInputAndForm = () => {
    setInputMessage("");
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  // Send message to API
  const sendMessageToAPI = async (message: string) => {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error("Failed to get AI response");

    return response.json();
  };

  // Handle task operations based on user input and AI response
  const handleTaskOperations = async (inputMessage: string, data: any) => {
    if (inputMessage.toLowerCase().startsWith("update task") ||
        inputMessage.toLowerCase().startsWith("change task")) {
      await handleUpdate(inputMessage);
    }

    if (data.newTasks && data.newTasks.length > 0) {
      await handleNewTasks(data.newTasks);
    } else if (inputMessage.toLowerCase().includes("delete task") ||
               inputMessage.toLowerCase().includes("remove task")) {
      await handleTaskOperation(inputMessage);
    }
  };

  // Handle adding new tasks
  const handleNewTasks = async (newTasks: any[]) => {
    for (const task of newTasks) {
      await addNewTask(task.task, task.priority || "medium");
    }
  };

  // Handle errors in message processing
  const handleError = (error: any) => {
    console.error("Error sending message:", error);
    const errorMessage: ChatMessage = {
      id: Date.now() + 1,
      message: "Sorry, I encountered an error. Please try again.",
      role: "ai",
    };
    addMessageToChat(errorMessage);
  };

  // Handle updating a task
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

  // Handle task operations (update or remove)
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

  // Handle clicking on a suggested option
  const handleOptionClick = (option: string) => {
    setInputMessage(option);
  };

  // Handle keydown events in the input field
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isGenerating || isLoading || !inputMessage) return;
      setIsGenerating(true);
      formRef.current?.requestSubmit();
    }
  };

  // Determine the variant of the message bubble
  const getMessageVariant = (role: string) => role === "ai" ? "received" : "sent";

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden bg-slate-200">
            {/* Initial Message */}
            {messages.length === 0 && (
          <div className='w-full bg-background shadow-sm border rounded-lg p-8 flex flex-col gap-2'>
            <h1 className='font-bold'>Welcome to this example app.</h1>
            <p className='text-muted-foreground text-sm'>This Next.js application demonstrates an AI-powered task management system. It combines a task list interface with a chatbot, allowing users to manage tasks through natural language interactions. The app utilizes <a href="https://github.com/jakobhoeg/shadcn-chat" className='font-bold inline-flex flex-1 justify-center gap-1 leading-4 hover:underline'>shadcn-chat
              <svg aria-hidden="true" height="7" viewBox="0 0 6 6" width="7" className="opacity-70"><path d="M1.25215 5.54731L0.622742 4.9179L3.78169 1.75597H1.3834L1.38936 0.890915H5.27615V4.78069H4.40513L4.41109 2.38538L1.25215 5.54731Z" fill="currentColor"></path></svg>
            </a> components for the UI and the <a href="https://sdk.vercel.ai/" className='font-bold inline-flex flex-1 justify-center gap-1 leading-4 hover:underline'>Vercel AI SDK
                <svg aria-hidden="true" height="7" viewBox="0 0 6 6" width="7" className="opacity-70"><path d="M1.25215 5.54731L0.622742 4.9179L3.78169 1.75597H1.3834L1.38936 0.890915H5.27615V4.78069H4.40513L4.41109 2.38538L1.25215 5.54731Z" fill="currentColor"></path></svg>
              </a> for AI integration. Users can add, update, and remove tasks using the chatbot, which processes natural language commands and provides intelligent responses.</p>
            <p className='text-muted-foreground text-sm'>Make sure to also checkout the shadcn-chat support component at the bottom right corner.</p>
          </div>
        )}

        {/* Chat Message List */}
        <ChatMessageList ref={messagesContainerRef} className="flex-1 overflow-y-auto">
          {messages.map((message, index) => {
            const variant = getMessageVariant(message.role!);
            return (
              <div key={index} className="flex flex-col gap-2 p-4">
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
                      <div className="prose dark:prose-invert">
                        {message.message}
                        {message.role === "ai" && message.suggestedTask && (
                          <div className="mt-2">
                            <h4 className="text-sm font-semibold">Suggested Task:</h4>
                            <ul className="list-disc list-inside">
                              <li className="font-bold">{message.suggestedTask}</li>
                            </ul>
                          </div>
                        )}
                      </div>
                      {message.role === "ai" && (
                        <div className="flex items-center mt-3 gap-1">
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
              </div>
            );
          })}
        </ChatMessageList>
      </div>
      {/* Chat Input Form */}
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="relative rounded-lg h-[86px] border bg-background focus-within:ring-1 focus-within:ring-ring flex-shrink-0"
      >
        <div className="flex items-center p-2">
          <ChatInput
            ref={inputRef}
            onKeyDown={onKeyDown}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-grow min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0 pr-20"
          />
          <Button
            disabled={!inputMessage || isLoading}
            type="submit"
            size="sm"
            className="absolute right-4 bottom-4 gap-1.5"
          >
            Send
            <CornerDownLeft className="size-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
