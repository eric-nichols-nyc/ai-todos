import TaskManager from "@/components/taskManager";
import Chatbot from "@/components/chatbot";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow p-6">
        <div className="flex w-full max-w-7xl mx-auto space-x-6 h-[calc(100vh-12rem)]">
          <div className="w-1/2 h-full">
            <TaskManager />
          </div>
          <div className="w-1/2 h-full">
            <Chatbot />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
