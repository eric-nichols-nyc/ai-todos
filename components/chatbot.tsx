"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendIcon } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import ReactMarkdown from "react-markdown";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
};

// Interface for chat messages
interface ChatMessage {
  id: number;
  message: string;
  role: "user" | "ai";
  suggestedTask?: string;
}

export default function Chatbot() {
  const { tasks, addNewTask, updateTask, removeTask } = useTasks();
  // State management
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Refs for DOM elements
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const onSubmit = async () => {
    if (inputMessage?.trim() === "") return;

    // const newMessage: Message = {
    //   id: Date.now(),
    //   text: inputMessage,
    //   sender: 'user'
    // }

    // setMessages(prevMessages => [...prevMessages, newMessage])
    // setInputMessage('')
    // setIsTyping(true)

    // // Simulate bot response
    // setTimeout(() => {
    //   const botMessage: Message = {
    //     id: Date.now(),
    //     text: 'Thank you for your message. How can I assist you further?',
    //     sender: 'bot'
    //   }
    //   setMessages(prevMessages => [...prevMessages, botMessage])
    //   setIsTyping(false)
    // }, 2000)
    if (!inputMessage?.trim()) return;

    createUserMessage(inputMessage);

    resetInputAndForm();

    setIsLoading(true);
    setIsGenerating(true);

    try {
      const data = await sendMessageToAPI(inputMessage);
      const aiMessage = createAIMessage(data);
      const message = removeQuotesFromList(aiMessage.message);
      aiMessage.message = message;
      addMessageToChat(aiMessage);

      await handleTaskOperations(inputMessage, data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  function removeQuotesFromList(text: string) {
    // Split the text into lines
    const lines = text.split("\n");

    // Process each line
    const processedLines = lines.map((line) => {
      // Check if the line is a list item (starts with '- ')
      if (line.trim().startsWith("- ")) {
        // Remove quotes from the beginning and end of the line content
        return line.replace(/- "(.*)"/, "- $1");
      }
      // If it's not a list item, return the line as is
      return line;
    });

    // Join the lines back together
    return processedLines.join("\n");
  }

  // Create a user message object and add it to the chat
  const createUserMessage = (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now(),
      message,
      role: "user",
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
  };

  // Add a message to the chat
  const addMessageToChat = (message: ChatMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  // Create an AI message object
  const createAIMessage = (data: any): ChatMessage => ({
    id: Date.now() + 1,
    message: data.message,
    role: "ai",
    suggestedTask: data.suggestedTask,
  });

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
    if (
      inputMessage.toLowerCase().startsWith("update task") ||
      inputMessage.toLowerCase().startsWith("change task")
    ) {
      await handleUpdate(inputMessage);
    }

    if (data.newTasks && data.newTasks.length > 0) {
      await handleNewTasks(data.newTasks);
    } else if (
      inputMessage.toLowerCase().includes("delete task") ||
      inputMessage.toLowerCase().includes("remove task")
    ) {
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
      console.log(isGenerating, isLoading, inputMessage);
      e.preventDefault();
      if (isGenerating || isLoading || !inputMessage) return;
      setIsGenerating(true);
      onSubmit();
    }
  };

  // Determine the variant of the message bubble
  const getMessageVariant = (role: string) =>
    role === "ai" ? "received" : "sent";

  return (
    <Card className="border w-full h-full mx-auto flex flex-col">
      <CardHeader className="flex flex-row items-center">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src="/placeholder.svg?height=40&width=40"
            alt="Bot Avatar"
          />
          <AvatarFallback>🤖</AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <h2 className="text-lg font-semibold">Chatbot</h2>
          <p className="text-sm text-muted-foreground">
            Let me help you with you taks
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto p-4">
        {/* Initial Message */}
        {messages.length === 0 && (
          <div className="w-full bg-background shadow-sm border rounded-lg p-8 flex flex-col gap-2">
            <h1 className="font-bold">Welcome to this AI todo app.</h1>
            <p className="text-muted-foreground text-sm">
              This is a simple Next.JS example application created using{" "}
              <a
                href="https://github.com/jakobhoeg/shadcn-chat"
                className="font-bold inline-flex flex-1 justify-center gap-1 leading-4 hover:underline"
              >
                shadcn-chat
                <svg
                  aria-hidden="true"
                  height="7"
                  viewBox="0 0 6 6"
                  width="7"
                  className="opacity-70"
                >
                  <path
                    d="M1.25215 5.54731L0.622742 4.9179L3.78169 1.75597H1.3834L1.38936 0.890915H5.27615V4.78069H4.40513L4.41109 2.38538L1.25215 5.54731Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </a>{" "}
              components. It uses{" "}
              <a
                href="https://sdk.vercel.ai/"
                className="font-bold inline-flex flex-1 justify-center gap-1 leading-4 hover:underline"
              >
                Vercel AI SDK
                <svg
                  aria-hidden="true"
                  height="7"
                  viewBox="0 0 6 6"
                  width="7"
                  className="opacity-70"
                >
                  <path
                    d="M1.25215 5.54731L0.622742 4.9179L3.78169 1.75597H1.3834L1.38936 0.890915H5.27615V4.78069H4.40513L4.41109 2.38538L1.25215 5.54731Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </a>{" "}
              for the AI integration. Build chat interfaces like this at
              lightspeed with shadcn and shadcn-chat.
            </p>
            <p className="text-muted-foreground text-sm">
              Make sure to also checkout the shadcn-chat support component at
              the bottom right corner.
            </p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <motion.div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {/* <ReactMarkdown>{message.message}</ReactMarkdown> */}
                <ReactMarkdown
                  components={{
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-5" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="mb-2" {...props} />
                    ),
                  }}
                >
                  {message.message}
                </ReactMarkdown>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-muted rounded-lg p-3">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  transition: { repeat: Infinity, duration: 0.6 },
                }}
              >
                Typing...
              </motion.div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <SendIcon className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
