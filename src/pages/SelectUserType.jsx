// src/pages/SelectUserType.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import {
  Upload, PlayCircle, Users, Sparkles, Trophy, ArrowRight,
  CheckCircle, Film, ShoppingBag, HeartHandshake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SelectUserType() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkUserAndRedirect();
  }, []);

  const checkUserAndRedirect = async () => {
    try {
      const userData = await base44.auth.me();
      
      if (userData.user_type) {
        if (userData.user_type === "player" || userData.user_type === "parent") {
          if (userData.profile_completed) {
            navigate(createPageUrl("Marketplace"), { replace: true });
          } else {
            navigate(createPageUrl("PlayerProfile"), { replace: true });
          }
        } else {
          navigate(createPageUrl("FileRenamer"), { replace: true });
        }
      }
    } catch (err) {
      console.log("Not logged in yet");
    } finally {
      setLoading(false);
    }
  };

  const selectUserType = async (type) => {
    if (saving) return;
    setSaving(true);

    try {
      const userData = await base44.auth.me();
      await base44.auth.updateMe({ user_type: type });

      toast.success("Welcome to Flippa!", {
        description: type === "creator" 
          ? "Let’s get your first clips uploaded"
          : "Let’s set up your player profile",
        icon: <Sparkles className="w-5 h-5" />
      });

      if (type === "creator") {
        navigate(createPageUrl("FileRenamer"));
      } else {
        navigate(createPageUrl("PlayerProfile"));
      }
    } catch (err) {
      toast.error("Failed to save choice. Try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl font-light animate-pulse">Loading your experience...</div>
      </div>
    );
  }

  const options = [
    {
      type: "creator",
      title: "I'm a Creator",
      subtitle: "Film games • Edit clips • Earn money",
      icon: Film,
      gradient: "from-purple-500 to-pink-600",
      hover: "hover:border-purple-500",
      button: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
      features: ["Upload unlimited footage", "AI-powered editing tools", "Sell clips directly", "Keep 85–95% of earnings"],
      badge: "MOST POPULAR",
      badgeColor: "from-purple-600 to-pink-600"
    },
    {
      type: "player",
      title: "I'm a Player",
      subtitle: "Get tagged • Build your highlight reel",
      icon: Trophy,
      gradient: "from-amber-500 to-orange-600",
      hover: "hover:border-amber-500",
      button: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
      features: ["Get tagged in game clips", "Buy your best moments", "Download forever", "100% free forever"],
      badge: "FREE FOREVER"
    },
    {
      type: "parent",
      title: "I'm a Parent",
      subtitle: "Manage your athlete’s clips",
      icon: HeartHandshake,
      gradient: "from-emerald-500 to-green-600",
      hover: "hover:border-emerald-500",
      button: "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700",
      features: ["Add multiple players", "Buy clips for your kids", "Track recruiting progress", "Peace of mind"],
      badge: "FAMILY PLAN"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-600 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;900&display=swap');
      `}</style>

      <div className="max-w-7xl mx-auto relative z-10" style={{ fontFamily: "'Urbanist', sans-serif" }}>
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 text-lg">
            <Sparkles className="w-5 h-5 mr-2" />
            Welcome to Flippa
          </Badge>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            How will you use Flippa?
          </h1>
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
            Choose your role — you can always change it later
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.type}
                className={`relative group transition-all duration-500 hover:-translate-y-6 ${
                  option.type === "creator" ? "md:scale-110" : ""
                }`}
              >
                <div className={`relative bg-white/5 backdrop-blur-2xl rounded-3xl p-10 border-2 border-white/10 ${option.hover} transition-all hover:shadow-2xl hover:shadow-purple-500/20`}>
                  {option.badge && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                      <Badge className={`bg-gradient-to-r ${option.badgeColor || "from-[#A88A86] to-[#d4a59a]"} text-black font-bold px-6 py-2 text-sm shadow-lg`}>
                        {option.badge}
                      </Badge>
                    </div>
                  )}

                  <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${option.gradient} p-6 mb-8 mx-auto shadow-2xl`}>
                    <Icon className="w-12 h-12 text-white" />
                  </div>

                  <h2 className="text-4xl font-bold text-white text-center mb-4">
                    {option.title}
                  </h2>
                  <p className="text-xl text-gray-300 text-center mb-10">
                    {option.subtitle}
                  </p>

                  <ul className="space-y-4 mb-12">
                    {option.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => selectUserType(option.type)}
                    disabled={saving}
                    size="lg"
                    className={`w-full py-8 text-xl font-bold rounded-2xl ${option.button} text-white shadow-2xl transition-all hover:scale-105`}
                  >
                    {saving ? "Saving..." : (
                      <>
                        {option.type === "creator" ? "Start Creating" : option.type === "player" ? "I’m a Player" : "I’m a Parent"}
                        <ArrowRight className="w-6 h-6 ml-3" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-16">
          <p className="text-gray-400 text-lg">
            <span className="text-white font-semibold">Not sure?</span> You can change your role anytime in Settings
          </p>
        </div>
      </div>
    </div>
  );
}