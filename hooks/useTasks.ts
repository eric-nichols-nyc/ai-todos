import { useEffect, useCallback } from 'react';
import { useTasksStore } from '@/store/task-store';
import { Task } from '@/types';
import { getTasks as getDefaultTasks } from '@/lib/taskManager';

export const useTasks = () => {
  const {
    tasks,
    filter,
    isLoading,
    error,
    setTasks,
    setFilter,
    setIsLoading,
    setError,
    addTask,
    updateTask,
    removeTask,
  } = useTasksStore();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const defaultTasks = getDefaultTasks();
      setTasks(defaultTasks);
      setError(null);
    } catch (error) {
      setError('Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, [setTasks, setError, setIsLoading]);

  const addNewTask = (newTask: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    const task: Task = {
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      task: newTask,
      priority,
      due_date: null,
      created_at: new Date().toISOString(),
      completed: false,
    };
    addTask(task);
    return task;
  };

  const toggleTaskCompletion = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { ...task, completed: !task.completed });
    }
  };

  return {
    tasks,
    isLoading,
    error,
    filter,
    setFilter,
    addNewTask,
    updateTask,
    removeTask,
    fetchTasks,
    toggleTaskCompletion,
  };
};