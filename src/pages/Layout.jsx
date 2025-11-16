import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { User, Crown, Menu, X, Home, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Layout({ children, currentPageName }) {
  // use auth context user instead of local user state
  const { user, setUser, logout } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const navigate = useNavigate();

  // Inline helper functions to avoid import issues
  const getUserRole = (subscription) => {
    if (!subscription) return 'viewer';
    
    if (subscription.plan_type.startsWith('pro')) {
      return 'pro';
    } else if (subscription.plan_type.startsWith('creator')) {
      return 'creator';
    }
    
    return 'viewer';
  };

  const getUserPermissions = (role) => {
    const permissions = {
      viewer: {
        max_files: 10,
        max_markers: 5,
        ai_analysis: false,
        lut_support: false,
        export_edl: true,
        advanced_markers: false
      },
      creator: {
        max_files: 100,
        max_markers: 50,
        ai_analysis: true,
        lut_support: true,
        export_edl: true,
        advanced_markers: true
      },
      pro: {
        max_files: -1,
        max_markers: -1,
        ai_analysis: true,
        lut_support: true,
        export_edl: true,
        advanced_markers: true
      }
    };

    return permissions[role] || permissions.viewer;
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async () => {
    try {
      // Default to free tier first
      setSubscription(null);
      setUserRole('viewer');
      setPermissions({
        max_files: 10,
        max_markers: 5,
        ai_analysis: false,
        lut_support: false,
        export_edl: true,
        advanced_markers: false
      });

      // If base44 SDK not available, attempt to hydrate from localStorage (if context consumer didn't)
      if (typeof base44 === 'undefined' || !base44?.auth?.me) {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        }
        return;
      }

      // Try to load user data via SDK
      try {
        const userData = await base44.auth.me();
        if (!userData) {
          return;
        }

        // set user into context
        setUser(userData);

        // Try to load subscription
        try {
          if (typeof base44.entities?.Subscription?.filter === 'function') {
            const subs = await base44.entities.Subscription.filter({
              user_email: userData.email,
              status: 'active'
            });

            const activeSub = subs && subs.length > 0 ? subs[0] : null;
            if (activeSub) {
              setSubscription(activeSub);
              const role = getUserRole(activeSub);
              setUserRole(role);
              setPermissions(getUserPermissions(role));
            }
          }
        } catch (subError) {
          console.log('Could not load subscription:', subError?.message || subError);
        }
      } catch (authError) {
        console.log('User not authenticated:', authError?.message || authError);
      }
    } catch (error) {
      console.log('Error in loadUser:', error?.message || error);
      setSubscription(null);
      setUserRole('viewer');
      setPermissions({
        max_files: 10,
        max_markers: 5,
        ai_analysis: false,
        lut_support: false,
        export_edl: true,
        advanced_markers: false
      });
    }
  };

  const getPlanBadge = () => {
    if (!subscription) return { label: 'Free', color: 'bg-gray-600', icon: false };
    
    if (subscription.plan_type.startsWith('pro')) {
      return { label: 'Pro', color: 'bg-gradient-to-r from-amber-500 to-orange-500', icon: true };
    } else if (subscription.plan_type.startsWith('creator')) {
      return { label: 'Creator', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: true };
    }
    return { label: 'Free', color: 'bg-gray-600', icon: false };
  };

  const getHomeLink = () => {
    return createPageUrl('Landing');
  };

  const planBadge = getPlanBadge();

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Playfair Display, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet"');
      `}</style>

      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-slate-800 via-purple-800 to-slate-800 border-b border-white/10" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to={getHomeLink()}
              className="flex items-center gap-2 text-2xl font-bold text-white hover:text-[#D1B5A3] transition-colors ease-in-out duration-200"
            >
              <Home className="w-6 h-6" />
              flippa
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {user ? (
                <>
                  {user.user_type === 'creator' && (
                    <>
                      <Link
                        to={createPageUrl('FileRenamer')}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        Upload
                      </Link>
                      <Link
                        to={createPageUrl('CreatorDashboard')}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        Dashboard
                      </Link>
                    </>
                  )}

                  {(user.user_type === 'player' || user.user_type === 'parent') && (
                    <>
                      <Link
                        to={createPageUrl('Marketplace')}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        Marketplace
                      </Link>
                      <Link
                        to={createPageUrl('MyPurchases')}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        My Purchases
                      </Link>
                    </>
                  )}

                  <Link
                    to={createPageUrl('Pricing')}
                    className="text-gray-300 hover:text-white transition-colors duration-200 relative"
                  >
                    Pricing
                    {!subscription && (
                      <span className="absolute -top-1 -right-2 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    )}
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to={createPageUrl('AdminRosterUpload')}
                      className="text-red-400 hover:text-red-300 transition-colors font-semibold"
                    >
                      Admin: Rosters
                    </Link>
                  )}

                  <Link
                    to={createPageUrl('Account')}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <div className="flex items-center gap-2">
                      <span>{user.full_name || user.email}</span>
                      <span className={`px-2 py-1 ${planBadge.color} text-white text-xs font-bold rounded-full flex items-center gap-1`}>
                        {planBadge.icon && <Crown className="w-3 h-3" />}
                        {planBadge.label}
                      </span>
                    </div>
                  </Link>

                  {/* Desktop logout */}
                  <button
                    onClick={() => {
                      // Use context logout, then navigate to login
                      logout();
                      navigate('/login');
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors font-semibold flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={createPageUrl('Pricing')}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-[#D1B5A3] hover:bg-[#A88A86] text-black font-semibold rounded-lg transition-colors"
                  >
                    Login
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-lg">
            <div className="px-4 py-4 space-y-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <User className="w-8 h-8 text-[#D1B5A3]" />
                    <div>
                      <div className="text-white font-semibold">{user.full_name || user.email}</div>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 ${planBadge.color} text-white text-xs font-bold rounded-full mt-1`}>
                        {planBadge.icon && <Crown className="w-3 h-3" />}
                        {planBadge.label}
                      </div>
                    </div>
                  </div>

                  {user.user_type === 'creator' && (
                    <>
                      <Link
                        to={createPageUrl('FileRenamer')}
                        onClick={() => setMenuOpen(false)}
                        className="block text-gray-300 hover:text-white transition-colors py-2"
                      >
                        Upload
                      </Link>
                      <Link
                        to={createPageUrl('CreatorDashboard')}
                        onClick={() => setMenuOpen(false)}
                        className="block text-gray-300 hover:text-white transition-colors py-2"
                      >
                        Dashboard
                      </Link>
                    </>
                  )}

                  {(user.user_type === 'player' || user.user_type === 'parent') && (
                    <>
                      <Link
                        to={createPageUrl('Marketplace')}
                        onClick={() => setMenuOpen(false)}
                        className="block text-gray-300 hover:text-white transition-colors py-2"
                      >
                        Marketplace
                      </Link>
                      <Link
                        to={createPageUrl('MyPurchases')}
                        onClick={() => setMenuOpen(false)}
                        className="block text-gray-300 hover:text-white transition-colors py-2"
                      >
                        My Purchases
                      </Link>
                    </>
                  )}

                  <Link
                    to={createPageUrl('Pricing')}
                    onClick={() => setMenuOpen(false)}
                    className="block text-gray-300 hover:text-white transition-colors py-2"
                  >
                    Pricing
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to={createPageUrl('AdminRosterUpload')}
                      onClick={() => setMenuOpen(false)}
                      className="block text-red-400 hover:text-red-300 transition-colors py-2 font-semibold"
                    >
                      Admin: Rosters
                    </Link>
                  )}

                  <Link
                    to={createPageUrl('Account')}
                    onClick={() => setMenuOpen(false)}
                    className="block text-gray-300 hover:text-white transition-colors py-2"
                  >
                    Account Settings
                  </Link>

                  <button
                    onClick={() => {
                      // Use context logout instead of SDK-only call
                      logout();
                      setMenuOpen(false);
                      navigate('/login');
                    }}
                    className="w-full text-left text-red-400 hover:text-red-300 transition-colors py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={createPageUrl('Pricing')}
                    onClick={() => setMenuOpen(false)}
                    className="block text-gray-300 hover:text-white transition-colors py-2"
                  >
                    Pricing
                  </Link>
                  <button
                    onClick={() => {
                      navigate('/login');
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 bg-[#D1B5A3] hover:bg-[#A88A86] text-black font-semibold rounded-lg transition-colors"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>



      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2025 Flippa. Professional video file management for creators.</p>
          {permissions && (
            <p className="mt-2 text-xs text-gray-500">
              {userRole === 'viewer' && 'Free Plan • Upgrade to unlock more features'}
              {userRole === 'creator' && 'Creator Plan • Enjoying advanced features'}
              {userRole === 'pro' && 'Pro Plan • All features unlocked'}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
