// src/pages/Marketplace.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/context/AuthContext";
import {
  Search, Filter, Play, Star, ShoppingCart, TrendingUp,
  Loader2, X, CheckCircle, AlertCircle, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import { toast } from "sonner"; // Optional: add sonner for beautiful toasts

const CLIP_TYPES = [
  { value: "all", label: "All Types" },
  { value: "goal", label: "Goals", color: "bg-green-500" },
  { value: "save", label: "Saves", color: "bg-blue-500" },
  { value: "faceoff", label: "Faceoffs", color: "bg-amber-500" },
  { value: "assist", label: "Assists", color: "bg-purple-500" },
  { value: "ground_ball", label: "Ground Balls", color: "bg-orange-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
];

const GRAD_YEARS = ["all", "2025", "2026", "2027", "2028", "2029", "2030", "2031"];

export default function Marketplace() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterGradYear, setFilterGradYear] = useState("all");
  const [selectedClip, setSelectedClip] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [signedVideoUrl, setSignedVideoUrl] = useState("");
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);

  // Fetch all active clips
  const { data: clips = [], isLoading } = useQuery({
    queryKey: ["marketplace-clips"],
    queryFn: async () => {
      const allClips = await base44.entities.Clip.filter({ status: "active" });
      return allClips
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .map(clip => ({
          ...clip,
          tags: clip.tags || [],
          total_sales: clip.total_sales || 0,
          average_rating: clip.average_rating || 0,
        }));
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Filter clips with useMemo (huge performance win)
  const filteredClips = useMemo(() => {
    return clips.filter(clip => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = !search || [
        clip.title,
        clip.description,
        clip.team_name,
        clip.player_number,
        ...(clip.tags || [])
      ].some(field => field?.toString().toLowerCase().includes(search));

      const matchesType = filterType === "all" || clip.clip_type === filterType;
      const matchesGradYear = filterGradYear === "all" ||
        clip.tags?.some(tag => tag.includes(`Class of ${filterGradYear}`) || tag === filterGradYear);

      return matchesSearch && matchesType && matchesGradYear;
    });
  }, [clips, searchTerm, filterType, filterGradYear]);

  // Get signed URL for preview
  const getSignedUrl = useCallback(async (videoUrl) => {
    if (!videoUrl) return;

    if (videoUrl.includes("X-Goog-Algorithm") || videoUrl.includes("Signature=")) {
      setSignedVideoUrl(videoUrl);
      return;
    }

    setLoadingSignedUrl(true);
    try {
      const { data } = await base44.functions.invoke("getSignedVideoUrl", { videoUrl });
      setSignedVideoUrl(data?.signed_url || videoUrl);
    } catch (err) {
      console.error("Failed to get signed URL:", err);
      setSignedVideoUrl(videoUrl);
    } finally {
      setLoadingSignedUrl(false);
    }
  }, []);

  // Open modal + load video
  const openVideoModal = (clip) => {
    setSelectedClip(clip);
    setShowVideoModal(true);
    setSignedVideoUrl("");
    getSignedUrl(clip.video_url);
  };

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (clip) => {
      if (!user) throw new Error("You must be logged in");

      const existing = await base44.entities.Purchase.filter({
        buyer_email: user.email,
        clip_id: clip.id,
      });

      if (existing?.length > 0) {
        throw new Error("You already own this clip!");
      }

      await base44.entities.Purchase.create({
        buyer_email: user.email,
        clip_id: clip.id,
        creator_email: clip.creator_email,
        price_paid: clip.price,
        status: "completed",
      });

      await base44.entities.Clip.update(clip.id, {
        total_sales: (clip.total_sales || 0) + 1,
        total_revenue: (clip.total_revenue || 0) + clip.price,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["marketplace-clips"]);
      toast.success("Purchase successful! Check 'My Purchases'");
      setShowVideoModal(false);
    },
    onError: (error) => {
      if (error.message.includes("logged in")) {
        base44.auth.redirectToLogin(window.location.pathname);
      } else if (error.message.includes("already own")) {
        toast.info(error.message);
      } else {
        toast.error("Purchase failed. Try again.");
      }
    },
  });

  const handleBuy = (clip) => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }
    purchaseMutation.mutate(clip);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterGradYear("all");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <div className="max-w-7xl mx-auto" style={{ fontFamily: "'Urbanist', sans-serif" }}>
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Lacrosse Clip Marketplace
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Find your best plays. Buy professional highlights instantly.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by player, team, #22, tags..."
                className="pl-12 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-[#A88A86]"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Clip Type" />
              </SelectTrigger>
              <SelectContent>
                {CLIP_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterGradYear} onValueChange={setFilterGradYear}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Grad Year" />
              </SelectTrigger>
              <SelectContent>
                {GRAD_YEARS.map(year => (
                  <SelectItem key={year} value={year}>
                    {year === "all" ? "All Years" : `Class of ${year}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {filteredClips.length} clip{filteredClips.length !== 1 ? "s" : ""} available
            </p>
            {(searchTerm || filterType !== "all" || filterGradYear !== "all") && (
              <Button variant="ghost" onClick={clearFilters} className="text-[#A88A86] hover:text-white">
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Clips Grid */}
        {isLoading ? (
          <div className="text-center py-24">
            <Loader2 className="w-16 h-16 animate-spin text-[#A88A86] mx-auto mb-4" />
            <p className="text-gray-400">Loading the best plays...</p>
          </div>
        ) : filteredClips.length === 0 ? (
          <div className="text-center py-24">
            <Video className="w-24 h-24 text-gray-600 mx-auto mb-6 opacity-50" />
            <h3 className="text-3xl font-bold text-white mb-3">No clips found</h3>
            <p className="text-gray-400 text-lg">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClips.map((clip) => (
              <Card
                key={clip.id}
                className="bg-white/5 backdrop-blur-lg border border-white/10 overflow-hidden hover:border-[#A88A86]/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
                onClick={() => openVideoModal(clip)}
              >
                <div className="relative aspect-video bg-black/40">
                  {clip.thumbnail_url ? (
                    <img
                      src={clip.thumbnail_url}
                      alt={clip.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Play className="w-16 h-16 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-bold text-lg truncate">{clip.title}</p>
                    <p className="text-[#A88A86] text-sm">{clip.team_name} {clip.player_number && `#${clip.player_number}`}</p>
                  </div>
                  <Badge className={`absolute top-3 left-3 ${CLIP_TYPES.find(t => t.value === clip.clip_type)?.color || 'bg-gray-500'} text-white font-bold`}>
                    {clip.clip_type?.replace("_", " ").toUpperCase() || "CLIP"}
                  </Badge>
                  {clip.average_rating > 0 && (
                    <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-white text-xs font-bold">{clip.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg line-clamp-1">{clip.title}</h3>
                      <p className="text-[#A88A86] text-sm font-medium">
                        {clip.team_name} {clip.player_number && `#${clip.player_number}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#A88A86]">${clip.price.toFixed(2)}</p>
                      {clip.total_sales > 0 && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 justify-end mt-1">
                          <TrendingUp className="w-3 h-3" />
                          {clip.total_sales} sold
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuy(clip);
                    }}
                    disabled={purchaseMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold"
                  >
                    {purchaseMutation.isPending ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Video Preview Modal */}
      {showVideoModal && selectedClip && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="bg-gradient-to-br from-slate-900/90 to-purple-900/90 backdrop-blur-2xl rounded-3xl max-w-5xl w-full border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedClip.title}</h2>
                  <p className="text-[#A88A86] text-xl font-semibold">
                    {selectedClip.team_name} {selectedClip.player_number && `#${selectedClip.player_number}`}
                  </p>
                </div>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-6 shadow-2xl">
                {loadingSignedUrl ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-16 h-16 animate-spin text-[#A88A86] mx-auto mb-4" />
                      <p className="text-white text-lg">Loading your highlight...</p>
                    </div>
                  </div>
                ) : signedVideoUrl ? (
                  <video
                    key={signedVideoUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                    poster={selectedClip.thumbnail_url}
                  >
                    <source src={signedVideoUrl} type="video/mp4" />
                    <p className="text-white p-8 text-center">Your browser doesn't support video playback.</p>
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Video className="w-20 h-20 mb-4" />
                    <p>Video temporarily unavailable</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {selectedClip.description && (
                    <p className="text-gray-300 text-lg mb-4 max-w-2xl">{selectedClip.description}</p>
                  )}
                  {selectedClip.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedClip.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="bg-white/10 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  size="lg"
                  onClick={() => handleBuy(selectedClip)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl px-12 py-8 rounded-2xl shadow-2xl"
                >
                  <ShoppingCart className="w-6 h-6 mr-3" />
                  Buy for ${selectedClip.price.toFixed(2)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}