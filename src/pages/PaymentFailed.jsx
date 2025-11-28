// src/pages/PaymentFailed.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { XCircle, RefreshCw, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentFailed() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Payment Failed — Flippa";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;900&display=swap');
      `}</style>

      <div className="max-w-2xl w-full text-center">
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-12 border border-red-500/30 shadow-2xl">
          <div className="w-28 h-28 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <XCircle className="w-16 h-16 text-white" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Payment Failed
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-lg mx-auto">
            We couldn't process your payment. This is usually due to an expired card, insufficient funds, or a temporary bank issue.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-10 text-left space-y-4">
            <div className="flex items-start gap-4">
              <HelpCircle className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">Common fixes:</p>
                <ul className="text-gray-300 text-sm mt-2 space-y-1">
                  <li>• Try a different card</li>
                  <li>• Check your card hasn't expired</li>
                  <li>• Ensure you have sufficient funds</li>
                  <li>• Contact your bank if the issue persists</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(createPageUrl("Pricing"))}
              size="lg"
              className="bg-gradient-to-r from-[#A88A86] to-[#d4a59a] hover:from-[#9a7a76] hover:to-[#c49387] text-black font-bold text-xl px-12 py-8 rounded-2xl"
            >
              <RefreshCw className="w-6 h-6 mr-3" />
              Try Again
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(createPageUrl("FileRenamer"))}
              className="border-white/30 text-white hover:bg-white/10 text-xl px-12 py-8 rounded-2xl"
            >
              Continue with Free Plan
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </div>

          <p className="text-gray-500 text-sm mt-10">
            Need help? Email <a href="mailto:support@flippa.com" className="text-[#A88A86] underline">support@flippa.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}