// src/pages/Pricing.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Sparkles, Zap, Crown, Check, X, Star, Users, Trophy,
  Rocket, Gift, ArrowRight, PartyPopper, Infinity, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Pricing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activatingPlan, setActivatingPlan] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState("monthly"); // "monthly" or "yearly"

  useEffect(() => {
    const loadUserAndPlan = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        const subs = await base44.entities.Subscription.filter({
          user_email: userData.email,
          status: "active"
        });
        if (subs.length > 0) setCurrentPlan(subs[0].plan_type);
      } catch (err) { }
      finally { setLoading(false); }
    };
    loadUserAndPlan();
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 140,
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
      });

      toast.success("Welcome to Flippa Pro!", {
        description: "Your beta access is now live",
        icon: <PartyPopper className="w-5 h-5" />
      });

      setCurrentPlan(planType === "free" ? "free" : `${planType}_beta`);

      setTimeout(() => {
        navigate(userData.user_type === "creator" ? createPageUrl("FileRenamer") : createPageUrl("Marketplace"));
      }, 1500);
    } catch (err) {
      if (err.message?.includes("authenticated")) {
        base44.auth.redirectToLogin(window.location.pathname);
      } else {
        toast.error("Activation failed");
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
      price: { monthly: "Always Free", yearly: "Always Free" },
      description: "For athletes & parents",
      features: ["Browse & purchase clips", "Get tagged in footage", "Download forever", "No credit card needed"]
    },
    {
      name: "Creator",
      type: "creator",
      icon: Zap,
      color: "from-purple-500 to-pink-600",
      price: { monthly: 29, yearly: 19 },
      save: "Save 34%",
      popular: true,
      badge: "MOST POPULAR",
      description: "Perfect for content creators",
      features: ["100 clips per session", "AI highlight detection", "LUT color grading", "EDL export", "15% fee on sales"]
    },
    {
      name: "Pro",
      type: "pro",
      icon: Crown,
      color: "from-amber-500 to-orange-600",
      price: { monthly: 79, yearly: 49 },
      save: "Save 38%",
      badgeDeal: true,
      badge: "BEST VALUE",
      description: "For teams & studios",
      features: ["Unlimited everything", "5% fee on sales", "Batch processing", "Priority support", "Team collaboration", "Custom branding (soon)"]
    }
  ];

  const getPrice = (plan) => {
    if (plan.type === "free") return "Always Free";
    const price = plan.price[billingPeriod];
    return billingPeriod === "yearly" ? `$${price}/mo` : `$${price}/mo`;
  };

  const comparisonFeatures = [
    { feature: "Clip uploads per session", free: "10", creator: "100", pro: "Unlimited" },
    { feature: "AI highlight detection", free: false, creator: true, pro: true },
    { feature: "LUT color grading", free: false, creator: true, pro: true },
    { feature: "EDL export", free: false, creator: true, pro: true },
    { feature: "Sell clips & earn money", free: false, creator: true, pro: true },
    { feature: "Transaction fee", free: "—", creator: "15%", pro: "5%" },
    { feature: "Batch processing", free: false, creator: false, pro: true },
    { feature: "Priority support", free: false, creator: false, pro: true },
    { feature: "Team collaboration", free: false, creator: false, pro: "Coming soon" },
  ];

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"><div className="text-white text-2xl">Loading...</div></div>;

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

        {/* Hero + Toggle */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 text-lg">
            <Rocket className="w-5 h-5 mr-2" /> BETA LAUNCH — ALL PLANS FREE
          </Badge>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">Choose Your Plan</h1>
          <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Players use Flippa <span className="text-green-400 font-bold">100% free forever</span>.<br />
            Creators get <span className="text-[#A88A86] font-bold">full access free during beta</span>.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-lg ${billingPeriod === "monthly" ? "text-white font-bold" : "text-gray-500"}`}>Monthly</span>
            <button
              onClick={() => setBillingPeriod(prev => prev === "monthly" ? "yearly" : "monthly")}
              className="relative w-16 h-9 bg-white/20 rounded-full p-1 transition-all"
            >
              <div className={`absolute top-1 w-7 h-7 bg-gradient-to-r from-[#A88A86] to-[#d4a59a] rounded-full shadow-lg transition-all ${billingPeriod === "yearly" ? "translate-x-7" : "translate-x-0"}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-lg ${billingPeriod === "yearly" ? "text-white font-bold" : "text-gray-500"}`}>Annual</span>
              <Badge className="bg-green-600 text-white animate-pulse">Save up to 38%</Badge>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isActive = currentPlan?.includes(plan.type);
            const isProcessing = activatingPlan === plan.type;

            return (
              <div key={plan.type} className={`relative group transition-all duration-500 hover:-translate-y-4 ${plan.popular ? "md:scale-110" : ""}`}>
                <div className={`relative bg-white/5 backdrop-blur-2xl rounded-3xl p-10 border-2 transition-all hover:shadow-2xl hover:shadow-purple-500/20 ${plan.popular ? "border-[#A88A86] ring-4 ring-[#A88A86]/30" : "border-white/10"}`}>
                  {plan.badge && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-[#A88A86] to-[#d4a59a] text-black font-bold px-6 py-2 text-lg shadow-lg">{plan.badge}</Badge>
                    </div>
                  )}
                  {plan.save && billingPeriod === "yearly" && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                      <Badge className="bg-green-600 text-white px-4 py-1 text-sm font-bold animate-bounce">{plan.save}</Badge>
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute -top-5 right-6">
                      <Badge className="bg-green-600 text-white px-4 py-2"><Check className="w-4 h-4 mr-1" />Active</Badge>
                    </div>
                  )}

                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${plan.color} p-5 mb-6 shadow-xl`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-3">{plan.name}</h3>
                  <p className="text-gray-400 mb-8">{plan.description}</p>

                  <div className="mb-10 text-center">
                    <div className="text-5xl font-bold text-white mb-2">{getPrice(plan)}</div>
                    {plan.type !== "free" && billingPeriod === "yearly" && (
                      <p className="text-sm text-gray-500 line-through">$ {plan.price.monthly}/mo</p>
                    )}
                    {plan.type !== "free" && (
                      <p className="text-green-400 font-bold text-lg flex items-center justify-center gap-2 mt-3">
                        <Gift className="w-5 h-5" /> Free during beta
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={() => handleActivatePlan(plan.type)}
                    disabled={isActive || isProcessing}
                    size="lg"
                    className={`w-full py-8 text-xl font-bold rounded-2xl transition-all transform hover:scale-105 ${
                      isActive ? "bg-gray-700 text-gray-400 cursor-not-allowed" :
                      plan.popular ? "bg-gradient-to-r from-[#A88A86] to-[#d4a59a] hover:from-[#9a7a76] hover:to-[#c49387] text-black shadow-2xl" :
                      "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    }`}
                  >
                    {isProcessing ? "Activating..." : isActive ? <>Current Plan <Check className="w-6 h-6 ml-2" /></> : plan.type === "free" ? "Continue as Player" : <>Get Started Free <ArrowRight className="w-6 h-6 ml-2" /></>}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden mb-20">
          <div className="p-8 text-center border-b border-white/10">
            <h2 className="text-4xl font-bold text-white mb-3">Full Feature Comparison</h2>
            <p className="text-gray-300">Everything you need to dominate</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-6 text-gray-400 font-medium">Feature</th>
                  <th className="text-center p-6"><span className="text-blue-400 font-bold">Player</span></th>
                  <th className="text-center p-6"><span className="text-purple-400 font-bold">Creator</span></th>
                  <th className="text-center p-6"><span className="text-amber-400 font-bold">Pro</span></th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="p-6 text-gray-300 font-medium">{row.feature}</td>
                    {["free", "creator", "pro"].map((tier) => (
                      <td key={tier} className="p-6 text-center">
                        {typeof row[tier] === "boolean" ? (
                          row[tier] ? <Check className="w-6 h-6 text-green-400 mx-auto" /> : <X className="w-6 h-6 text-red-500 mx-auto" />
                        ) : row[tier] === "Unlimited" ? (
                          <Infinity className="w-7 h-7 text-amber-400 mx-auto" />
                        ) : (
                          <span className={`font-bold ${tier === "creator" ? "text-purple-300" : tier === "pro" ? "text-amber-300" : "text-white"}`}>
                            {row[tier]}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
            <Trophy className="w-20 h-20 text-[#A88A86] mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-8">Trusted by Lacrosse Creators Nationwide</h2>
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