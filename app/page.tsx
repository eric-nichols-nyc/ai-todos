import ChatInterface from "@/components/chatInterface";
import TaskManager from "@/components/taskManager";
import {Chat} from './chat'
import Chatbot from "@/components/chatbot";
export default function Home() {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 p-4">
      <div className="flex w-full max-w-6xl space-x-4 h-[calc(100vh-2rem)]">
        <div className="w-1/2 h-full">
          <TaskManager />
        </div>
        <div className="w-1/2 h-full">
          <Chatbot />
        </div>
      </div>
    </div>
  );
}
