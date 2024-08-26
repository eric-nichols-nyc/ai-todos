import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {Task} from '../types';
import {getTasks} from '@/lib/taskManager';

interface TasksState {
  tasks: Task[];
  filter: 'all' | 'high' | 'medium' | 'low';
  isLoading: boolean;
  error: string | null;
  setTasks: (tasks: Task[]) => void;
  setFilter: (filter: 'all' | 'high' | 'medium' | 'low') => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addTask: (task: Task) => void;
  updateTask: (id: number, updatedTask: Partial<Task>) => void;
  removeTask: (id: number) => void;
}

export const useTasksStore = create<TasksState>()(
  devtools(
    persist(
      (set) => ({
        tasks: [],
        filter: 'all',
        isLoading: false,
        error: null,
        setTasks: (tasks) => set({ tasks }),
        setFilter: (filter) => set({ filter }),
        setIsLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
        updateTask: (id, updatedTask) =>
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, ...updatedTask } : task
            ),
          })),
        removeTask: (id) =>
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          })),
      }),
      {
        name: 'tasks-storage',
        getStorage: () => localStorage,
      }
    )
  )
);