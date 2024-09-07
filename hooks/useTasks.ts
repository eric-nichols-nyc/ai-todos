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

  const addNewTask = (t: Task, priority: 'high' | 'medium' | 'low' = 'medium') => {
    addTask(t);
  };

  const toggleTaskCompletion = (id: string) => {
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