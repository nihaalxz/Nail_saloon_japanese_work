import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
// We no longer import shadcn/ui components (Button, Input, Label, Card)

export default function LoginPage() {
  const supabase = useSupabaseClient();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Renamed from 'loading'
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Updated state
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) throw error;
      // Login is successful. The SessionProvider in App.tsx
      // will detect the new session and re-render automatically.
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsSubmitting(false); // Updated state
    }
  };

  // Note: We don't need the 'isLoading' or 'useEffect' check here
  // because our App.tsx file already handles this logic.

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(to bottom, #fabcb9 0%, #fabcb9 35%, #c0ced1 100%)",
      }}
    >
      <h1 className="text-xl font-bold text-white mb-6">Basic skill check</h1>

      <div className="bg-white/60 backdrop-blur-md shadow-lg rounded-lg p-10 w-full max-w-md">
        <h2 className="text-center text-xl font-semibold text-gray-800 mb-6">
          Login
        </h2>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
              className="text-gray-700 w-full border rounded-md px-3 py-2 text-sm bg-white
                         border-gray-300 placeholder-gray-400 focus:ring-2 
                         focus:ring-teal-500 focus:outline-none"
              placeholder="mail@adress.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete="current-password"
              className="text-gray-700 w-full border rounded-md px-3 py-2 text-sm bg-white
                         border-gray-300 placeholder-gray-400 focus:ring-2 
                         focus:ring-teal-500 focus:outline-none"
              placeholder="password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mx-auto mt-2 bg-teal-600 text-white px-6 py-2 rounded-md 
  font-medium hover:bg-teal-700 transition disabled:opacity-60 block"
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
