import { LogOut, Users } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export function Sidebar() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const userEmail = session?.user?.email;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    // Added 'h-full' and 'flex-shrink-0' here
    <div className="w-64 h-full flex-shrink-0 bg-gradient-to-b from-rose-300 to-cyan-200 shadow-lg flex flex-col">
      <div className="p-6 border-b border-rose-400/30">
        <div className="bg-gray-300 rounded-lg flex items-center justify-center h-20 w-full">
          <span className="text-3xl font-bold text-gray-500">LOGO</span>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {/* Inactive button */}
          <button className="w-full flex items-center justify-start p-3 rounded-lg text-rose-700 hover:bg-rose-200/50 transition-colors">
            <Users className="h-4 w-4 mr-3" />
            Nail artist list
          </button>

          {/* Active button */}
          <button className="w-full flex items-center justify-start p-3 rounded-lg bg-white text-teal-600 hover:bg-white hover:text-teal-700 shadow-sm transition-colors">
            <Users className="h-4 w-4 mr-3" />
            Nail artist list
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-cyan-300/50 bg-cyan-100/50">
        <div className="flex items-center space-x-3 mb-4 p-3 bg-cyan-200/50 rounded-lg">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700">
              Account currently logged in
            </p>
            <p className="text-xs text-gray-600 truncate">
              {userEmail || "nailapii@nailcom"}
            </p>
          </div>
        </div>

        <button
          className="w-full flex items-center justify-start p-3 rounded-lg text-gray-700 hover:bg-cyan-200/50 transition-colors"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
