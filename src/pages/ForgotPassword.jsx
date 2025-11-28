<<<<<<< HEAD
// src/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.auth.passwordResetRequest({ email });
      setSent(true);
      toast.success("Check your email", {
        description: "We sent you a password reset link"
      });
    } catch (err) {
      toast.error("No account found with that email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Mail className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Check your email</h1>
          <p className="text-gray-300 mb-8">We sent a password reset link to <strong>{email}</strong></p>
          <Button onClick={() => navigate("/login")} variant="outline" className="text-white border-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10">
        <h1 className="text-4xl font-bold text-white mb-4">Reset Password</h1>
        <p className="text-gray-300 mb-8">Enter your email and we'll send you a reset link</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="bg-white/5 border-white/10 text-white h-12"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-[#A88A86] to-[#d4a59a] hover:from-[#9a7a76] hover:to-[#c49387] text-black font-bold"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-[#A88A86] text-sm hover:underline flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
=======
// src/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.auth.passwordResetRequest({ email });
      setSent(true);
      toast.success("Check your email", {
        description: "We sent you a password reset link"
      });
    } catch (err) {
      toast.error("No account found with that email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Mail className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Check your email</h1>
          <p className="text-gray-300 mb-8">We sent a password reset link to <strong>{email}</strong></p>
          <Button onClick={() => navigate("/login")} variant="outline" className="text-white border-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10">
        <h1 className="text-4xl font-bold text-white mb-4">Reset Password</h1>
        <p className="text-gray-300 mb-8">Enter your email and we'll send you a reset link</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="bg-white/5 border-white/10 text-white h-12"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-[#A88A86] to-[#d4a59a] hover:from-[#9a7a76] hover:to-[#c49387] text-black font-bold"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-[#A88A86] text-sm hover:underline flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
>>>>>>> cd738166eff61c4e0c545c469221835d2734fe9e
}