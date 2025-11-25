// src/pages/auth/ResetPassword.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be 6+ characters");
      return;
    }

    setLoading(true);
    try {
      await base44.auth.passwordReset({ token, password });
      toast.success("Password updated! You can now log in");
      navigate("/login");
    } catch (err) {
      toast.error("Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10">
        <h1 className="text-4xl font-bold text-white mb-4">Set New Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            required
            minLength={6}
            className="bg-white/5 border-white/10 text-white h-12"
          />
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            required
            className="bg-white/5 border-white/10 text-white h-12"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-[#A88A86] to-[#d4a59a] text-black font-bold"
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}