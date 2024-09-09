"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types";

const TaskListItem = dynamic(() => import('./task-item'), { ssr: false });

const TaskManager: React.FC = () => {
  const [newTask, setNewTask] = useState<string>("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [isClientSide, setIsClientSide] = useState(false);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const {
    tasks,
    isLoading,
    error,
    filter,
    setFilter,
    addNewTask,
    updateTask,
    removeTask,
    fetchTasks,
    postTask,
  } = useTasks();

  useEffect(() => {
    setIsClientSide(true);
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (cardContentRef.current) {
      cardContentRef.current.scrollTop = cardContentRef.current.scrollHeight;
    }
  }, [tasks]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      const newTaskObject = {
        id: Date.now().toString(),
        task: newTask,
        priority: newPriority,
        completed: false,
        created_at: new Date().toISOString(),
      };
      await postTask(newTaskObject);
      addNewTask(newTaskObject);
      setNewTask("");
      setNewPriority("medium");
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleUpdateTask = (id: string, updatedTask: Partial<Task>) => {
    updateTask(id, updatedTask);
  };

  if (!isClientSide || isLoading) return <div className="flex items-center justify-center h-full">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>;

  return (
    <Card className="w-full h-full flex flex-col shadow-lg">
      <CardHeader className="bg-primary text-primary-foreground">
        <h2 className="text-2xl font-bold">Tasks</h2>
      </CardHeader>
      <CardContent ref={cardContentRef} className="flex-grow overflow-auto p-4 space-y-4 scrollbar-hide">
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter a new task"
              className="flex-grow"
            />
            <Select
              value={newPriority}
              onValueChange={(value: "high" | "medium" | "low") =>
                setNewPriority(value)
              }
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddTask} className="bg-accent text-accent-foreground hover:bg-accent/90">Add</Button>
          </div>
          <AnimatePresence>
            <ul className="space-y-2">
              {tasks.map((task: Task) => (
                <motion.li
                  key={task.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TaskListItem
                    id={task.id}
                    task={task.task}
                    priority={task.priority || 'medium'}
                    completed={task.completed || false}
                    onUpdate={(id, updatedTask) => handleUpdateTask(id, updatedTask as Partial<Task>)}
                    onDelete={removeTask}
                  />
                </motion.li>
              ))}
            </ul>
          </AnimatePresence>
        </div>
      </CardContent>
      <CardFooter className="bg-secondary">
        <p className="text-sm text-secondary-foreground">Total tasks: {tasks.length}</p>
      </CardFooter>
    </Card>
  );
};

export default TaskManager;
