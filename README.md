# AI-Todos: Task Management Application

AI-Todos is a modern, responsive task management application built with Next.js and React. It allows users to create, update, and delete tasks, as well as set priorities and mark tasks as completed.

## Features

- Create, read, update, and delete tasks
- Set task priorities (high, medium, low)
- Mark tasks as completed
- Filter tasks by priority
- Responsive design for various screen sizes

## Technologies Used

- [Next.js](https://nextjs.org/): React framework for server-side rendering and static site generation
- [React](https://reactjs.org/): JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/): Typed superset of JavaScript
- [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework
- [Zustand](https://github.com/pmndrs/zustand): State management library
- [Lucide React](https://lucide.dev/): Icon library

## Project Structure

- `app/`: Next.js app directory containing pages and layouts
- `components/`: React components used throughout the application
  - `ui/`: Reusable UI components (buttons, inputs, etc.)
  - `taskManager.tsx`: Main component for managing tasks
  - `task-item.tsx`: Component for rendering individual task items
- `hooks/`: Custom React hooks
  - `useTasks.ts`: Hook for managing task-related operations
- `lib/`: Utility functions and helpers
- `store/`: Zustand store for global state management
- `types/`: TypeScript type definitions
- `public/`: Static assets and API routes

## Main Components and Their Relationships

1. `TaskManager` (components/taskManager.tsx):
   - Main component that renders the task list and handles task operations
   - Uses the `useTasks` hook for task management
   - Renders `TaskListItem` components for each task

2. `TaskListItem` (components/task-item.tsx):
   - Renders individual task items
   - Handles task editing, completion toggling, and deletion

3. `useTasks` (hooks/useTasks.ts):
   - Custom hook that provides task-related operations and state
   - Interfaces with the Zustand store for global state management

4. `task-store.ts` (store/task-store.ts):
   - Zustand store for managing the global task state

## Building and Running the Application

1. Clone the repository:
   ```
   git clone https://github.com/your-username/ai-todos.git
   cd ai-todos
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Learn More

To learn more about the technologies used in this project, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
# AI-Powered Task Management System

This Next.js application demonstrates an AI-powered task management system. It combines a task list interface with a chatbot, allowing users to manage tasks through natural language interactions.

## Features

- Task management with add, update, and remove functionality
- AI-powered chatbot for natural language task interactions
- Real-time task list updates
- Responsive design for various screen sizes

## Technologies Used

- Next.js
- React
- TypeScript
- OpenAI API
- shadcn/ui components
- Vercel AI SDK

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your OpenAI API key in the environment variables
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Screenshot

![AI Task Manager Screenshot](public/ai-task-manager-screenshot.png)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
