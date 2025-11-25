// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.auth.login({
        email: formData.email,
        password: formData.password
      });

      toast.success("Welcome back!", {
        description: "You’re in — let’s make highlights",
        icon: <Sparkles className="w-5 h-5" />
      });

      // Redirect based on user_type
      const user = await base44.auth.me();
      if (user.user_type) {
        if (user.user_type === "creator") {
          navigate("/file-renamer");
        } else if (user.profile_completed) {
          navigate("/marketplace");
        } else {
          navigate("/player-profile");
        }
      } else {
        navigate("/select-user-type");
      }
    } catch (err) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-600 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;900&display=swap');
      `}</style>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#A88A86] to-[#d4a59a] mb-6 shadow-2xl">
            <Sparkles className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">Welcome Back</h1>
          <p className="text-xl text-gray-300">Log in to your Flippa account</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#A88A86] h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#A88A86] h-12"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#A88A86] to-[#d4a59a] hover:from-[#9a7a76] hover:to-[#c49387] text-black rounded-2xl shadow-xl transition-all hover:scale-105"
            >
              {loading ? "Logging in..." : (
                <>Log In <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <Link to="/forgot-password" className="text-sm text-[#A88A86] hover:underline">
              Forgot your password?
            </Link>
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#A88A86] font-semibold hover:underline">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}