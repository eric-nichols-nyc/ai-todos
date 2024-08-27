import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { listTasks, addTask, updateTask, removeTask, getTasks } from '@/lib/taskManager';

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
              priority: { type: "string", enum: ["high", "medium", "low"], description: "The priority level of the task" },
              due_date: { type: "string", format: "date", description: "The due date for the task (YYYY-MM-DD)" }
            },
            required: ["suggestedTask"]
          }
        }
      ],
      function_call: "auto",
    });

    const aiMessage = completion.choices[0].message;
    let suggestedTask = null;
    let priority = null;
    let dueDate = null;

    if (aiMessage.function_call && aiMessage.function_call.name === "suggest_task") {
      const functionArgs = JSON.parse(aiMessage.function_call.arguments);
      suggestedTask = functionArgs.suggestedTask;
      priority = functionArgs.priority || 'medium';
      dueDate = functionArgs.due_date || null;
      
      const newTask = addTask(suggestedTask, priority, dueDate);
      
      const responseMessage = `Certainly! I added the following task to your list: "${suggestedTask}" ${dueDate ? ` and due date ${dueDate}` : ''}. Is there anything else you'd like me to do?`;
      
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

export async function PUT(req: Request) {
  const { task_id, new_task, new_priority, new_due_date } = await req.json();

  try {
    const updatedTask = updateTask(task_id, new_task, new_priority, new_due_date);
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
  const task_id = parseInt(searchParams.get('task_id')!);

  try {
    const result = removeTask(task_id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error removing task:', error);
    return NextResponse.json({ error: 'Failed to remove task' }, { status: 500 });
  }
}