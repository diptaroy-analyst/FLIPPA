// src/components/RoleSwitcherSettings.jsx
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users, Zap, Crown, HeartHandshake, Sparkles, Check } from "lucide-react";

const ROLES = {
  player: { name: "Player", icon: Users, color: "from-blue-500 to-cyan-600", desc: "Browse & buy highlights" },
  creator: { name: "Creator", icon: Zap, color: "from-purple-500 to-pink-600", desc: "Upload clips • Earn money" },
  pro: { name: "Pro", icon: Crown, color: "from-amber-500 to-orange-600", desc: "Unlimited • Best tools" },
  parent: { name: "Parent", icon: HeartHandshake, color: "from-emerald-500 to-green-600", desc: "Manage your athlete" }
};

export default function RoleSwitcherSettings() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentRole = currentUser.user_type || "player";

  const switchRole = (newRole) => {
    const updatedUser = { ...currentUser, user_type: newRole };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    toast.success("Role updated!", {
      description: `You are now a ${ROLES[newRole].name.toUpperCase()}`,
      icon: <Sparkles className="w-5 h-5" />
    });

    // Optional: reload to update layout instantly
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-8">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="w-8 h-8 text-yellow-400" />
        <h2 className="text-3xl font-bold text-white">Change Your Role</h2>
      </div>

      <p className="text-gray-300 mb-8">
        You can switch anytime — your content stays safe
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(ROLES).map(([key, role]) => {
          const Icon = role.icon;
          const isActive = currentRole === key;

          return (
            <div
              key={key}
              className={`relative rounded-2xl overflow-hidden transition-all ${
                isActive ? "ring-4 ring-white/50" : ""
              }`}
            >
              <div className={`p-6 bg-gradient-to-br ${role.color} ${isActive ? "opacity-100" : "opacity-75"}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Icon className="w-9 h-9 text-white" />
                  </div>
                  {isActive && (
                    <Badge className="bg-white text-black font-bold">
                      <Check className="w-4 h-4 mr-1" /> CURRENT
                    </Badge>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{role.name}</h3>
                <p className="text-white/80 text-sm mb-6">{role.desc}</p>

                <Button
                  onClick={() => switchRole(key)}
                  disabled={isActive}
                  className={`w-full font-bold ${
                    isActive
                      ? "bg-white/30 text-white cursor-not-allowed"
                      : "bg-white text-black hover:bg-white/90"
                  }`}
                >
                  {isActive ? "Current Role" : `Switch to ${role.name}`}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
        <p className="text-sm text-gray-400 text-center">
          Your clips, purchases, and earnings are preserved when switching roles
        </p>
      </div>
    </Card>
  );
}