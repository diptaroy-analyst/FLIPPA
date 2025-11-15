import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(createPageUrl('FileRenamer'));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <style>{`
        @import url('https://api.fonts.coollabs.io/css2?family=Satoshi:wght@300;400;500;600;700&display=swap');
      `}</style>

      <div className="max-w-2xl w-full text-center" style={{ fontFamily: 'Satoshi, sans-serif' }}>
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Payment Successful! 🎉
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            Your subscription has been activated successfully.
          </p>

          <div className="bg-white/10 rounded-xl p-6 mb-8">
            <p className="text-gray-300 mb-2">
              Redirecting you to the app in <span className="text-[#A88A86] font-bold text-2xl">{countdown}</span> seconds...
            </p>
          </div>

          <Button
            onClick={() => navigate(createPageUrl('FileRenamer'))}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-bold px-8 py-6 rounded-xl"
          >
            Start Using Flippa Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-gray-400 text-sm mt-6">
            You can view your subscription details in your Account Settings
          </p>
        </div>
      </div>
    </div>
  );
}