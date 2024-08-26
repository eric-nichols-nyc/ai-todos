import Chat from "@/components/chatInterface";
import TaskManager from "@/components/taskManager";

export default function Home() {
  return (
    <div className="flex w-full">
    <TaskManager />
    <Chat />
    </div>
 
  );
}
