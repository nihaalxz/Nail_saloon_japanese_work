import { useSession } from '@supabase/auth-helpers-react'
import LoginPage from './pages/LoginPage'
import { Sidebar } from './components/sidebar'
import Dashboard from './pages/Dashboard' // Import the real Dashboard
import { Toaster } from "@/components/ui/toaster" // Import the Toaster

// The old placeholder Dashboard component is now deleted from here

// App.tsx now acts as a router
function App() {
  const session = useSession() // This hook gets the user's session

  return (
    // This div no longer has "container" or "mx-auto"
    <div>
      {!session ? (
        <LoginPage /> 
      ) : (
        // This flex container holds the sidebar and main content
        <div className="flex h-screen bg-gray-100">
          <Sidebar /> 
          <Dashboard /> {/* This will now show the table */}
        </div>
      )}
      {/* This allows our toasts (pop-up notifications) to be displayed */}
      <Toaster />
    </div>
  )
}

export default App