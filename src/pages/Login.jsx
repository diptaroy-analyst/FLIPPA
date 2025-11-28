<<<<<<< HEAD
// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Fake delay
    await new Promise(r => setTimeout(r, 1200));

    // Fake success for ANY email ending in @demo.com
    if (email.includes("@") && password.length >= 3) {
      // Save fake user to localStorage
      localStorage.setItem("user", JSON.stringify({
        id: "demo123",
        name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        email: email,
        user_type: email.includes("creator") ? "creator" : email.includes("pro") ? "pro" : null,
        created_at: new Date().toISOString()
      }));

      toast.success("Welcome back!", {
        description: "Demo mode active",
      });

      // Redirect logic
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user.user_type) {
        navigate("/select-user-type");
      } else {
        navigate("/filerenamer");
      }
    } else {
      toast.error("Nope!", { description: "Use any email + password (demo mode)" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Login (Demo Mode)</h1>
          <p className="text-gray-300">Use any email + password → you're in</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-white font-medium mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="try: creator@demo.com"
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
                placeholder="anything works"
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
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Log In <ArrowRight className="w-5 h-5 ml-2" /></>}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Try these:</p>
          <p className="text-[#A88A86] font-mono mt-2">
            player@demo.com → player<br/>
            creator@demo.com → creator<br/>
            pro@demo.com → pro
          </p>
        </div>
      </Card>
    </div>
  );
=======
// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Fake delay
    await new Promise(r => setTimeout(r, 1200));

    // Fake success for ANY email ending in @demo.com
    if (email.includes("@") && password.length >= 3) {
      // Save fake user to localStorage
      localStorage.setItem("user", JSON.stringify({
        id: "demo123",
        name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        email: email,
        user_type: email.includes("creator") ? "creator" : email.includes("pro") ? "pro" : null,
        created_at: new Date().toISOString()
      }));

      toast.success("Welcome back!", {
        description: "Demo mode active",
      });

      // Redirect logic
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user.user_type) {
        navigate("/select-user-type");
      } else {
        navigate("/filerenamer");
      }
    } else {
      toast.error("Nope!", { description: "Use any email + password (demo mode)" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Login (Demo Mode)</h1>
          <p className="text-gray-300">Use any email + password → you're in</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-white font-medium mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="try: creator@demo.com"
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
                placeholder="anything works"
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
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Log In <ArrowRight className="w-5 h-5 ml-2" /></>}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Try these:</p>
          <p className="text-[#A88A86] font-mono mt-2">
            player@demo.com → player<br/>
            creator@demo.com → creator<br/>
            pro@demo.com → pro
          </p>
        </div>
      </Card>
    </div>
  );
>>>>>>> cd738166eff61c4e0c545c469221835d2734fe9e
}