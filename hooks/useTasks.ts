import { useCallback } from 'react';
import { useTasksStore } from '@/store/task-store';
import { Task } from '@/types';
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
    updateTask: updateTaskInStore,
    removeTask: removeTaskFromStore,
  } = useTasksStore();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tasks${filter !== 'all' ? `?filter=${filter}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching tasks');
    } finally {
      setIsLoading(false);
    }
  }, [filter, setTasks, setIsLoading, setError]);

  const addNewTask = async (newTask: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Add a new task: ${newTask} with priority ${priority}` }),
      });
      if (!response.ok) throw new Error('Failed to add task');
      const { newTask: addedTask } = await response.json();
      addTask(addedTask);
      return addedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the task');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (id: number, updatedTask: Partial<Task>) => {
    console.log('updating')
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: id, ...updatedTask }),
      });
      if (!response.ok) throw new Error('Failed to update task');
      updateTaskInStore(id, updatedTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the task');
    } finally {
      setIsLoading(false);
    }
  };

  const removeTask = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tasks?task_id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove task');
      removeTaskFromStore(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while removing the task');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tasks,
    isLoading,
    error,
    filter,
    setFilter,
    fetchTasks,
    addNewTask,
    updateTask,
    removeTask,
  };
};