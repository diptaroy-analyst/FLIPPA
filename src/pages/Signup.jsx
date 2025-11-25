// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles, Mail, User, Lock, ArrowRight, CheckCircle
} from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // 1. Create user in Base44
      await base44.auth.signup({
        email: formData.email,
        password: formData.password,
        name: formData.fullName
      });

      // 2. Auto-login after signup
      await base44.auth.login({
        email: formData.email,
        password: formData.password
      });

      toast.success("Welcome to Flippa!", {
        description: "Your account is ready. Let’s get started!",
        icon: <Sparkles className="w-5 h-5" />
      });

      // 3. Redirect to user type selection
      navigate("/select-user-type", { replace: true });

    } catch (err) {
      console.error("Signup error:", err);

      if (err.message?.includes("already exists")) {
        toast.error("This email is already registered");
      } else if (err.message?.includes("password")) {
        toast.error("Password must be at least 6 characters");
      } else {
        toast.error("Failed to create account. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4 overflow-hidden relative">
      {/* Animated Background */}
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
          <h1 className="text-5xl font-bold text-white mb-3">Join Flippa</h1>
          <p className="text-xl text-gray-300">Create your account in seconds</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#A88A86] focus:border-transparent h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#A88A86] focus:border-transparent h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                minLength={6}
                className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#A88A86] focus:border-transparent h-12"
              />
              <p className="text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#A88A86] to-[#d4a59a] hover:from-[#9a7a76] hover:to-[#c49387] text-black rounded-2xl shadow-xl transition-all hover:scale-105 disabled:opacity-70"
            >
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#A88A86] font-semibold hover:underline transition"
              >
                Log in
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-center text-xs text-gray-500">
              By signing up, you agree to our{" "}
              <a href="#" className="text-[#A88A86] hover:underline">Terms</a> and{" "}
              <a href="#" className="text-[#A88A86] hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm text-gray-400">No credit card required</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm text-gray-400">Free forever for players</span>
          </div>
        </div>
      </div>
    </div>
  );
}