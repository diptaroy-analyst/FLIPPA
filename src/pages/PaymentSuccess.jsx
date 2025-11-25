// src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle, ArrowRight, Sparkles, Crown, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    // Confetti celebration
    const end = Date.now() + 4000;
    const colors = ["#A88A86", "#d4a59a", "#10b981", "#8b5cf6", "#f59e0b"];
    const frame = () => {
      if (Date.now() > end) return;
      confetti({
        particleCount: 5,
        angle: 90,
        spread: 55,
        origin: { x: 0.5, y: 0.6 },
        colors,
        scalar: 1.2,
      });
      requestAnimationFrame(frame);
    };
    frame();

    // Refresh user (activate Pro)
    base44.auth.me().then(setUser).catch(() => {});

    // Countdown
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          navigate(createPageUrl("FileRenamer"), { replace: true });
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    toast.success("Welcome to Flippa Pro! Unlimited uploads unlocked");

    return () => clearInterval(timer);
  }, [navigate, setUser]);

  const progress = ((8 - countdown) / 8) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;900&display=swap');
        .progress-ring { transform: rotate(-90deg); }
        .progress-circle { transition: stroke-dashoffset 0.6s ease; }
      `}</style>

      <div className="max-w-2xl w-full text-center z-10">
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-12 border border-white/10 shadow-2xl">
          <div className="relative inline-block mb-8">
            <svg width="180" height="180" className="mx-auto">
              <circle cx="90" cy="90" r="82" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
              <circle
                cx="90" cy="90" r="82" stroke="#10b981" strokeWidth="12" fill="none"
                strokeDasharray="515" strokeDashoffset={515 - (515 * progress) / 100}
                className="progress-circle" strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <PartyPopper className="w-20 h-20 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            You're In!
          </h1>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
            <p className="text-2xl text-gray-200">
              Welcome to <span className="text-[#A88A86] font-bold">Flippa Pro</span>
            </p>
            <Crown className="w-10 h-10 text-yellow-400 animate-bounce" />
          </div>

          <p className="text-xl text-gray-300 mb-10 max-w-xl mx-auto">
            Unlimited uploads, AI tagging, 4K exports, and priority support are now yours.
          </p>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-10 border border-emerald-500/30">
            <p className="text-gray-300 text-lg mb-4">Taking you to your studio in...</p>
            <div className="text-7xl font-bold text-[#A88A86] mb-4">{countdown}</div>
            <div className="w-full bg-white/10 rounded-full h-4">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <Button
            onClick={() => navigate(createPageUrl("FileRenamer"), { replace: true })}
            size="lg"
            className="bg-gradient-to-r from-[#A88A86] to-[#d4a59a] hover:from-[#9a7a76] hover:to-[#c49387] text-black font-bold text-2xl px-16 py-10 rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-105 transition-all"
          >
            Start Creating Now
            <ArrowRight className="w-8 h-8 ml-4" />
          </Button>

          <p className="text-gray-500 text-sm mt-8">
            Let's make your highlights legendary
          </p>
        </div>
      </div>
    </div>
  );
}