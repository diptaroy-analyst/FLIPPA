import React from "react";
import { Crown, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function UpgradePrompt({ feature, message, inline = false, className = "" }) {
  const navigate = useNavigate();

  if (inline) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg ${className}`}>
        <Lock className="w-4 h-4 text-amber-500" />
        <span className="text-xs text-amber-500 font-semibold flex-1">{message}</span>
        <button
          onClick={() => navigate(createPageUrl('Pricing'))}
          className="text-xs text-amber-500 hover:text-amber-400 font-bold underline"
        >
          Upgrade
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-lg border border-amber-500/30 rounded-xl p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">Upgrade to Unlock</h3>
          <p className="text-gray-300 text-sm mb-4">{message}</p>
          <Button
            onClick={() => navigate(createPageUrl('Pricing'))}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold"
          >
            View Plans <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}