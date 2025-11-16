import React, { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (base44?.auth?.me) {
          const me = await base44.auth.me();
          if (mounted) setUser(me || null);
        } else {
          const stored = localStorage.getItem("user");
          if (stored && mounted) setUser(JSON.parse(stored));
        }
      } catch (e) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // IMPORTANT: Do NOT rely on SDK logout redirect here.
  // Clear local state/storage and let the app navigate client-side.
  const logout = async () => {
    try {
      // If you want to call SDK logout without redirect, only do so if it supports a non-redirect option.
      // Example (uncomment if supported): await base44.auth.logout({ redirect: false });
    } catch (e) {
      // ignore SDK errors
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);