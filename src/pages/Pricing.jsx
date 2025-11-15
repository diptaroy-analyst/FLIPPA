import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Check, Sparkles, Zap, Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [processingPlan, setProcessingPlan] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserAndSubscription();
  }, []);

  const loadUserAndSubscription = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const subs = await base44.entities.Subscription.filter({ 
        user_email: userData.email,
        status: 'active'
      });
      
      if (subs.length > 0) {
        setCurrentSubscription(subs[0]);
      }
    } catch (error) {
      console.log('User not logged in');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Free',
      price_monthly: 0,
      price_yearly: 0,
      type: 'free',
      icon: Sparkles,
      color: 'from-gray-500 to-slate-500',
      description: 'Perfect for players browsing clips',
      transactionFee: null,
      features: {
        max_files: 10,
        ai_analysis: false,
        lut_support: false,
        export_edl: true,
        priority_support: false
      },
      featureList: [
        '✓ Browse all game clips',
        '✓ Purchase highlights',
        '✓ Download your clips',
        '✓ Leave reviews',
        '✓ Free forever for players',
        '✗ No creator features'
      ]
    },
    {
      name: 'Creator',
      price_monthly: 0,
      price_yearly: 0,
      type: 'creator',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      description: 'For content creators who need more power',
      popular: true,
      betaFree: true,
      transactionFee: '15%',
      features: {
        max_files: 100,
        ai_analysis: true,
        lut_support: true,
        export_edl: true,
        priority_support: false
      },
      featureList: [
        'Up to 100 files per session',
        'AI-powered analysis',
        'LUT color grading',
        'EDL export',
        '15% transaction fee on sales',
        'Advanced trim & mark',
        'Email support'
      ]
    },
    {
      name: 'Pro',
      price_monthly: 0,
      price_yearly: 0,
      type: 'pro',
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
      description: 'For professional teams and studios',
      betaFree: true,
      transactionFee: '5%',
      features: {
        max_files: -1,
        ai_analysis: true,
        lut_support: true,
        export_edl: true,
        priority_support: true
      },
      featureList: [
        'Unlimited files',
        'AI-powered analysis',
        'Advanced LUT color grading',
        'EDL export',
        'Only 5% transaction fee on sales',
        'Batch processing',
        'Priority support',
        'Team collaboration (coming soon)'
      ]
    }
  ];

  const handleSubscribe = async (plan) => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    setProcessingPlan(plan.type);

    try {
      // Check if user already has a subscription
      const existingSubs = await base44.entities.Subscription.filter({
        user_email: user.email,
        status: 'active'
      });

      if (existingSubs.length > 0) {
        alert('You already have an active subscription!');
        setProcessingPlan(null);
        return;
      }

      // BETA MODE: Create free subscription directly
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 10); // Extended period for beta

      await base44.entities.Subscription.create({
        user_email: user.email,
        plan_type: plan.type === 'free' ? 'free' : `${plan.type}_monthly`,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: false,
        features: plan.features
      });

      alert('🎉 Beta access activated! Free during beta period!');
      
      // Refresh subscription data
      await loadUserAndSubscription();
      
      // Redirect based on user type
      if (user.user_type === 'creator') {
        navigate(createPageUrl('FileRenamer'));
      } else {
        navigate(createPageUrl('Marketplace'));
      }

    } catch (error) {
      console.error('Subscription error:', error);
      alert(`Failed to activate plan: ${error.message || 'Please try again.'}`);
    } finally {
      setProcessingPlan(null);
    }
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
      <style>{`
        @import url('https://api.fonts.coollabs.io/css2?family=Satoshi:wght@300;400;500;600;700&display=swap');
      `}</style>

      <div className="max-w-7xl mx-auto" style={{ fontFamily: 'Satoshi, sans-serif' }}>
        {/* BETA Banner */}
        <div className="mb-8 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-2 border-green-500/50 rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-green-400" />
            <h2 className="text-3xl font-bold text-white">🎉 BETA LAUNCH - ALL PLANS FREE!</h2>
            <Sparkles className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-xl text-green-300 mb-2">
            Be part of our beta testing phase and get <strong>free access</strong> to all creator features!
          </p>
          <p className="text-gray-300">
            Help us build the best platform for lacrosse content creators. Your feedback shapes the future!
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Free for players. <span className="text-green-400 font-bold">Beta testers get everything free!</span>
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Players can browse and purchase clips for free. Beta creators get full access at no cost.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentSubscription?.plan_type.startsWith(plan.type);
            const isProcessing = processingPlan === plan.type;
            const isFree = plan.type === 'free';

            return (
              <div
                key={plan.type}
                className={`relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border-2 transition-all hover:scale-105 ${
                  plan.popular 
                    ? 'border-[#A88A86] shadow-2xl shadow-[#A88A86]/20' 
                    : 'border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    CURRENT PLAN
                  </div>
                )}

                {plan.betaFree && !isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse">
                    FREE BETA ACCESS
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-green-400">FREE</span>
                  </div>
                  {plan.betaFree && (
                    <p className="text-sm text-green-300 mt-2 font-semibold">
                      ✨ Free during beta period
                    </p>
                  )}
                  {plan.transactionFee && (
                    <div className="mt-3 px-3 py-2 bg-[#A88A86]/20 rounded-lg border border-[#A88A86]/30">
                      <p className="text-[#A88A86] font-bold text-sm">
                        {plan.transactionFee} Transaction Fee
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan || isProcessing}
                  className={`w-full py-6 text-lg font-bold rounded-xl transition-all ${
                    isCurrentPlan
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                  }`}
                >
                  {isProcessing ? 'Activating...' : isCurrentPlan ? 'Current Plan' : 'Activate Free Beta'}
                </Button>

                <ul className="mt-8 space-y-4">
                  {plan.featureList.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      {feature.startsWith('✓') ? (
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : feature.startsWith('✗') ? (
                        <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm">{feature.replace(/^[✓✗]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="text-center text-gray-400 text-sm space-y-2">
          <p className="text-lg font-semibold text-white mb-4">Beta Testing FAQ</p>
          <p className="mb-2"><strong className="text-green-400">Q: How long is beta free?</strong><br/>A: All features are free during the beta testing period while we build and improve the platform!</p>
          <p className="mb-2"><strong className="text-green-400">Q: What happens after beta?</strong><br/>A: Beta users will get exclusive early-bird pricing when we launch officially.</p>
          <p className="mb-2"><strong className="text-green-400">Q: For players:</strong><br/>A: Completely free forever to browse, purchase, and download clips</p>
          <p>Your feedback during beta is invaluable. Help us build something amazing!</p>
        </div>
      </div>
    </div>
  );
}