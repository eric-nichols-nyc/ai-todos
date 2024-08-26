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

      console.log("data:", data);
      if (
        inputMessage.toLowerCase().startsWith("update task") ||
        inputMessage.toLowerCase().startsWith("change task")
      ) {
        console.log("update task");
        handleUpdate(inputMessage);
      }

      if (data.newTask) {
        await addNewTask(data.newTask.task, data.newTask.priority);
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
    //     console.log('message:', message);
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

    const taskId = parseInt(words[taskIndex + 1]);
    if (isNaN(taskId)) return;

    if (message.toLowerCase().includes("update task")) {
      const newTaskDetails = message.slice(
        message.toLowerCase().indexOf("to") + 3
      );
      await updateTask(taskId, { task: newTaskDetails });
    } else if (message.toLowerCase().includes("remove task")) {
      await removeTask(taskId);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <h2 className="text-2xl font-bold">Chat with AI Assistant</h2>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 p-2 rounded-lg text-sm ${
                message.sender === "user"
                  ? "bg-blue-100 ml-auto"
                  : "bg-gray-100"
              } max-w-[80%] ${
                message.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <p>{message.content}</p>
              {message.suggestedTask && (
                <p className="mt-2 text-sm font-semibold">
                  Suggested Task: {message.suggestedTask}
                </p>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="text-center text-gray-500">AI is thinking...</div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter>
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
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
