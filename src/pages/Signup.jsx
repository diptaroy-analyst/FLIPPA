// src/pages/auth/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { User, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    await new Promise(r => setTimeout(r, 1200));

    if (email && password && name) {
      localStorage.setItem("user", JSON.stringify({
        id: "demo" + Date.now(),
        name,
        email,
        user_type: null,
        created_at: new Date().toISOString()
      }));

      toast.success("Account created!", { description: "Welcome to Flippa (demo)" });
      navigate("/select-user-type");
    } else {
      toast.error("Fill all fields");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Sign Up (Demo)</h1>
          <p className="text-gray-300">Fill anything → instant access</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="text-white font-medium mb-2 block">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="LeBron James"
                required
                className="pl-12 bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-white font-medium mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lebron@demo.com"
                required
                className="pl-12 bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-white font-medium mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="doesn't matter"
                required
                className="pl-12 bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#A88A86] to-[#d4a59a] hover:from-[#9a7a76] hover:to-[#c49387] text-black"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Join Flippa <ArrowRight className="w-5 h-5 ml-2" /></>}
          </Button>
        </form>
      </Card>
    </div>
  );
}