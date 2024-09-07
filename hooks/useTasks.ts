import { useCallback } from 'react';
import { useTasksStore } from '@/store/task-store';
import { Task } from '@/types';
import { getTasks as getDefaultTasks } from '@/lib/taskManager';

export const useTasks = () => {
  // Function to post a new task to the API
  const postTask = async (task: Task) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      
      if (!response.ok) {
        throw new Error('Failed to post task');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error posting task:', error);
      throw error;
    }
  };

  // Destructure values and functions from the task store
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

  // Function to fetch tasks (currently using default tasks)
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

  // Function to add a new task
  const addNewTask = (t: Task, priority: 'high' | 'medium' | 'low' = 'medium') => {
    addTask(t);
  };

  // Function to toggle task completion status
  const toggleTaskCompletion = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { ...task, completed: !task.completed });
    }
  };

  // Return all necessary values and functions
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
    postTask,
  };
};
