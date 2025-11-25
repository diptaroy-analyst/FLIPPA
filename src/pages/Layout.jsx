// src/components/Layout.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { User, Crown, Menu, X, Home, Lock, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Layout({ children, currentPageName = "" }) {
  const { user, setUser, logout } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [userRole, setUserRole] = useState("viewer");
  const [permissions, setPermissions] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Role & Permissions Logic (memoized outside render)
  const getUserRole = (sub) => {
    if (!sub) return "viewer";
    if (sub.plan_type?.startsWith("pro")) return "pro";
    if (sub.plan_type?.startsWith("creator")) return "creator";
    return "viewer";
  };

  const getUserPermissions = (role) => ({
    viewer: { max_files: 10, max_markers: 5, ai_analysis: false, lut_support: false, export_edl: true, advanced_markers: false },
    creator: { max_files: 100, max_markers: 50, ai_analysis: true, lut_support: true, export_edl: true, advanced_markers: true },
    pro: { max_files: -1, max_markers: -1, ai_analysis: true, lut_support: true, export_edl: true, advanced_markers: true },
  }[role] || { max_files: 10, max_markers: 5, ai_analysis: false, lut_support: false, export_edl: true, advanced_markers: false });

  // Load user + subscription once on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Fallback: if base44 SDK not loaded
        if (!base44?.auth?.me) {
          const stored = localStorage.getItem("user");
          if (stored) setUser(JSON.parse(stored));
          return;
        }

        const userData = await base44.auth.me();
        if (!userData) return;

        setUser(userData);

        // Load active subscription
        try {
          const subs = await base44.entities.Subscription.filter({
            user_email: userData.email,
            status: "active",
          });

          const activeSub = subs?.[0] || null;
          setSubscription(activeSub);

          const role = getUserRole(activeSub);
          setUserRole(role);
          setPermissions(getUserPermissions(role));
        } catch (err) {
          console.warn("Subscription load failed (normal during beta):", err);
        }
      } catch (err) {
        console.warn("Auth check failed:", err);
      }
    };

    loadUserData();
  }, [setUser]);

  // Plan badge logic
  const planBadge = subscription
    ? subscription.plan_type?.startsWith("pro")
      ? { label: "Pro", color: "bg-gradient-to-r from-amber-500 to-orange-500", crown: true }
      : { label: "Creator", color: "bg-gradient-to-r from-purple-500 to-pink-500", crown: true }
    : { label: "Free", color: "bg-gray-600", crown: false };

  const homeLink = createPageUrl("Landing");

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-purple-950">
      {/* Global Fonts */}
      <style jsx="true" global="true">{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Urbanist:wght@300;400;500;600;700;800;900&display=swap');
      `}</style>

      {/* Navigation */}
      <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to={homeLink}
              className="flex items-center gap-3 text-2xl font-bold text-white hover:text-[#D1B5A3] transition-all duration-300"
            >
              <Home className="w-7 h-7" />
              flippa
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {user ? (
                <>
                  {/* Creator Links */}
                  {user.user_type === "creator" && (
                    <>
                      <NavLink to={createPageUrl("FileRenamer")}>Upload</NavLink>
                      <NavLink to={createPageUrl("CreatorDashboard")}>Dashboard</NavLink>
                    </>
                  )}

                  {/* Player/Parent Links */}
                  {(user.user_type === "player" || user.user_type === "parent") && (
                    <>
                      <NavLink to={createPageUrl("Marketplace")}>Marketplace</NavLink>
                      <NavLink to={createPageUrl("MyPurchases")}>My Clips</NavLink>
                    </>
                  )}

                  <NavLink to={createPageUrl("Pricing")}>
                    Pricing
                    {!subscription && <span className="ml-1 animate-pulse">New</span>}
                  </NavLink>

                  {/* Admin Link */}
                  {user.role === "admin" && (
                    <NavLink to={createPageUrl("AdminRosterUpload")} className="text-red-400 font-bold">
                      Admin
                    </NavLink>
                  )}

                  {/* User Profile */}
                  <Link
                    to={createPageUrl("Account")}
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden lg:block truncate max-w-32">
                      {user.full_name || user.email.split("@")[0]}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 ${planBadge.color}`}>
                      {planBadge.crown && <Crown className="w-3 h-3" />}
                      {planBadge.label}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 font-medium flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to={createPageUrl("Pricing")}>Pricing</NavLink>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-2.5 bg-[#A88A86] hover:bg-[#d4a59a] text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    Login
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white p-2"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-xl">
            <div className="px-6 py-6 space-y-5">
              {user ? (
                <>
                  <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                    <User className="w-10 h-10 text-[#A88A86]" />
                    <div>
                      <div className="text-white font-bold">{user.full_name || user.email}</div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 mt-1 rounded-full text-xs font-bold text-white ${planBadge.color}`}>
                        {planBadge.crown && <Crown className="w-3 h-3" />}
                        {planBadge.label}
                      </div>
                    </div>
                  </div>

                  {user.user_type === "creator" && (
                    <>
                      <MobileNavLink to="FileRenamer" onClick={() => setMenuOpen(false)}>Upload Footage</MobileNavLink>
                      <MobileNavLink to="CreatorDashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileNavLink>
                    </>
                  )}

                  {(user.user_type === "player" || user.user_type === "parent") && (
                    <>
                      <MobileNavLink to="Marketplace" onClick={() => setMenuOpen(false)}>Browse Clips</MobileNavLink>
                      <MobileNavLink to="MyPurchases" onClick={() => setMenuOpen(false)}>My Purchases</MobileNavLink>
                    </>
                  )}

                  <MobileNavLink to="Pricing" onClick={() => setMenuOpen(false)}>Pricing</MobileNavLink>
                  <MobileNavLink to="Account" onClick={() => setMenuOpen(false)}>Account Settings</MobileNavLink>

                  {user.role === "admin" && (
                    <MobileNavLink to="AdminRosterUpload" onClick={() => setMenuOpen(false)} className="text-red-400 font-bold">
                      Admin Panel
                    </MobileNavLink>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-400 font-medium py-3 border-t border-white/10 mt-4 flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink to="Pricing" onClick={() => setMenuOpen(false)}>Pricing</MobileNavLink>
                  <button
                    onClick={() => {
                      navigate("/login");
                      setMenuOpen(false);
                    }}
                    className="w-full px-6 py-3 bg-[#A88A86] hover:bg-[#d4a59a] text-black font-bold rounded-xl transition-all"
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
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Flippa • Built for lacrosse creators and players
          </p>
          {permissions && (
            <p className="text-xs text-gray-500 mt-3">
              {userRole === "viewer" && "Free Plan • Upgrade for AI tools & unlimited uploads"}
              {userRole === "creator" && "Creator Plan • AI tagging, LUTs, and more"}
              {userRole === "pro" && "Pro Plan • Unlimited everything"}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}

// Reusable Nav Components
const NavLink = ({ to, children, className = "" }) => (
  <Link
    to={to}
    className={`text-gray-300 hover:text-white font-medium transition-colors duration-200 ${className}`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, children, onClick, className = "" }) => (
  <Link
    to={createPageUrl(to)}
    onClick={onClick}
    className={`block text-gray-300 hover:text-white font-medium py-2 transition-colors ${className}`}
  >
    {children}
  </Link>
);