import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User, CreditCard, LogOut, Crown, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/context/AuthContext"; // added import

export default function Account() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth(); // use context logout

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const subs = await base44.entities.Subscription.filter({
        user_email: userData.email,
        status: 'active'
      });

      if (subs.length > 0) {
        setSubscription(subs[0]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Use client-side navigation instead of SDK redirect which can break the UI
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  // replaced SDK redirecting logout with context logout + client redirect
  const handleLogout = async () => {
    try {
      // call AuthContext logout (clears local storage and calls SDK logout if available)
      await logout();
    } catch (e) {
      console.warn('Logout error:', e);
    } finally {
      // send user to login page (adjust path if your app uses a different route)
      navigate('/login');
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.'
    );

    if (confirmed) {
      try {
        await base44.entities.Subscription.update(subscription.id, {
          auto_renew: false,
          status: 'cancelled'
        });

        alert('✅ Subscription cancelled. You will have access until ' + new Date(subscription.end_date).toLocaleDateString());
        loadUserData();
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        alert('Failed to cancel subscription. Please try again.');
      }
    }
  };

  const getPlanDisplayName = (planType) => {
    if (!planType) return 'Free';
    const [name, period] = planType.split('_');
    return `${name.charAt(0).toUpperCase() + name.slice(1)} (${period === 'monthly' ? 'Monthly' : 'Yearly'})`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      {/* Replace the problematic font import with a valid Google Fonts URL */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet"');
      `}</style>

      <div className="max-w-4xl mx-auto" style={{ fontFamily: 'Urbanist, sans-serif' }}>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Account Settings</h1>
          <p className="text-xl text-gray-300">Manage your account and subscription</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.full_name || 'User'}</h2>
                <p className="text-gray-400">
                  {user.user_type === 'creator' ? 'Creator' : 
                   user.user_type === 'player' ? 'Player' : 
                   user.role === 'admin' ? 'Administrator' : 'User'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5 text-[#A88A86]" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-5 h-5 text-[#A88A86]" />
                <span>Joined {new Date(user.created_date).toLocaleDateString()}</span>
              </div>

              {/* Player-specific info */}
              {user.user_type === 'player' && user.profile_completed && (
                <>
                  {user.team_name && (
                    <div className="pt-4 border-t border-white/10">
                      <div className="text-sm text-gray-400 mb-2">Player Info</div>
                      <div className="space-y-2 text-sm text-gray-300">
                        <div>Team: {user.team_name}</div>
                        <div>Position: {user.position?.charAt(0).toUpperCase() + user.position?.slice(1)}</div>
                        <div>Number: #{user.jersey_number}</div>
                        <div>Class of: {user.graduation_year}</div>
                        {user.phone_number && <div>Phone: {user.phone_number}</div>}
                      </div>
                    </div>
                  )}

                  {/* Notification Preferences */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-sm text-gray-400 mb-2">Notifications</div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div>
                        Email alerts: {user.notification_preferences?.new_clips_email !== false ? '✓ Enabled' : '✗ Disabled'}
                      </div>
                      {user.notification_preferences?.my_team_only && (
                        <div className="text-xs">• Team clips only</div>
                      )}
                      {user.notification_preferences?.my_number_only && (
                        <div className="text-xs">• My number only</div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate(createPageUrl('PlayerProfile') + '?edit=true')}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Edit Player Info & Notifications
                  </Button>
                </>
              )}
            </div>

            <Button
              onClick={handleLogout}
              className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Subscription Card */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Subscription</h2>
                <p className="text-gray-400">
                  {subscription ? getPlanDisplayName(subscription.plan_type) : 'Free Plan'}
                </p>
              </div>
            </div>

            {subscription ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    subscription.status === 'active' ? 'bg-green-600/20 text-green-400' :
                    subscription.status === 'cancelled' ? 'bg-red-600/20 text-red-400' :
                    'bg-yellow-600/20 text-yellow-400'
                  }`}>
                    {subscription.status.toUpperCase()}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Renewal Date</div>
                  <div className="text-white font-semibold">
                    {new Date(subscription.end_date).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Auto-Renewal</div>
                  <div className="text-white font-semibold">
                    {subscription.auto_renew ? 'Enabled' : 'Disabled'}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="text-sm text-gray-400 mb-2">Features</div>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Max Files: {subscription.features?.max_files === -1 ? 'Unlimited' : subscription.features?.max_files || 10}</li>
                    <li>• AI Analysis: {subscription.features?.ai_analysis ? '✓' : '✗'}</li>
                    <li>• LUT Support: {subscription.features?.lut_support ? '✓' : '✗'}</li>
                    <li>• Priority Support: {subscription.features?.priority_support ? '✓' : '✗'}</li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  {subscription.status === 'active' && subscription.auto_renew && (
                    <Button
                      onClick={handleCancelSubscription}
                      variant="outline"
                      className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                      Cancel Subscription
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate(createPageUrl('Pricing'))}
                    className="flex-1 bg-[#A88A86] hover:bg-[#9A7A76] text-black"
                  >
                    Change Plan
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">
                  You're currently on the free plan. Upgrade to unlock more features!
                </p>
                <Button
                  onClick={() => navigate(createPageUrl('Pricing'))}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Payment Info (Placeholder) */}
        <div className="mt-6 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Payment Method</h2>
          </div>

          <div className="text-gray-400 text-sm">
            <p className="mb-4">
              Payment integration with Stripe is coming soon. For now, subscriptions are managed manually.
            </p>
            <p>
              If you have any questions about billing, please contact support at{' '}
              <a href="mailto:support@flippa.app" className="text-[#A88A86] hover:underline">
                support@flippa.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
