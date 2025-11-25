// src/pages/Pricing.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Sparkles, Zap, Crown, Check, Star, Users, Trophy,
  Rocket, Gift, ArrowRight, PartyPopper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Pricing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activatingPlan, setActivatingPlan] = useState(null);

  useEffect(() => {
    const loadUserAndPlan = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);

        const subs = await base44.entities.Subscription.filter({
          user_email: userData.email,
          status: "active"
        });

        if (subs.length > 0) {
          setCurrentPlan(subs[0].plan_type);
        }
      } catch (err) {
        console.log("Not logged in or no subscription");
      } finally {
        setLoading(false);
      }
    };
    loadUserAndPlan();
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#A88A86", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"]
    });
  };

  const handleActivatePlan = async (planType) => {
    try {
      const userData = await base44.auth.me();

      setActivatingPlan(planType);
      triggerConfetti();

      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 10);

      await base44.entities.Subscription.create({
        user_email: userData.email,
        plan_type: planType === "free" ? "free" : `${planType}_beta`,
        status: "active",
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: false,
        features: {
          max_files: planType === "pro" ? -1 : planType === "creator" ? 100 : 10,
          ai_analysis: planType !== "free",
          priority_support: planType === "pro"
        }
      });

      toast.success("Plan activated!", {
        description: "Welcome to Flippa — your beta access is live",
        icon: <PartyPopper className="w-5 h-5" />
      });

      setCurrentPlan(planType === "free" ? "free" : `${planType}_beta`);

      setTimeout(() => {
        if (userData.user_type === "creator") {
          navigate(createPageUrl("FileRenamer"));
        } else {
          navigate(createPageUrl("Marketplace"));
        }
      }, 1500);

    } catch (err) {
      if (err.message?.includes("authenticated")) {
        base44.auth.redirectToLogin(window.location.pathname);
      } else {
        toast.error("Activation failed — please try again");
      }
      setActivatingPlan(null);
    }
  };

  const plans = [
    {
      name: "Player",
      type: "free",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      description: "For athletes & parents",
      price: "Always Free",
      features: [
        "Browse all game clips",
        "Purchase highlights",
        "Download your clips forever",
        "Get tagged in footage",
        "Leave reviews",
        "No credit card needed"
      ]
    },
    {
      name: "Creator",
      type: "creator",
      icon: Zap,
      color: "from-purple-500 to-pink-600",
      description: "Perfect for content creators",
      price: "Free in Beta",
      badge: "MOST POPULAR",
      popular: true,
      features: [
        "Up to 100 clips per session",
        "AI-powered highlight detection",
        "LUT color grading",
        "EDL export",
        "Sell your clips",
        "15% fee only when you earn",
        "Early access to new features"
      ]
    },
    {
      name: "Pro",
      type: "pro",
      icon: Crown,
      color: "from-amber-500 to-orange-600",
      description: "For teams & studios",
      price: "Free in Beta",
      badge: "BEST VALUE",
      features: [
        "Unlimited clips & storage",
        "Advanced AI analysis",
        "Batch processing",
        "Priority support",
        "Only 5% fee on sales",
        "Team collaboration",
        "Custom branding (soon)",
        "Lifetime early-bird pricing"
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 overflow-hidden relative">
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
            <Rocket className="w-5 h-5 mr-2" />
            BETA LAUNCH — ALL CREATOR TOOLS FREE
          </Badge>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Start Creating Today
          </h1>
          <p className="text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Players use Flippa <span className="text-green-400 font-bold">100% free forever</span>.<br />
            Creators get <span className="text-[#A88A86] font-bold">full Pro access free</span> during beta.
          </p>
          <div className="flex items-center justify-center gap-2 text-yellow-400 mt-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-current" />
            ))}
            <span className="text-gray-400 ml-3">Join 2,000+ beta creators</span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isActive = currentPlan?.includes(plan.type);
            const isProcessing = activatingPlan === plan.type;

            return (
              <div
                key={plan.type}
                className={`relative group transition-all duration-500 hover:-translate-y-4 ${plan.popular ? "md:scale-110" : ""}`}
              >
                <div
                  className={`relative bg-white/5 backdrop-blur-2xl rounded-3xl p-10 border-2 transition-all hover:shadow-2xl hover:shadow-purple-500/20 ${
                    plan.popular ? "border-[#A88A86] ring-4 ring-[#A88A86]/30" : "border-white/10"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-[#A88A86] to-[#d4a59a] text-black font-bold px-6 py-2 text-lg shadow-lg">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  {isActive && (
                    <div className="absolute -top-5 right-6">
                      <Badge className="bg-green-600 text-white px-4 py-2">
                        <Check className="w-4 h-4 mr-1" />
                        Active
                      </Badge>
                    </div>
                  )}

                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${plan.color} p-5 mb-6 shadow-xl`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-3">{plan.name}</h3>
                  <p className="text-gray-400 mb-8">{plan.description}</p>

                  <div className="mb-10 text-center">
                    <div className="text-5xl font-bold text-white mb-2">{plan.price}</div>
                    {plan.type !== "free" && (
                      <p className="text-green-400 font-bold text-lg flex items-center justify-center gap-2">
                        <Gift className="w-5 h-5" />
                        Free during beta
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={() => handleActivatePlan(plan.type)}
                    disabled={isActive || isProcessing}
                    size="lg"
                    className={`w-full py-8 text-xl font-bold rounded-2xl transition-all transform hover:scale-105 ${
                      isActive
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : plan.popular
                        ? "bg-gradient-to-r from-[#A88A86] to-[#d4a59a] hover:from-[#9a7a76] hover:to-[#c49387] text-black shadow-2xl"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    }`}
                  >
                    {isProcessing
                      ? "Activating..."
                      : isActive
                      ? <>Current Plan <Check className="w-6 h-6 ml-2" /></>
                      : plan.type === "free"
                      ? "Continue as Player"
                      : <>Get Started Free <ArrowRight className="w-6 h-6 ml-2" /></>}
                  </Button>

                  <ul className="mt-10 space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Social Proof */}
        <div className="text-center">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 inline-block">
            <Trophy className="w-20 h-20 text-[#A88A86] mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-8">
              Trusted by Lacrosse Creators Nationwide
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {["2K+", "500+", "50+", "4.9"].map((stat, i) => (
                <div key={i}>
                  <div className="text-5xl font-bold text-[#A88A86] mb-2">{stat}</div>
                  <div className="text-gray-400">
                    {["Beta Creators", "Clips Uploaded", "Teams Covered", "Star Rating"][i]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}