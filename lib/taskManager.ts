interface Task {
  id: number;
  task: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string | null;
  created_at: string;
  updated_at?: string;
}

const isClient = typeof window !== 'undefined';

// Function to create default tasks
function createDefaultTasks(): Task[] {
  return [
    {
      id: 1,
      task: 'Complete project proposal',
      priority: 'high',
      due_date: '2023-06-30',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      task: 'Schedule team meeting',
      priority: 'medium',
      due_date: '2023-06-15',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      task: 'Review quarterly report',
      priority: 'low',
      due_date: '2023-06-30',
      created_at: new Date().toISOString()
    }
  ];
}

// Helper function to read tasks from localStorage
export function getTasks(): Task[] {
  if (!isClient) return [];
  const jsonData = localStorage.getItem('tasks');
  if (jsonData) {
    return JSON.parse(jsonData);
  } else {
    const defaultTasks = createDefaultTasks();
    saveTasks(defaultTasks);
    return defaultTasks;
  }
}

// Helper function to write tasks to localStorage
function saveTasks(tasks: Task[]): void {
  if (!isClient) return;
  const jsonData = JSON.stringify(tasks);
  localStorage.setItem('tasks', jsonData);
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