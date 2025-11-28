// src/pages/MyPurchases.jsx
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/context/AuthContext";
import { createPageUrl } from "@/utils";
import {
  Download, Video, Star, Play, Calendar, Tag, ShoppingBag,
  Loader2, CheckCircle, X, ArrowDownToLine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function MyPurchases() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedClip, setSelectedClip] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [downloadingId, setDownloadingId] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
    }
  }, [user]);

  // Fetch purchases
  const { data: purchases = [], isLoading: loadingPurchases } = useQuery({
    queryKey: ["my-purchases", user?.email],
    queryFn: async () => {
      if (!user) return [];
      const results = await base44.entities.Purchase.filter({ buyer_email: user.email });
      return results.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user,
  });

  // Fetch purchased clips + reviews in parallel
  const { data: clips = [] } = useQuery({
    queryKey: ["purchased-clips", purchases.map(p => p.clip_id)],
    queryFn: async () => {
      if (purchases.length === 0) return [];
      const clipIds = purchases.map(p => p.clip_id);
      const allClips = await base44.entities.Clip.list();
      return allClips.filter(c => clipIds.includes(c.id));
    },
    enabled: purchases.length > 0,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["my-reviews", user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Review.filter({ buyer_email: user.email });
    },
    enabled: !!user,
  });

  // Get signed download URL
  const getSignedDownloadUrl = async (videoUrl) => {
    if (!videoUrl) return videoUrl;
    if (videoUrl.includes("X-Goog-Algorithm") || videoUrl.includes("Signature=")) {
      return videoUrl;
    }
    try {
      const { data } = await base44.functions.invoke("getSignedVideoUrl", { videoUrl });
      return data?.signed_url || videoUrl;
    } catch (err) {
      console.error("Failed to get signed URL:", err);
      return videoUrl;
    }
  };

  // Download handler
  const handleDownload = async (clip, purchase) => {
    setDownloadingId(clip.id);
    try {
      const signedUrl = await getSignedDownloadUrl(clip.video_url);
      const link = document.createElement("a");
      link.href = signedUrl;
      link.download = `${clip.title.replace(/[^a-z0-9]/gi, '_')}_${clip.id}.mp4`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update download count
      await base44.entities.Purchase.update(purchase.id, {
        download_count: (purchase.download_count || 0) + 1,
      });
      queryClient.invalidateQueries(["my-purchases"]);
      toast.success("Download started!");
    } catch (err) {
      toast.error("Download failed. Try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ clipId, creatorEmail }) => {
      await base44.entities.Review.create({
        clip_id: clipId,
        buyer_email: user.email,
        creator_email: creatorEmail,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      const purchase = purchases.find(p => p.clip_id === clipId);
      if (purchase) {
        await base44.entities.Purchase.update(purchase.id, { has_reviewed: true });
      }

      // Update clip average rating
      const clipReviews = reviews.filter(r => r.clip_id === clipId);
      const total = clipReviews.reduce((sum, r) => sum + r.rating, 0) + reviewData.rating;
      const avg = total / (clipReviews.length + 1);

      await base44.entities.Clip.update(clipId, {
        review_count: clipReviews.length + 1,
        average_rating: Number(avg.toFixed(2)),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["my-purchases"]);
      queryClient.invalidateQueries(["my-reviews"]);
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: "" });
      toast.success("Thank you for your review!");
    },
    onError: () => toast.error("Failed to submit review"),
  });

  const hasReviewed = (clipId) => {
    return purchases.find(p => p.clip_id === clipId)?.has_reviewed ||
           reviews.some(r => r.clip_id === clipId);
  };

  const totalSpent = purchases.reduce((sum, p) => sum + (p.price_paid || 0), 0);
  const totalDownloads = purchases.reduce((sum, p) => sum + (p.download_count || 0), 0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <div className="max-w-7xl mx-auto" style={{ fontFamily: "'Urbanist', sans-serif" }}>
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">My Purchased Clips</h1>
          <p className="text-xl text-gray-300">All your highlights, ready to download and share</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Purchases</p>
                <p className="text-3xl font-bold text-white">{purchases.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                <ArrowDownToLine className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Downloads</p>
                <p className="text-3xl font-bold text-white">{totalDownloads}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-2xl">$</span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-[#A88A86]">${totalSpent.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {loadingPurchases ? (
          <div className="text-center py-24">
            <Loader2 className="w-16 h-16 animate-spin text-[#A88A86] mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Loading your clips...</p>
          </div>
        ) : purchases.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-16 text-center">
            <Video className="w-24 h-24 text-gray-600 mx-auto mb-6 opacity-50" />
            <h2 className="text-3xl font-bold text-white mb-4">No purchases yet</h2>
            <p className="text-gray-400 text-lg mb-8">Start building your highlight reel today</p>
            <Button
              size="lg"
              onClick={() => navigate(createPageUrl("Marketplace"))}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl px-10 py-6 rounded-xl"
            >
              Browse Marketplace
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {purchases.map((purchase) => {
              const clip = clips.find(c => c.id === purchase.clip_id);
              if (!clip) return null;

              return (
                <Card
                  key={purchase.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden hover:border-[#A88A86]/50 transition-all duration-300 group"
                >
                  <div className="relative aspect-video bg-black/40">
                    {clip.thumbnail_url ? (
                      <img
                        src={clip.thumbnail_url}
                        alt={clip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Play className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-green-500/90 text-white font-bold">
                      OWNED
                    </Badge>
                    {clip.duration && (
                      <Badge className="absolute bottom-3 right-3 bg-black/70 text-white text-xs">
                        {Math.floor(clip.duration / 60)}:{(clip.duration % 60).toString().padStart(2, "0")}
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{clip.title}</h3>
                    <p className="text-sm text-[#A88A86] font-medium mb-3">
                      {clip.team_name} {clip.player_number && `#${clip.player_number}`}
                    </p>

                    <div className="text-xs text-gray-400 space-y-1 mb-4">
                      <div className="flex justify-between">
                        <span>Purchased</span>
                        <span>{new Date(purchase.created_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price</span>
                        <span className="text-green-400 font-bold">${purchase.price_paid?.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={() => handleDownload(clip, purchase)}
                        disabled={downloadingId === clip.id}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold"
                      >
                        {downloadingId === clip.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download Clip
                          </>
                        )}
                      </Button>

                      {!hasReviewed(clip.id) ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedClip({ clip, purchase });
                            setShowReviewModal(true);
                          }}
                          className="w-full border-white/20 hover:bg-white/10"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Leave a Review
                        </Button>
                      ) : (
                        <div className="text-center text-sm text-green-400 font-medium flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Review Submitted
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedClip && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900/50 backdrop-blur-2xl rounded-3xl max-w-lg w-full border border-white/20 shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Rate This Clip</h2>
                  <p className="text-gray-300 text-lg">{selectedClip.clip.title}</p>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-white font-semibold mb-4 block">Your Rating</label>
                  <div className="flex gap-3 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                        className="transition-all hover:scale-125"
                      >
                        <Star
                          className={`w-12 h-12 transition-all ${
                            star <= reviewData.rating
                              ? "fill-yellow-500 text-yellow-500 drop-shadow-lg"
                              : "text-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold mb-3 block">Your Review (Optional)</label>
                  <Textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="What did you love about this highlight?"
                    className="bg-white/10 border-white/20 text-white placeholder-gray-500 h-32 resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 border-white/30 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => reviewMutation.mutate({
                      clipId: selectedClip.clip.id,
                      creatorEmail: selectedClip.purchase.creator_email,
                    })}
                    disabled={reviewMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold text-lg"
                  >
                    {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}