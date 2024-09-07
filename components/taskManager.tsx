"use client";

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
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

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      const newTaskObject = {
        id: Date.now().toString(), // Generate a temporary ID
        task: newTask,
        priority: newPriority,
        completed: false,
      };
      await postTask(newTaskObject);
      addNewTask(newTaskObject);
      setNewTask("");
      setNewPriority("medium");
    } catch (error) {
      console.error("Failed to add task:", error);
      // Optionally, you can show an error message to the user here
    }
  };

  const handleUpdateTask = (id: number, updatedTask: Partial<Task>) => {
    updateTask(id, updatedTask);
  };

  if (!isClientSide || isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card className="w-full h-[calc(100vh-2rem)] flex flex-col">
      <CardHeader>
        <h2 className="text-2xl font-bold">Task Manager</h2>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
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
            <Button onClick={handleAddTask}>Add</Button>
          </div>
          {/* <Select
            value={filter}
            onValueChange={(value: "all" | "high" | "medium" | "low") =>
              setFilter(value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
            </SelectContent>
          </Select> */}
          <ul className="space-y-2">
            {tasks.map((task: Task) => (
              <TaskListItem
                key={task.id}
                id={task.id}
                task={task.task}
                priority={task.priority || 'medium'}
                completed={task.completed || false}
                onUpdate={handleUpdateTask}
                onDelete={removeTask}
              />
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-500">Total tasks: {tasks.length}</p>
      </CardFooter>
    </Card>
  );
};

export default TaskManager;
