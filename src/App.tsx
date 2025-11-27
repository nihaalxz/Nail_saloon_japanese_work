import { useSession } from "@supabase/auth-helpers-react";
import LoginPage from "./pages/LoginPage";
import { Sidebar } from "./components/sidebar";
import Dashboard from "./pages/Dashboard";
import { Toaster } from "@/components/ui/toaster";

function App() {
  const session = useSession();

  return (
    <div>
      {!session ? (
        <LoginPage />
      ) : (
        // 1. OUTER CONTAINER: Full screen height, hidden overflow
        <div className="flex h-screen w-full overflow-hidden bg-gray-100">
          {/* 2. SIDEBAR: Fixed width is handled inside the component */}
          <Sidebar />

          {/* 3. MAIN CONTENT: Fills remaining space and SCROLLS independently */}
          <main className="flex-1 h-full overflow-y-auto">
            <Dashboard />
          </main>
        </div>
      )}
      <Toaster />
    </div>
  );
}

export default App;
