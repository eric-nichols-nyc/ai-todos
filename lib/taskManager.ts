import fs from 'fs';
import path from 'path';

const dataFile = 'tasks.json';
console.log(dataFile);

interface Task {
  id: number;
  task: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string | null;
  created_at: string;
  updated_at?: string;
}

// Helper function to read tasks from the JSON file
export function getTasks(): Task[] {
  if (!fs.existsSync(dataFile)) {
    return [];
  }
  const jsonData = fs.readFileSync(dataFile, 'utf8');
  return JSON.parse(jsonData);
}

// Helper function to write tasks to the JSON file
function saveTasks(tasks: Task[]): void {
  const jsonData = JSON.stringify(tasks, null, 2);
  fs.writeFileSync(dataFile, jsonData);
}

export function listTasks(filter: string | null = null): Task[] {
  const tasks = getTasks();
  if (filter && ['high', 'medium', 'low'].includes(filter)) {
    return tasks.filter(task => task.priority === filter);
  }
  return tasks;
}

export function addTask(task: string, priority: 'high' | 'medium' | 'low' = 'medium', due_date: string | null = null): Task {
  if (!task) {
    throw new Error('Task is required');
  }
  
  const tasks = getTasks();
  const newTask: Task = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    task,
    priority,
    due_date,
    created_at: new Date().toISOString()
  };
  console.log('new task, ', newTask)
  
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function updateTask(task_id: number, new_task?: string, new_priority?: 'high' | 'medium' | 'low', new_due_date?: string | null): Task {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === task_id);
  
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    task: new_task || tasks[taskIndex].task,
    priority: new_priority || tasks[taskIndex].priority,
    due_date: new_due_date !== undefined ? new_due_date : tasks[taskIndex].due_date,
    updated_at: new Date().toISOString()
  };
  
  saveTasks(tasks);
  return tasks[taskIndex];
}

export function removeTask(task_id: number): { message: string } {
  let tasks = getTasks();
  const initialLength = tasks.length;
  tasks = tasks.filter(t => t.id !== task_id);
  
  if (tasks.length === initialLength) {
    throw new Error('Task not found');
  }
  
  saveTasks(tasks);
  return { message: 'Task deleted successfully' };
}