<<<<<<< HEAD
import React, { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client"; // Your base44 API client

const AuthContext = createContext();

// Utility function to get JWT from localStorage
const getToken = () => localStorage.getItem("token");

// Utility function to set JWT to localStorage
const setToken = (token) => localStorage.setItem("token", token);

// Utility function to remove JWT from localStorage
const removeToken = () => localStorage.removeItem("token");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Check if the user is authenticated with base44 API
        if (base44?.auth?.me) {
          const me = await base44.auth.me();
          if (mounted) setUser(me || null);
        } else {
          const storedUser = localStorage.getItem("user");
          if (storedUser && mounted) setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const login = (userData, token) => {
    // Store token and user in localStorage
    setToken(token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Optional: call the SDK logout if supported
      // await base44.auth.logout({ redirect: false });
    } catch (e) {
      // Ignore SDK errors
    } finally {
      // Clear localStorage and reset user state
      removeToken();
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

=======
import React, { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client"; // Your base44 API client

const AuthContext = createContext();

// Utility function to get JWT from localStorage
const getToken = () => localStorage.getItem("token");

// Utility function to set JWT to localStorage
const setToken = (token) => localStorage.setItem("token", token);

// Utility function to remove JWT from localStorage
const removeToken = () => localStorage.removeItem("token");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Check if the user is authenticated with base44 API
        if (base44?.auth?.me) {
          const me = await base44.auth.me();
          if (mounted) setUser(me || null);
        } else {
          const storedUser = localStorage.getItem("user");
          if (storedUser && mounted) setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const login = (userData, token) => {
    // Store token and user in localStorage
    setToken(token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Optional: call the SDK logout if supported
      // await base44.auth.logout({ redirect: false });
    } catch (e) {
      // Ignore SDK errors
    } finally {
      // Clear localStorage and reset user state
      removeToken();
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

>>>>>>> cd738166eff61c4e0c545c469221835d2734fe9e
export const useAuth = () => useContext(AuthContext);