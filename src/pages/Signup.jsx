import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Check if email already exists
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      if (users.find(u => u.email === email)) {
        setError("Email already registered");
        setLoading(false);
        return;
      }

      // Create new user
      const newUser = {
        id: Date.now(),
        email,
        full_name: fullName,
        password, // WARNING: never store plain passwords in production!
        user_type: 'player',
        role: 'user',
        created_at: new Date().toISOString()
      };
      
      // Store user in users array
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Log in the new user
      localStorage.setItem("token", "mock-token-" + Date.now());
      localStorage.setItem("user", JSON.stringify(newUser));
      if (setUser) setUser(newUser);
      
      navigate("/", { replace: true });
    } catch (err) {
      setError("Signup error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <h1 className="text-3xl font-bold text-white text-center mb-4">Create account</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Sign up to Flippa</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            required
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/6 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A88A86]"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/6 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A88A86]"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/6 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A88A86]"
          />

          {error && <div className="text-sm text-red-400">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-[#A88A86] hover:bg-[#9A7A76] text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <span>Already have an account? </span>
          <button onClick={() => navigate("/login")} className="text-[#A88A86] hover:underline">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}