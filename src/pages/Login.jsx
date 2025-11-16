import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect') || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get all registered users
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Find user by email and password
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        // Remove password before storing
        const { password, ...userWithoutPassword } = user;
        
        localStorage.setItem('token', 'mock-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        if (setUser) setUser(userWithoutPassword);
        navigate(redirect, { replace: true });
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <h1 className="text-3xl font-bold text-white text-center mb-4">Welcome back</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Sign in to continue to Flippa</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/6 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A88A86]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/6 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A88A86]"
          />

          {error && <div className="text-sm text-red-400">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-[#A88A86] hover:bg-[#9A7A76] text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <span>Don't have an account? </span>
          <button onClick={() => navigate('/signup')} className="text-[#A88A86] hover:underline">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}