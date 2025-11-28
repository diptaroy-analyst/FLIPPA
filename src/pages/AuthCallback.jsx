<<<<<<< HEAD
import React, { useEffect } from "react";
import { createPageUrl } from "@/utils";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  useEffect(() => {
    // Since we removed Google auth, just redirect to home
    // In the future when auth is re-added, handle the callback properly here
    setTimeout(() => {
      window.location.href = createPageUrl('Landing');
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4">
          <Loader2 className="w-16 h-16 text-[#A88A86] animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Redirecting...</h1>
        <p className="text-gray-400">Taking you to the app</p>
      </div>
    </div>
  );
=======
import React, { useEffect } from "react";
import { createPageUrl } from "@/utils";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  useEffect(() => {
    // Since we removed Google auth, just redirect to home
    // In the future when auth is re-added, handle the callback properly here
    setTimeout(() => {
      window.location.href = createPageUrl('Landing');
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4">
          <Loader2 className="w-16 h-16 text-[#A88A86] animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Redirecting...</h1>
        <p className="text-gray-400">Taking you to the app</p>
      </div>
    </div>
  );
>>>>>>> cd738166eff61c4e0c545c469221835d2734fe9e
}