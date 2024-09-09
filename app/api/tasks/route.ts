import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { listTasks, updateTask, removeTask, getTasks } from '@/lib/taskManager';
import { Task } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter');
  
  try {
    const tasks = filter ? listTasks(filter) : getTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error listing tasks:', error);
    return NextResponse.json({ error: 'Failed to list tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { message } = await req.json();

  try {
    const tasks = getTasks();
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that manages a task list. If the user provides a high level task, suggest a list of more specific tasks related to it. If the user asks to add a specific task, suggest it in your response." 
          + "Please provide your response in the form of a numbered or bulleted list. like this: 1.[Task one] 2[Task two] 3[Task three]" },
        { role: "user", content: `Current tasks: ${JSON.stringify(tasks)}. User message: ${message}` }
      ],
      functions: [
        {
          name: "suggest_tasks",
          description: "Suggest a list of tasks related to a general task or a single specific task",
          parameters: {
            type: "object",
            properties: {
              suggestedTasks: { 
                type: "array", 
                items: {
                  type: "object",
                  properties: {
                    task: { type: "string", description: "The suggested task" },
                    priority: { type: "string", enum: ["high", "medium", "low"], description: "The priority level of the task" },
                    due_date: { type: "string", format: "date", description: "The due date for the task (YYYY-MM-DD)" }
                  },
                  required: ["task"]
                },
                description: "An array of suggested tasks"
              }
            },
            required: ["suggestedTasks"]
          }
        }
      ],
      function_call: "auto",
    });

    const aiMessage = completion.choices[0].message;
    let suggestedTasks = null;
    let newTasks = null;

    if (aiMessage.function_call && aiMessage.function_call.name === "suggest_tasks") {
      const functionArgs = JSON.parse(aiMessage.function_call.arguments);
      suggestedTasks = functionArgs.suggestedTasks;
      
      newTasks = [];
      for (const task of suggestedTasks) {       
        const newTask: Task = {
          id: uuidv4(),
          task,
          priority:task.priority,
          due_date:task.due_date,
          created_at: task.created_at,
          completed: false
        };

        newTasks.push(newTask);
      }
      
      const taskList = suggestedTasks.map((task:Task) => `"${task.task}"`);
      const responseMessage = suggestedTasks.length > 1
        ? `Certainly! I've added the following tasks to your list:\n${taskList.map((task:Task) => `- ${task}`).join('\n')}\nIs there anything else you'd like me to do?`
        : `Certainly! I've added the following task to your list: ${taskList[0]}. Is there anything else you'd like me to do?`;
      
      return NextResponse.json({
        message: responseMessage,
        suggestedTasks: suggestedTasks,
        newTasks: newTasks
      });
    }

    return NextResponse.json({
      message: aiMessage.content,
      suggestedTasks: suggestedTasks,
      newTasks: newTasks
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Failed to get response from AI' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { task_id, new_task, new_priority, new_due_date, completed } = await req.json();

  try {
    const updatedTask = updateTask(task_id, new_task, new_priority, new_due_date, completed);
    return NextResponse.json({ updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  if(!searchParams.has('task_id')) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }
  const task_id = searchParams.get('task_id')!;

  try {
    const result = removeTask(task_id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error removing task:', error);
    return NextResponse.json({ error: 'Failed to remove task' }, { status: 500 });
  }
}
