
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Play, Star, ShoppingCart, TrendingUp } from "lucide-react";

export default function Marketplace() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [filterGradYear, setFilterGradYear] = useState('all');
  const [selectedClip, setSelectedClip] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [signedVideoUrl, setSignedVideoUrl] = useState(null);
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    // When a clip is selected, get signed URL for the video
    if (selectedClip?.video_url) {
      getSignedUrl(selectedClip.video_url);
    }
  }, [selectedClip]);

  const getSignedUrl = async (videoUrl) => {
    // Check if URL is already signed (e.g., if it's already a public URL with signed parameters)
    if (videoUrl.includes('X-Goog-Algorithm') || videoUrl.includes('Signature=')) {
      setSignedVideoUrl(videoUrl);
      return;
    }

    setLoadingSignedUrl(true);
    try {
      const response = await base44.functions.invoke('getSignedVideoUrl', { videoUrl });
      if (response.data?.signed_url) {
        setSignedVideoUrl(response.data.signed_url);
      } else {
        console.error('No signed URL returned from function invocation');
        setSignedVideoUrl(videoUrl); // Fallback to original URL if signed URL is not provided
      }
    } catch (error) {
      console.error('Error getting signed URL:', error);
      setSignedVideoUrl(videoUrl); // Fallback to original URL on error
    } finally {
      setLoadingSignedUrl(false);
    }
  };

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: clips = [], isLoading, refetch } = useQuery({
    queryKey: ['marketplace-clips'],
    queryFn: async () => {
      console.log('Fetching marketplace clips...');
      const allClips = await base44.entities.Clip.filter({ status: 'active' });
      console.log('Fetched clips:', allClips.length);
      return allClips.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    initialData: [],
    staleTime: 0, // Always refetch on mount
    refetchOnMount: 'always', // Force refetch when component mounts
  });

  const filteredClips = clips.filter(clip => {
    const matchesSearch = !searchTerm || 
      clip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clip.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clip.player_number?.toLowerCase().includes(searchTerm.toLowerCase()) || // Added player_number to search
      clip.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || clip.clip_type === filterType;
    const matchesState = filterState === 'all' || clip.state === filterState;
    const matchesGradYear = filterGradYear === 'all' || 
      clip.tags?.some(tag => tag.includes(filterGradYear));

    return matchesSearch && matchesType && matchesState && matchesGradYear;
  });

  const handleBuyClip = async (clip) => {
    if (!user) {
      alert('Please log in to purchase clips');
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    // Check if already purchased
    try {
      const existingPurchase = await base44.entities.Purchase.filter({
        buyer_email: user.email,
        clip_id: clip.id
      });

      if (existingPurchase && existingPurchase.length > 0) {
        alert('You have already purchased this clip! Check "My Purchases" to download it.');
        return;
      }

      // In a real app, this would go through Stripe payment
      // For now, we'll create the purchase directly
      const confirmed = confirm(`Purchase "${clip.title}" for $${clip.price.toFixed(2)}?`);
      if (!confirmed) return;

      await base44.entities.Purchase.create({
        buyer_email: user.email,
        clip_id: clip.id,
        creator_email: clip.creator_email,
        price_paid: clip.price,
        status: 'completed'
      });

      // Update clip stats
      await base44.entities.Clip.update(clip.id, {
        total_sales: (clip.total_sales || 0) + 1,
        total_revenue: (clip.total_revenue || 0) + clip.price
      });

      alert('🎉 Purchase successful! Check "My Purchases" to download your clip.');
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to complete purchase. Please try again.');
    }
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

  const getClipTypeLabel = (type) => {
    return type.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <style>{`
        @import url('https://api.fonts.coollabs.io/css2?family=Satoshi:wght@300;400;500;600;700&display=swap');
      `}</style>

      <div className="max-w-7xl mx-auto" style={{ fontFamily: 'Satoshi, sans-serif' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">Marketplace</h1>
          <p className="text-gray-300 text-lg">Browse and purchase game clips from creators</p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-sm text-[#A88A86] hover:text-white transition-colors"
          >
            🔄 Refresh Clips
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, team, player #, tags..."
                  className="pl-10 bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
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

            <Select value={filterGradYear} onValueChange={setFilterGradYear}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Grad Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grad Years</SelectItem>
                <SelectItem value="2025">Class of 2025</SelectItem>
                <SelectItem value="2026">Class of 2026</SelectItem>
                <SelectItem value="2027">Class of 2027</SelectItem>
                <SelectItem value="2028">Class of 2028</SelectItem>
                <SelectItem value="2029">Class of 2029</SelectItem>
                <SelectItem value="2030">Class of 2030</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Filter className="w-4 h-4" />
              <span>{filteredClips.length} clip{filteredClips.length !== 1 ? 's' : ''} found</span>
            </div>
            {(searchTerm || filterType !== 'all' || filterGradYear !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterGradYear('all');
                }}
                variant="ghost"
                className="text-[#A88A86] hover:text-white"
                size="sm"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Clips Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-[#A88A86] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading clips...</p>
          </div>
        ) : filteredClips.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No clips found</h3>
            <p className="text-gray-400">Try adjusting your filters or check back later for new content</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClips.map((clip) => (
              <Card key={clip.id} className="bg-white/5 backdrop-blur-lg border-white/10 overflow-hidden hover:border-[#A88A86] transition-all hover:scale-105">
                <div 
                  className="relative aspect-video bg-black/40 cursor-pointer group"
                  onClick={() => {
                    setSelectedClip(clip);
                    setShowVideoModal(true);
                    setSignedVideoUrl(null); // Reset signed URL when a new clip is selected
                  }}
                >
                  {clip.thumbnail_url ? (
                    <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-16 h-16 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-16 h-16 text-white" />
                  </div>
                  <Badge className={`absolute top-2 left-2 ${getClipTypeColor(clip.clip_type)} text-white font-bold`}>
                    {getClipTypeLabel(clip.clip_type)}
                  </Badge>
                  {clip.average_rating > 0 && (
                    <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-white text-sm font-semibold">{clip.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 truncate">{clip.title}</h3>
                  
                  {clip.team_name && (
                    <p className="text-[#A88A86] text-sm mb-2 font-semibold">{clip.team_name} {clip.player_number ? `#${clip.player_number}` : ''}</p>
                  )}

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{clip.description}</p>

                  {clip.tags && clip.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {clip.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-white/20 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                      {clip.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                          +{clip.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="text-2xl font-bold text-[#A88A86]">
                      ${clip.price.toFixed(2)}
                    </div>
                    <Button
                      onClick={() => handleBuyClip(clip)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy Now
                    </Button>
                  </div>

                  {clip.total_sales > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <TrendingUp className="w-3 h-3" />
                      {clip.total_sales} sale{clip.total_sales !== 1 ? 's' : ''}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Video Preview Modal */}
      {showVideoModal && selectedClip && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowVideoModal(false);
            setSignedVideoUrl(null); // Clear signed URL when modal closes
          }}
        >
          <div 
            className="bg-white/5 backdrop-blur-lg rounded-2xl max-w-4xl w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedClip.title}</h2>
                  {selectedClip.team_name && (
                    <p className="text-[#A88A86] font-semibold">{selectedClip.team_name} {selectedClip.player_number ? `#${selectedClip.player_number}` : ''}</p>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setShowVideoModal(false);
                    setSignedVideoUrl(null); // Clear signed URL when modal closes
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <span className="text-3xl">×</span>
                </button>
              </div>

              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                {loadingSignedUrl ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin w-12 h-12 border-4 border-[#A88A86] border-t-transparent rounded-full mx-auto mb-3"></div>
                      <p className="text-white">Loading video...</p>
                    </div>
                  </div>
                ) : signedVideoUrl ? (
                  <video
                    key={signedVideoUrl} // Key to force re-render when src changes
                    controls
                    className="w-full h-full"
                    poster={selectedClip.thumbnail_url}
                    preload="metadata"
                    playsInline
                    onError={(e) => {
                      console.error('❌ Video playback error:', e.target?.error);
                      console.error('Video URL:', signedVideoUrl);
                    }}
                    onLoadStart={() => console.log('🎬 Video loading started')}
                    onLoadedMetadata={() => console.log('✅ Video metadata loaded successfully')}
                    onCanPlay={() => console.log('✅ Video ready to play')}
                    onPlaying={() => console.log('▶️ Video is now playing')}
                  >
                    <source src={signedVideoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Play className="w-16 h-16 mx-auto mb-3 opacity-30" />
                      <p>Video not available</p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-gray-300 mb-4">{selectedClip.description}</p>

              {selectedClip.tags && selectedClip.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedClip.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="border-white/20 text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="text-3xl font-bold text-[#A88A86]">
                  ${selectedClip.price.toFixed(2)}
                </div>
                <Button
                  onClick={() => {
                    handleBuyClip(selectedClip);
                    setShowVideoModal(false);
                  }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg px-8 py-6"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Purchase Clip
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
