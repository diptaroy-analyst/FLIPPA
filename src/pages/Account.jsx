<<<<<<< HEAD
// src/pages/Account.jsx
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  User, Mail, Calendar, Crown, Zap, Trophy, Sparkles,
  Check, ArrowRight, Shield, Gift, PartyPopper, Receipt, Download
} from "lucide-react";

export default function Account() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEverything();
  }, []);

  const fetchEverything = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Active subscription
      const subs = await base44.entities.Subscription.filter({
        user_email: userData.email,
        status: "active"
      });
      if (subs.length > 0) setSubscription(subs[0]);

      // All subscriptions (for billing history)
      const allSubs = await base44.entities.Subscription.filter({
        user_email: userData.email
      });
      setBillingHistory(allSubs.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load account");
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });

  const handleUpgrade = async (plan) => {
    try {
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 10);

      if (!subscription) {
        await base44.entities.Subscription.create({
          user_email: user.email,
          plan_type: `${plan}_beta`,
          status: "active",
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString()
        });
      } else {
        await base44.entities.Subscription.update(subscription.id, {
          plan_type: `${plan}_beta`,
          end_date: endDate.toISOString()
        });
      }

      toast.success("Upgraded!", { icon: <PartyPopper className="w-6 h-6" /> });
      triggerConfetti();
      fetchEverything();
    } catch (err) {
      toast.error("Upgrade failed");
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) {
      return {
        name: "Player", tier: "free", icon: Trophy,
        gradient: "from-cyan-500 to-blue-600",
        badge: "FREE FOREVER",
        badgeColor: "bg-gradient-to-r from-cyan-400 to-blue-600"
      };
    }

    if (subscription.plan_type.includes("pro")) {
      return {
        name: "Pro Beta", tier: "pro", icon: Crown,
        gradient: "from-amber-500 to-orange-600",
        badge: "BEST VALUE",
        badgeColor: "bg-gradient-to-r from-amber-400 to-orange-500",
        betaBadge: "10-YEAR BETA"
      };
    }

    if (subscription.plan_type.includes("creator")) {
      return {
        name: "Creator Beta", tier: "creator", icon: Zap,
        gradient: "from-purple-500 to-pink-600",
        badge: "CREATOR BETA",
        badgeColor: "bg-gradient-to-r from-purple-500 to-pink-500",
        betaBadge: "10-YEAR ACCESS"
      };
    }
  };

  const plan = getCurrentPlan();
  const Icon = plan.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading account...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">Your Account</h1>
          <p className="text-xl text-gray-300">Everything in one place</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* User Info */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-8">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A88A86] to-[#d4a59a] flex items-center justify-center shadow-2xl">
                <User className="w-12 h-12 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{user?.name}</h2>
                <p className="text-gray-400 flex items-center gap-2"><Mail className="w-5 h-5" />{user?.email}</p>
              </div>
            </div>
            <div className="space-y-5 text-lg">
              <div className="flex justify-between"><span className="text-gray-400">Role</span><span className="text-white font-semibold capitalize">{user?.user_type || "—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Member Since</span><span className="text-white font-semibold">{new Date(user?.created_at).toLocaleDateString()}</span></div>
            </div>
          </Card>

          {/* Current Plan — FIXED & GORGEOUS */}
          <div className="relative">
            <Card className="bg-white/5 backdrop-blur-xl border-2 border-white/20 p-10 shadow-2xl">
              {/* Main Badge */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                <Badge className={`${plan.badgeColor} text-black font-bold text-lg px-8 py-3 shadow-xl`}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {plan.badge}
                </Badge>
              </div>

              {/* Secondary "10-YEAR BETA" Badge — now fits perfectly */}
              {plan.betaBadge && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <Badge className="bg-black/50 backdrop-blur text-white border border-white/20 text-sm px-4 py-1">
                    {plan.betaBadge}
                  </Badge>
                </div>
              )}

              <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${plan.gradient} p-6 mb-8 mx-auto shadow-2xl`}>
                <Icon className="w-16 h-16 text-white mx-auto" />
              </div>

              <h3 className="text-4xl font-bold text-white text-center mb-4">{plan.name}</h3>

              {subscription && (
                <p className="text-green-400 text-center font-bold text-lg mb-8">
                  <Gift className="inline w-6 h-6 mr-2" />
                  Free Until {new Date(subscription.end_date).getFullYear()}
                </p>
              )}

              {plan.tier === "free" ? (
                <div className="space-y-4 mt-8">
                  <Button onClick={() => handleUpgrade("creator")} className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Become a Creator <Zap className="w-6 h-6 ml-3" />
                  </Button>
                  <Button onClick={() => handleUpgrade("pro")} className="w-full h-16 text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black">
                    Go Pro — Best Value <Crown className="w-6 h-6 ml-3" />
                  </Button>
                </div>
              ) : (
                <div className="text-center mt-8">
                  <Badge className="bg-green-600 text-white text-xl px-8 py-4">
                    <Shield className="w-7 h-7 mr-3" /> Active
                  </Badge>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Billing History — NEW */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Receipt className="w-8 h-8" /> Billing History
          </h2>
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            {billingHistory.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No billing history yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {billingHistory.map((sub) => (
                  <div key={sub.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${sub.plan_type.includes("pro") ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-purple-500 to-pink-600"} flex items-center justify-center`}>
                        {sub.plan_type.includes("pro") ? <Crown className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">{sub.plan_type.replace("_beta", "").toUpperCase()} PLAN</p>
                        <p className="text-gray-400 text-sm">Started {new Date(sub.start_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={sub.status === "active" ? "default" : "secondary"} className="mb-2">
                        {sub.status.toUpperCase()}
                      </Badge>
                      <p className="text-gray-400 text-sm">Free (Beta)</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 text-lg">
            Need help? <a href="mailto:support@flippa.app" className="text-[#A88A86] font-bold hover:underline">support@flippa.app</a>
          </p>
        </div>
      </div>
    </div>
  );
=======
// src/pages/Account.jsx
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  User, Mail, Calendar, Crown, Zap, Trophy, Sparkles,
  Check, ArrowRight, Shield, Gift, PartyPopper, Receipt, Download
} from "lucide-react";

export default function Account() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEverything();
  }, []);

  const fetchEverything = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Active subscription
      const subs = await base44.entities.Subscription.filter({
        user_email: userData.email,
        status: "active"
      });
      if (subs.length > 0) setSubscription(subs[0]);

      // All subscriptions (for billing history)
      const allSubs = await base44.entities.Subscription.filter({
        user_email: userData.email
      });
      setBillingHistory(allSubs.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load account");
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });

  const handleUpgrade = async (plan) => {
    try {
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 10);

      if (!subscription) {
        await base44.entities.Subscription.create({
          user_email: user.email,
          plan_type: `${plan}_beta`,
          status: "active",
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString()
        });
      } else {
        await base44.entities.Subscription.update(subscription.id, {
          plan_type: `${plan}_beta`,
          end_date: endDate.toISOString()
        });
      }

      toast.success("Upgraded!", { icon: <PartyPopper className="w-6 h-6" /> });
      triggerConfetti();
      fetchEverything();
    } catch (err) {
      toast.error("Upgrade failed");
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) {
      return {
        name: "Player", tier: "free", icon: Trophy,
        gradient: "from-cyan-500 to-blue-600",
        badge: "FREE FOREVER",
        badgeColor: "bg-gradient-to-r from-cyan-400 to-blue-600"
      };
    }

    if (subscription.plan_type.includes("pro")) {
      return {
        name: "Pro Beta", tier: "pro", icon: Crown,
        gradient: "from-amber-500 to-orange-600",
        badge: "BEST VALUE",
        badgeColor: "bg-gradient-to-r from-amber-400 to-orange-500",
        betaBadge: "10-YEAR BETA"
      };
    }

    if (subscription.plan_type.includes("creator")) {
      return {
        name: "Creator Beta", tier: "creator", icon: Zap,
        gradient: "from-purple-500 to-pink-600",
        badge: "CREATOR BETA",
        badgeColor: "bg-gradient-to-r from-purple-500 to-pink-500",
        betaBadge: "10-YEAR ACCESS"
      };
    }
  };

  const plan = getCurrentPlan();
  const Icon = plan.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading account...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">Your Account</h1>
          <p className="text-xl text-gray-300">Everything in one place</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* User Info */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-8">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A88A86] to-[#d4a59a] flex items-center justify-center shadow-2xl">
                <User className="w-12 h-12 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{user?.name}</h2>
                <p className="text-gray-400 flex items-center gap-2"><Mail className="w-5 h-5" />{user?.email}</p>
              </div>
            </div>
            <div className="space-y-5 text-lg">
              <div className="flex justify-between"><span className="text-gray-400">Role</span><span className="text-white font-semibold capitalize">{user?.user_type || "—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Member Since</span><span className="text-white font-semibold">{new Date(user?.created_at).toLocaleDateString()}</span></div>
            </div>
          </Card>

          {/* Current Plan — FIXED & GORGEOUS */}
          <div className="relative">
            <Card className="bg-white/5 backdrop-blur-xl border-2 border-white/20 p-10 shadow-2xl">
              {/* Main Badge */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                <Badge className={`${plan.badgeColor} text-black font-bold text-lg px-8 py-3 shadow-xl`}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {plan.badge}
                </Badge>
              </div>

              {/* Secondary "10-YEAR BETA" Badge — now fits perfectly */}
              {plan.betaBadge && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <Badge className="bg-black/50 backdrop-blur text-white border border-white/20 text-sm px-4 py-1">
                    {plan.betaBadge}
                  </Badge>
                </div>
              )}

              <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${plan.gradient} p-6 mb-8 mx-auto shadow-2xl`}>
                <Icon className="w-16 h-16 text-white mx-auto" />
              </div>

              <h3 className="text-4xl font-bold text-white text-center mb-4">{plan.name}</h3>

              {subscription && (
                <p className="text-green-400 text-center font-bold text-lg mb-8">
                  <Gift className="inline w-6 h-6 mr-2" />
                  Free Until {new Date(subscription.end_date).getFullYear()}
                </p>
              )}

              {plan.tier === "free" ? (
                <div className="space-y-4 mt-8">
                  <Button onClick={() => handleUpgrade("creator")} className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Become a Creator <Zap className="w-6 h-6 ml-3" />
                  </Button>
                  <Button onClick={() => handleUpgrade("pro")} className="w-full h-16 text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black">
                    Go Pro — Best Value <Crown className="w-6 h-6 ml-3" />
                  </Button>
                </div>
              ) : (
                <div className="text-center mt-8">
                  <Badge className="bg-green-600 text-white text-xl px-8 py-4">
                    <Shield className="w-7 h-7 mr-3" /> Active
                  </Badge>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Billing History — NEW */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Receipt className="w-8 h-8" /> Billing History
          </h2>
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            {billingHistory.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No billing history yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {billingHistory.map((sub) => (
                  <div key={sub.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${sub.plan_type.includes("pro") ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-purple-500 to-pink-600"} flex items-center justify-center`}>
                        {sub.plan_type.includes("pro") ? <Crown className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">{sub.plan_type.replace("_beta", "").toUpperCase()} PLAN</p>
                        <p className="text-gray-400 text-sm">Started {new Date(sub.start_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={sub.status === "active" ? "default" : "secondary"} className="mb-2">
                        {sub.status.toUpperCase()}
                      </Badge>
                      <p className="text-gray-400 text-sm">Free (Beta)</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 text-lg">
            Need help? <a href="mailto:support@flippa.app" className="text-[#A88A86] font-bold hover:underline">support@flippa.app</a>
          </p>
        </div>
      </div>
    </div>
  );
>>>>>>> cd738166eff61c4e0c545c469221835d2734fe9e
}