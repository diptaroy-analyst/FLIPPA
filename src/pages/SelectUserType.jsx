import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Upload, Play, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SelectUserType() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // If user already has a type set, redirect them
      if (userData.user_type) {
        if (userData.user_type === 'player' || userData.user_type === 'parent') {
          // Check if player has completed their profile
          if (userData.profile_completed) {
            navigate(createPageUrl('Store'));
          } else {
            navigate(createPageUrl('PlayerProfile'));
          }
        } else {
          navigate(createPageUrl('FileRenamer'));
        }
      }
    } catch (error) {
      base44.auth.redirectToLogin();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectType = async (userType) => {
    try {
      await base44.auth.updateMe({ user_type: userType });
      
      if (userType === 'player' || userType === 'parent') {
        // Redirect to profile completion page
        navigate(createPageUrl('PlayerProfile'));
      } else {
        // Creators go straight to file renamer
        navigate(createPageUrl('FileRenamer'));
      }
    } catch (error) {
      console.error('Error updating user type:', error);
      alert('Failed to set user type. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet"');
      `}</style>

      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Welcome to Flippa!</h1>
          <p className="text-xl text-gray-300">Choose how you want to use Flippa</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Creator Option */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/10 hover:border-purple-500 transition-all">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 mx-auto">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Creator</h2>
            <p className="text-gray-300 text-center mb-8">
              Upload and organize game footage, edit clips, and sell to players
            </p>
            <Button
              onClick={() => handleSelectType('creator')}
              className="w-full py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
            >
              I'm a Creator
            </Button>
          </div>

          {/* Player Option */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/10 hover:border-amber-500 transition-all">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 mx-auto">
              <Play className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Player</h2>
            <p className="text-gray-300 text-center mb-8">
              Browse and purchase your game highlights for recruiting videos
            </p>
            <Button
              onClick={() => handleSelectType('player')}
              className="w-full py-6 text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl"
            >
              I'm a Player
            </Button>
          </div>

          {/* Parent Option */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/10 hover:border-green-500 transition-all">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 mx-auto">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Parent</h2>
            <p className="text-gray-300 text-center mb-8">
              Manage your player's profiles and purchase clips on their behalf
            </p>
            <Button
              onClick={() => handleSelectType('parent')}
              className="w-full py-6 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl"
            >
              I'm a Parent
            </Button>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          Don't worry, you can change this later in your account settings
        </p>
      </div>
    </div>
  );
}