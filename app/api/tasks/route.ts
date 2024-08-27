import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs/promises';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const tasksFilePath = `${process.env.DATA_DIR}/tasks.json`;

async function readTasks() {
  const data = await fs.readFile(tasksFilePath, 'utf8');
  return JSON.parse(data);
}

async function writeTasks(tasks: any[]) {
  await fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2));
}

async function listTasks(filter: 'high' | 'medium' | 'low' | null = null) {
  const tasks = await readTasks();
  if (filter) {
    return tasks.filter((task: any) => task.priority === filter);
  }
  return tasks;
}

async function addTask(task: string, priority: 'high' | 'medium' | 'low', dueDate: string | null) {
  const tasks = await readTasks();
  const newTask = {
    id: Math.max(0, ...tasks.map((t: any) => t.id)) + 1,
    task,
    priority,
    due_date: dueDate,
    created_at: new Date().toISOString(),
  };
  tasks.push(newTask);
  await writeTasks(tasks);
  return newTask;
}

async function updateTask(taskId: number, newTask: string, newPriority: 'high' | 'medium' | 'low', newDueDate: string | null) {
  const tasks = await readTasks();
  const taskIndex = tasks.findIndex((t: any) => t.id === taskId);
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    task: newTask,
    priority: newPriority,
    due_date: newDueDate,
    updated_at: new Date().toISOString(),
  };
  await writeTasks(tasks);
  return tasks[taskIndex];
}

async function removeTask(taskId: number) {
  const tasks = await readTasks();
  const updatedTasks = tasks.filter((t: any) => t.id !== taskId);
  if (tasks.length === updatedTasks.length) {
    throw new Error('Task not found');
  }
  await writeTasks(updatedTasks);
  return { success: true };
}

export async function GET(request: NextRequest) {
  const filter = request.nextUrl.searchParams.get('filter') as 'high' | 'medium' | 'low' | null;
  
  try {
    const tasks = await listTasks(filter);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error listing tasks:', error);
    return NextResponse.json({ error: 'Failed to list tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  try {
    const tasks = await listTasks();
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that manages a task list. If the user asks to add a task, suggest it in your response and include it in the suggestedTask field of your JSON response." },
        { role: "user", content: `Current tasks: ${JSON.stringify(tasks)}. User message: ${message}` }
      ],
      functions: [
        {
          name: "suggest_task",
          description: "Suggest a new task to be added to the list",
          parameters: {
            type: "object",
            properties: {
              suggestedTask: { type: "string", description: "The suggested task" },
              priority: { type: "string", enum: ["high", "medium", "low"]},
              due_date: { type: "string", format: "date", description: "The due date for the task (YYYY-MM-DD)" }
            },
            required: ["suggestedTask"]
          }
        }
      ],
      function_call: "auto",
    });

    const aiMessage = completion.choices[0].message;
    let suggestedTask: string = "";
    let priority: 'high' | 'medium' | 'low' = 'medium';
    let dueDate: string | null = null;

    if (aiMessage.function_call && aiMessage.function_call.name === "suggest_task") {
      const functionArgs = JSON.parse(aiMessage.function_call.arguments);
      suggestedTask = functionArgs.suggestedTask;
      priority = functionArgs.priority || 'medium';
      dueDate = functionArgs.due_date || null;
      
      const newTask = await addTask(suggestedTask, priority, dueDate);
      
      const responseMessage = `Certainly! I added "${suggestedTask}" to your list`;
      
      return NextResponse.json({
        message: responseMessage,
        suggestedTask: suggestedTask,
        newTask: newTask
      });
    }

    return NextResponse.json({
      message: aiMessage.content,
      suggestedTask: null,
      newTask: null
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Failed to get response from AI' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { task_id, new_task, new_priority, new_due_date } = await request.json();

  try {
    const updatedTask = await updateTask(task_id, new_task, new_priority, new_due_date);
    return NextResponse.json({ updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const task_id = request.nextUrl.searchParams.get('task_id');

  if (!task_id) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  try {
    const result = await removeTask(parseInt(task_id));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error removing task:', error);
    return NextResponse.json({ error: 'Failed to remove task' }, { status: 500 });
  }
}