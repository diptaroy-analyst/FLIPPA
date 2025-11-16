import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Play, Star, ShoppingCart, Tag, Calendar, User, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StorePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedClip, setSelectedClip] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      if (!userData.user_type) {
        navigate(createPageUrl('SelectUserType'));
      }
    } catch (error) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: clips = [], isLoading } = useQuery({
    queryKey: ['clips'],
    queryFn: async () => {
      const allClips = await base44.entities.Clip.filter({ status: 'active' });
      return allClips;
    },
  });

  const { data: myPurchases = [] } = useQuery({
    queryKey: ['myPurchases', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Purchase.filter({ buyer_email: user.email });
    },
    enabled: !!user,
  });

  const filteredClips = clips
    .filter(clip => {
      const matchesSearch = clip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clip.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clip.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'all' || clip.clip_type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'popular':
          return b.total_sales - a.total_sales;
        case 'rating':
          return b.average_rating - a.average_rating;
        case 'newest':
        default:
          return new Date(b.created_date) - new Date(a.created_date);
      }
    });

  const handlePurchase = async (clip) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    // Check if already purchased
    const alreadyPurchased = myPurchases.some(p => p.clip_id === clip.id);
    if (alreadyPurchased) {
      alert('You already own this clip! Check "My Purchases" to download it.');
      return;
    }

    setPurchasing(true);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        clipId: clip.id,
        userEmail: user.email,
        successUrl: window.location.origin + createPageUrl('MyPurchases'),
        cancelUrl: window.location.href
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to initiate purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading clips...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Browse Clips</h1>
          <p className="text-gray-300">Find and purchase professional lacrosse footage</p>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search clips, tags, teams..."
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Clip Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="goal">Goals</SelectItem>
                <SelectItem value="save">Saves</SelectItem>
                <SelectItem value="faceoff">Faceoffs</SelectItem>
                <SelectItem value="assist">Assists</SelectItem>
                <SelectItem value="ground_ball">Ground Balls</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clips Grid */}
        {filteredClips.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-24 h-24 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">No clips found</h2>
            <p className="text-gray-400">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClips.map((clip) => {
              const isPurchased = myPurchases.some(p => p.clip_id === clip.id);
              
              return (
                <div
                  key={clip.id}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:border-[#A88A86] transition-all hover:scale-105 cursor-pointer group"
                  onClick={() => setSelectedClip(clip)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-black/40 overflow-hidden">
                    {clip.thumbnail_url ? (
                      <img
                        src={clip.thumbnail_url}
                        alt={clip.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                    
                    {/* Duration Badge */}
                    {clip.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-semibold">
                        {formatDuration(clip.duration)}
                      </div>
                    )}

                    {/* Purchased Badge */}
                    {isPurchased && (
                      <div className="absolute top-2 left-2 bg-green-500 px-3 py-1 rounded-full text-xs text-white font-bold flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        Owned
                      </div>
                    )}

                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="w-16 h-16 rounded-full bg-[#A88A86] flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white line-clamp-1">{clip.title}</h3>
                      <span className="text-2xl font-bold text-[#A88A86] ml-2">${clip.price}</span>
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{clip.description}</p>

                    {/* Metadata */}
                    <div className="space-y-2 text-xs text-gray-400 mb-3">
                      {clip.team_name && (
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          <span>{clip.team_name}</span>
                        </div>
                      )}
                      
                      {clip.game_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(clip.game_date).toLocaleDateString()}</span>
                        </div>
                      )}

                      {clip.total_sales > 0 && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3 h-3" />
                          <span>{clip.total_sales} sales</span>
                        </div>
                      )}

                      {clip.average_rating > 0 && (
                        <div className="flex items-center gap-2">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          <span>{clip.average_rating.toFixed(1)} ({clip.review_count} reviews)</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {clip.tags && clip.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {clip.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Purchase Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(clip);
                      }}
                      disabled={isPurchased || purchasing}
                      className={`w-full ${
                        isPurchased
                          ? 'bg-green-600/50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      }`}
                    >
                      {isPurchased ? 'Already Owned' : purchasing ? 'Processing...' : 'Purchase'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clip Preview Modal */}
      {selectedClip && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedClip(null)}
        >
          <div
            className="bg-slate-900 border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video Preview */}
            <div className="relative aspect-video bg-black">
              {selectedClip.preview_url || selectedClip.thumbnail_url ? (
                <video
                  src={selectedClip.preview_url || selectedClip.thumbnail_url}
                  controls
                  className="w-full h-full"
                  poster={selectedClip.thumbnail_url}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-24 h-24 text-gray-500" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedClip.title}</h2>
                  {selectedClip.team_name && (
                    <p className="text-gray-400">{selectedClip.team_name}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-[#A88A86]">${selectedClip.price}</div>
                  {selectedClip.average_rating > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-white">{selectedClip.average_rating.toFixed(1)}</span>
                      <span className="text-gray-400 text-sm">({selectedClip.review_count})</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-300 mb-6">{selectedClip.description}</p>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Type</div>
                  <div className="text-white font-semibold capitalize">{selectedClip.clip_type.replace('_', ' ')}</div>
                </div>
                {selectedClip.duration && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Duration</div>
                    <div className="text-white font-semibold">{formatDuration(selectedClip.duration)}</div>
                  </div>
                )}
                {selectedClip.player_number && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Player #</div>
                    <div className="text-white font-semibold">{selectedClip.player_number}</div>
                  </div>
                )}
                {selectedClip.total_sales > 0 && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Sales</div>
                    <div className="text-white font-semibold">{selectedClip.total_sales}</div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {selectedClip.tags && selectedClip.tags.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm text-gray-400 mb-2">Tags:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedClip.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase Button */}
              <Button
                onClick={() => handlePurchase(selectedClip)}
                disabled={myPurchases.some(p => p.clip_id === selectedClip.id) || purchasing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 text-lg disabled:opacity-50"
              >
                {myPurchases.some(p => p.clip_id === selectedClip.id)
                  ? 'Already Owned'
                  : purchasing
                  ? 'Processing...'
                  : `Purchase for $${selectedClip.price}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}