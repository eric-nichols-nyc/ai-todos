import TaskManager from "@/components/taskManager";
import Chatbot from "@/components/chatbot";

export default function Home() {
  return (
    <div className="flex justify-center items-start min-h-screen bg-background p-6">
      <div className="flex w-full max-w-7xl space-x-6 h-[calc(100vh-3rem)]">
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
