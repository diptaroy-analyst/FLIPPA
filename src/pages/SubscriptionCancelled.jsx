<<<<<<< HEAD
// src/pages/SubscriptionCancelled.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { HeartCrack, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscriptionCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;900&display=swap');
      `}</style>

      <div className="max-w-2xl w-full text-center">
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-12 border border-white/10 shadow-2xl">
          <div className="w-28 h-28 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-8">
            <HeartCrack className="w-16 h-16 text-white" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Subscription Cancelled
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-lg mx-auto">
            We're sad to see you go. Your Pro access will remain active until the end of your current billing period.
          </p>

          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-8 mb-10">
            <p className="text-2xl text-white mb-4">
              <Sparkles className="inline w-8 h-8 mr-2" />
              Come back anytime — your files are safe
            </p>
            <p className="text-gray-300">
              Reactivate instantly with one click. No setup required.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(createPageUrl("Pricing"))}
              size="lg"
              className="bg-gradient-to-r from-[#A88A86] to-[#d4a59a] hover:from-[#9a7a76] hover:to-[#c49387] text-black font-bold text-xl px-12 py-8 rounded-2xl"
            >
              Re-activate Pro Plan
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(createPageUrl("FileRenamer"))}
              className="border-white/30 text-white hover:bg-white/10 text-xl px-12 py-8 rounded-2xl"
            >
              Continue with Free
            </Button>
          </div>

          <p className="text-gray-500 text-sm mt-10">
            Questions? We're here → <a href="mailto:hello@flippa.com" className="text-[#A88A86] underline">hello@flippa.com</a>
          </p>
        </div>
      </div>
    </div>
  );
=======
// src/pages/SubscriptionCancelled.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { HeartCrack, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscriptionCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;900&display=swap');
      `}</style>

      <div className="max-w-2xl w-full text-center">
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-12 border border-white/10 shadow-2xl">
          <div className="w-28 h-28 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-8">
            <HeartCrack className="w-16 h-16 text-white" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Subscription Cancelled
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-lg mx-auto">
            We're sad to see you go. Your Pro access will remain active until the end of your current billing period.
          </p>

          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-8 mb-10">
            <p className="text-2xl text-white mb-4">
              <Sparkles className="inline w-8 h-8 mr-2" />
              Come back anytime — your files are safe
            </p>
            <p className="text-gray-300">
              Reactivate instantly with one click. No setup required.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(createPageUrl("Pricing"))}
              size="lg"
              className="bg-gradient-to-r from-[#A88A86] to-[#d4a59a] hover:from-[#9a7a76] hover:to-[#c49387] text-black font-bold text-xl px-12 py-8 rounded-2xl"
            >
              Re-activate Pro Plan
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(createPageUrl("FileRenamer"))}
              className="border-white/30 text-white hover:bg-white/10 text-xl px-12 py-8 rounded-2xl"
            >
              Continue with Free
            </Button>
          </div>

          <p className="text-gray-500 text-sm mt-10">
            Questions? We're here → <a href="mailto:hello@flippa.com" className="text-[#A88A86] underline">hello@flippa.com</a>
          </p>
        </div>
      </div>
    </div>
  );
>>>>>>> cd738166eff61c4e0c545c469221835d2734fe9e
}