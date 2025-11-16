import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Download, Video, Star, Play, Calendar, Tag, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function MyPurchasesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

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

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['purchases', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Purchase.filter({ buyer_email: user.email });
    },
    enabled: !!user,
  });

  const { data: clips = [] } = useQuery({
    queryKey: ['purchasedClips', purchases],
    queryFn: async () => {
      if (purchases.length === 0) return [];
      const clipIds = purchases.map(p => p.clip_id);
      const allClips = await base44.entities.Clip.list();
      return allClips.filter(clip => clipIds.includes(clip.id));
    },
    enabled: purchases.length > 0,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['myReviews', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Review.filter({ buyer_email: user.email });
    },
    enabled: !!user,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async ({ clipId, creatorEmail, rating, comment }) => {
      const review = await base44.entities.Review.create({
        clip_id: clipId,
        buyer_email: user.email,
        creator_email: creatorEmail,
        rating,
        comment,
      });

      // Update purchase to mark as reviewed
      const purchase = purchases.find(p => p.clip_id === clipId);
      if (purchase) {
        await base44.entities.Purchase.update(purchase.id, { has_reviewed: true });
      }

      // Update clip stats
      const clip = clips.find(c => c.id === clipId);
      if (clip) {
        const clipReviews = reviews.filter(r => r.clip_id === clipId);
        const newReviewCount = clipReviews.length + 1;
        const totalRating = clipReviews.reduce((sum, r) => sum + r.rating, 0) + rating;
        const newAverageRating = totalRating / newReviewCount;

        await base44.entities.Clip.update(clipId, {
          review_count: newReviewCount,
          average_rating: newAverageRating,
        });
      }

      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
      queryClient.invalidateQueries({ queryKey: ['purchasedClips'] });
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: '' });
      alert('Review submitted successfully!');
    },
  });

  const handleDownload = async (clip) => {
    try {
      // Open video in new tab for download
      window.open(clip.video_url, '_blank');
      
      // Update download count
      const purchase = purchases.find(p => p.clip_id === clip.id);
      if (purchase) {
        await base44.entities.Purchase.update(purchase.id, {
          download_count: (purchase.download_count || 0) + 1,
        });
        queryClient.invalidateQueries({ queryKey: ['purchases'] });
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download. Please try again.');
    }
  };

  const openReviewModal = (purchase, clip) => {
    setSelectedPurchase({ ...purchase, clip });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedPurchase) return;
    
    await submitReviewMutation.mutateAsync({
      clipId: selectedPurchase.clip_id,
      creatorEmail: selectedPurchase.creator_email,
      rating: reviewData.rating,
      comment: reviewData.comment,
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasReviewed = (clipId) => {
    const purchase = purchases.find(p => p.clip_id === clipId);
    return purchase?.has_reviewed || reviews.some(r => r.clip_id === clipId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading purchases...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Purchases</h1>
          <p className="text-gray-300">Your purchased clips are ready to download</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-gray-400 text-sm">Total Purchases</div>
                <div className="text-3xl font-bold text-white">{purchases.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Download className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-gray-400 text-sm">Total Downloads</div>
                <div className="text-3xl font-bold text-white">
                  {purchases.reduce((sum, p) => sum + (p.download_count || 0), 0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchases Grid */}
        {purchases.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-12 text-center">
            <Video className="w-24 h-24 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">No purchases yet</h2>
            <p className="text-gray-400 mb-6">Browse the store to find clips</p>
            <Button
              onClick={() => navigate(createPageUrl('Store'))}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Browse Store
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((purchase) => {
              const clip = clips.find(c => c.id === purchase.clip_id);
              if (!clip) return null;

              return (
                <div
                  key={purchase.id}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:border-[#A88A86] transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-black/40">
                    {clip.thumbnail_url ? (
                      <img
                        src={clip.thumbnail_url}
                        alt={clip.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                    
                    {clip.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                        {formatDuration(clip.duration)}
                      </div>
                    )}

                    <div className="absolute top-2 left-2 bg-green-500 px-3 py-1 rounded-full text-xs text-white font-bold">
                      Owned
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{clip.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{clip.description}</p>

                    <div className="space-y-2 text-xs text-gray-400 mb-3">
                      <div className="flex items-center justify-between">
                        <span>Purchased</span>
                        <span className="text-white">
                          {new Date(purchase.created_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Price Paid</span>
                        <span className="text-green-400 font-bold">${purchase.price_paid}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Downloads</span>
                        <span className="text-white">{purchase.download_count || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleDownload(clip)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>

                      {!hasReviewed(clip.id) && (
                        <Button
                          onClick={() => openReviewModal(purchase, clip)}
                          variant="outline"
                          className="w-full border-white/20"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Leave Review
                        </Button>
                      )}

                      {hasReviewed(clip.id) && (
                        <div className="text-center text-sm text-gray-400">
                          ✓ Reviewed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Leave a Review</h2>
              <p className="text-gray-400 mb-6">{selectedPurchase.clip.title}</p>

              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-semibold mb-2 block">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= reviewData.rating
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-gray-500'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm font-semibold mb-2 block">
                    Comment (optional)
                  </label>
                  <Textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your thoughts about this clip..."
                    className="bg-white/10 border-white/20 text-white h-24"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowReviewModal(false);
                      setReviewData({ rating: 5, comment: '' });
                    }}
                    variant="outline"
                    className="flex-1 border-white/20"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Submit Review
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