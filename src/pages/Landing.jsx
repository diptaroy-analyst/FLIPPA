
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Video, Zap, Star, Crown, Check, Upload, DollarSign, TrendingUp, Users, Play, Sparkles, Target, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const [currentClipIndex, setCurrentClipIndex] = useState(0);

  // Fetch real clips from marketplace
  const { data: clips = [] } = useQuery({
    queryKey: ['featured-clips'],
    queryFn: async () => {
      try {
        const allClips = await base44.entities.Clip.filter({ status: 'active' });
        // Get top 5 clips by sales
        return allClips
          .sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0))
          .slice(0, 5);
      } catch (error) {
        console.error('Error fetching clips:', error);
        return [];
      }
    },
    initialData: [],
  });

  // Auto-rotate carousel
  useEffect(() => {
    if (clips.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentClipIndex(prev => (prev + 1) % clips.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [clips.length]);

  const nextClip = () => {
    setCurrentClipIndex(prev => (prev + 1) % clips.length);
  };

  const prevClip = () => {
    setCurrentClipIndex(prev => (prev - 1 + clips.length) % clips.length);
  };

  const getClipTypeColor = (type) => {
    const colors = {
      goal: 'bg-green-500',
      save: 'bg-blue-500',
      faceoff: 'bg-amber-500',
      assist: 'bg-purple-500',
      ground_ball: 'bg-orange-500',
      other: 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const handleGetStarted = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        if (user.user_type === 'player' || user.user_type === 'parent') {
          // Check if profile is completed
          if (!user.profile_completed) {
            window.location.href = createPageUrl('PlayerProfile');
          } else {
            window.location.href = createPageUrl('Marketplace');
          }
        } else if (user.user_type === 'creator') {
          window.location.href = createPageUrl('FileRenamer');
        } else {
          window.location.href = createPageUrl('SelectUserType');
        }
      } else {
        base44.auth.redirectToLogin(window.location.pathname);
      }
    } catch (error) {
      console.error('Get started error:', error);
      base44.auth.redirectToLogin(window.location.pathname);
    }
  };

  const currentClip = clips[currentClipIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet"');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #A88A86 0%, #d4a59a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .slide-in {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Hero text */}
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-green-600/30 border-2 border-green-500/50 rounded-full animate-pulse">
                <span className="text-green-400 text-sm font-bold">🎉 BETA LAUNCH - ALL CREATOR PLANS FREE!</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Your Game.
                <br />
                <span className="gradient-text">Your Highlights.</span>
                <br />
                Your Recruiting Edge.
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Connect players with professional game footage. Upload, organize, and sell your best lacrosse moments—or find and purchase your highlight reels for recruiting.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg px-8 py-7 rounded-xl shadow-2xl shadow-green-500/50 transition-all hover:scale-105"
                >
                  Start Free Beta Access
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Link to={createPageUrl('Pricing')}>
                  <Button
                    variant="outline"
                    className="border-2 border-white/20 text-white bg-blue-500 hover:bg-blue-600 font-bold text-lg px-8 py-7 rounded-xl backdrop-blur-lg transition-all"
                  >
                    View Plans
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 text-gray-400 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Free for players</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Free beta testing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>No credit card</span>
                </div>
              </div>
            </div>

            {/* Right column - Featured Clips Carousel */}
            <div className="relative float-animation hidden lg:block">
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                {clips.length > 0 && currentClip ? (
                  <div className="slide-in" key={currentClipIndex}>
                    <div className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 rounded-2xl p-6 mb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-[#A88A86] rounded-full flex items-center justify-center">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold truncate">{currentClip.title}</div>
                          <div className="text-gray-400 text-sm">{currentClip.team_name || 'Featured Clip'}</div>
                        </div>
                      </div>
                      
                      <div className="relative bg-black/40 rounded-xl h-48 flex items-center justify-center mb-4 overflow-hidden group">
                        {currentClip.thumbnail_url ? (
                          <img 
                            src={currentClip.thumbnail_url} 
                            alt={currentClip.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <Play className="w-16 h-16 text-[#A88A86]" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 flex-wrap">
                          <Badge className={`${getClipTypeColor(currentClip.clip_type)} text-white font-bold text-xs`}>
                            {currentClip.clip_type ? currentClip.clip_type.toUpperCase() : 'CLIP'}
                          </Badge>
                          {currentClip.player_number && (
                            <Badge className="bg-purple-600/50 text-white font-bold text-xs">
                              #{currentClip.player_number}
                            </Badge>
                          )}
                          {currentClip.average_rating > 0 && (
                            <Badge className="bg-amber-500/50 text-white font-bold text-xs flex items-center gap-1">
                              <Star className="w-3 h-3 fill-white" />
                              {currentClip.average_rating.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                        <div className="text-[#A88A86] font-bold text-xl">${currentClip.price ? currentClip.price.toFixed(2) : '0.00'}</div>
                      </div>
                    </div>

                    {/* Carousel Controls */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={prevClip}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>

                      <div className="flex gap-2">
                        {clips.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentClipIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === currentClipIndex ? 'bg-[#A88A86] w-6' : 'bg-white/30'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={nextClip}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-[#A88A86] rounded-full flex items-center justify-center">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold">Loading Clips...</div>
                        <div className="text-gray-400 text-sm">Featured Content</div>
                      </div>
                    </div>
                    <div className="bg-black/40 rounded-xl h-48 flex items-center justify-center mb-4">
                      <Play className="w-16 h-16 text-[#A88A86] animate-pulse" />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-gray-600/30 text-gray-300 text-xs rounded-full animate-pulse w-16"></span>
                        <span className="px-3 py-1 bg-gray-600/30 text-gray-300 text-xs rounded-full animate-pulse w-12"></span>
                      </div>
                      <div className="text-[#A88A86] font-bold text-lg animate-pulse w-10 h-6 bg-[#A88A86]/30 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse"></div>
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse"></div>
                        <div className="w-6 h-2 rounded-full bg-[#A88A86] animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse"></div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse"></div>
                    </div>
                  </div>
                )}
                
                {/* Stats overlay */}
                <div className="absolute -right-4 -bottom-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-4 shadow-xl">
                  <div className="text-white font-bold text-2xl">1,247+</div>
                  <div className="text-white/80 text-sm">Clips Sold</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof / Stats */}
      <div className="bg-black/20 backdrop-blur-lg border-y border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">BETA</div>
              <div className="text-gray-400">Free Testing</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#A88A86] mb-2">10K+</div>
              <div className="text-gray-400">Players Registered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#A88A86] mb-2">50K+</div>
              <div className="text-gray-400">Clips Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">$0</div>
              <div className="text-gray-400">Cost During Beta</div>
            </div>
          </div>
        </div>
      </div>

      {/* Made by Creators for Creators */}
      <div className="bg-black/20 backdrop-blur-lg border-y border-white/10 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Made by <span className="gradient-text">Creators, for Creators</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built by someone who knows the struggle of organizing game footage and helping players find their best moments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Creator First</h3>
              <p className="text-gray-400 text-sm">
                Every feature is designed with content creators in mind. We understand your workflow because we live it.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Community Driven</h3>
              <p className="text-gray-400 text-sm">
                Built with feedback from real lacrosse videographers and players who need these tools every day.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Growing Together</h3>
              <p className="text-gray-400 text-sm">
                As you grow your business, we're here to support you with tools that scale with your success.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About / Why I Built This */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#A88A86] to-[#d4a59a] rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Why I Built Flippa</h2>
              <p className="text-gray-400">Our Story</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              I've been there - filming countless games, organizing thousands of clips, and watching players struggle to find their best moments for recruiting videos. I knew there had to be a better way.
            </p>

            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              That's why I built Flippa. A platform that makes it easy for creators to organize and monetize their work, while giving players instant access to their highlights when they need them most.
            </p>

            <p className="text-gray-300 text-lg leading-relaxed">
              Whether you're a content creator looking to turn your passion into profit, or a player building your recruiting portfolio, Flippa is here to help you succeed.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-[#A88A86] font-semibold text-lg">
              - Greg, Founder of Flippa
            </p>
          </div>
        </div>
      </div>

      {/* How it Works - Two-sided platform */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Built for <span className="gradient-text">Players & Creators</span>
          </h2>
          <p className="text-xl text-gray-400">Two ways to win on Flippa</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* For Players */}
          <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-lg rounded-3xl p-8 border border-amber-500/20">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-3xl font-bold text-white mb-4">For Players</h3>
            <p className="text-gray-300 mb-6">Get your best game moments for college recruiting videos</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 font-bold">1</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Create Your Profile</div>
                  <div className="text-gray-400 text-sm">Add your team, number, and grad year</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 font-bold">2</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Browse & Find Your Clips</div>
                  <div className="text-gray-400 text-sm">Search by team, date, or get tagged automatically</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 font-bold">3</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Purchase & Download</div>
                  <div className="text-gray-400 text-sm">Own your highlights forever, use for recruiting</div>
                </div>
              </div>
            </div>

            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="text-green-400 font-bold text-xl mb-1">NO SUBSCRIPTION NEEDED</div>
              <div className="text-gray-300 text-sm">Only pay when you buy clips</div>
            </div>
          </div>

          {/* For Creators */}
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/20">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-3xl font-bold text-white mb-4">For Creators</h3>
            <p className="text-gray-300 mb-6">Turn your game footage into a revenue stream</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">1</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Upload Your Footage</div>
                  <div className="text-gray-400 text-sm">Drag & drop game videos, organize with AI</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">2</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Create & List Clips</div>
                  <div className="text-gray-400 text-sm">AI generates descriptions, you set the price</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">3</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Earn Money</div>
                  <div className="text-gray-400 text-sm">Get paid when players purchase your clips</div>
                </div>
              </div>
            </div>

            <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4 text-center">
              <div className="text-purple-400 font-bold text-xl mb-1">From $35/mo</div>
              <div className="text-gray-300 text-sm">Keep 85-95% of sales revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powerful Tools for <span className="gradient-text">Pro Results</span>
          </h2>
          <p className="text-xl text-gray-400">Everything you need to create, sell, and download amazing highlights</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI-Powered Tagging</h3>
            <p className="text-gray-400">
              Automatically detect goals, saves, and players. Smart organization saves hours of manual work.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all group">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Professional Editing</h3>
            <p className="text-gray-400">
              Trim, color grade, add LUTs, and export to DaVinci Resolve. Studio-quality tools in your browser.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Revenue Dashboard</h3>
            <p className="text-gray-400">
              Track your sales, earnings, and popular clips. Easy withdrawals via PayPal or bank transfer.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Player Profiles</h3>
            <p className="text-gray-400">
              Players get personalized profiles. Get notified when you're tagged in new clips.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all group">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Instant Downloads</h3>
            <p className="text-gray-400">
              Purchase and download clips instantly. Full HD quality, yours to keep and use forever.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all group">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Reviews & Ratings</h3>
            <p className="text-gray-400">
              Build trust with player reviews. Top-rated creators get featured placement.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials/Social Proof */}
      <div className="bg-black/20 backdrop-blur-lg border-y border-white/10 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Loved by <span className="gradient-text">Players & Creators</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "Finally found my championship goal! This made my recruiting video 10x better. My coach couldn't believe the quality."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full"></div>
                <div>
                  <div className="text-white font-semibold">Jake M.</div>
                  <div className="text-gray-400 text-sm">Class of 2026</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "I've made over $2,000 selling clips from last season's games. The AI tagging saves me so much time. Best side hustle ever!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                <div>
                  <div className="text-white font-semibold">Sarah L.</div>
                  <div className="text-gray-400 text-sm">Creator</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "As a parent, being able to find and download my son's highlights is amazing. He got tagged in 12 clips from last weekend!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full"></div>
                <div>
                  <div className="text-white font-semibold">Mike R.</div>
                  <div className="text-gray-400 text-sm">Parent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-lg border-2 border-green-500/30 rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-12 h-12 text-green-400" />
              <Crown className="w-12 h-12 text-[#A88A86]" />
              <Sparkles className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Join our beta program and get <span className="text-green-400 font-bold">free access</span> to all creator features!
            </p>
            <p className="text-lg text-green-300 mb-8">
              Be part of building the best platform for lacrosse content creators
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl px-12 py-8 rounded-xl shadow-2xl shadow-green-500/50 transition-all hover:scale-105"
              >
                Activate Free Beta
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              <Link to={createPageUrl('Pricing')}>
                <Button
                  variant="outline"
                  className="border-2 border-white/30 text-white bg-transparent hover:bg-white/10 font-bold text-xl px-12 py-8 rounded-xl backdrop-blur-lg transition-all"
                >
                  See All Plans
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Free beta access</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Free for players forever</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
