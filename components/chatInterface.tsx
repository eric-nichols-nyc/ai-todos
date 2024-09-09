"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTasks } from "@/hooks/useTasks";
import QuickOptions from "./QuickOptions";

interface ChatMessage {
  id: number;
  content: string;
  sender: "user" | "ai";
  suggestedTask?: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { tasks, addNewTask, updateTask, removeTask } = useTasks();

  const quickOptions = [
    "Get a haircut",
    "Buy groceries",
    "Schedule dentist appointment",
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    addWelcomeMessage();
  }, []);

  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: Date.now(),
      content:
        "Hello! I'm your AI assistant. How can I help you manage your tasks today?",
      sender: "ai",
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      content: inputMessage,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");
    setIsLoading(true);

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
        content: data.message,
        sender: "ai",
        suggestedTask: data.suggestedTask,
      };

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
          const newTask: Task = {
            id: Date.now().toString(),
            task: task.task,
            priority: task.priority || "medium",
            completed: false,
            created_at: new Date().toISOString(),
          };
          addNewTask(newTask);
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
        content: "Sorry, I encountered an error. Please try again.",
        sender: "ai",
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

  return (
    <Card className="w-full h-[calc(100vh-3rem)] flex flex-col shadow-lg">
      <CardHeader className="bg-primary text-primary-foreground">
        <h2 className="text-2xl font-bold">Chat with AI Assistant</h2>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-4">
        <ScrollArea className="h-full pr-4 scrollbar-hide" ref={scrollAreaRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.sender === "user"
                  ? "bg-accent text-accent-foreground ml-auto"
                  : "bg-secondary text-secondary-foreground"
              } max-w-[80%] ${
                message.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <p>{message.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="text-center text-muted-foreground">AI is thinking...</div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex-col items-stretch space-y-4 bg-secondary p-4">
        <QuickOptions
          options={quickOptions}
          onOptionClick={handleOptionClick}
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex w-full space-x-2"
        >
          <Input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
