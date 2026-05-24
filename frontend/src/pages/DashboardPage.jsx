import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gift, Clipboard, Check, ChevronRight, Tag, MapPin, LifeBuoy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import client from '../api/client';
import { SkeletonCard } from '../components/SkeletonLoaders';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Good Morning', emoji: '☀️' };
    if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', emoji: '🌞' };
    if (hour >= 17 && hour < 21) return { text: 'Good Evening', emoji: '🌇' };
    return { text: 'Good Night', emoji: '🌙' };
  };
  const greeting = getGreeting();
  
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const getTierInfo = (points) => {
    if (points <= 500) {
      return {
        name: 'Silver',
        emoji: '🥉',
        percentage: Math.min(100, Math.round((points / 500) * 100)),
        nextTier: 'Gold 🥈',
        pointsNeeded: 501 - points
      };
    } else if (points <= 2000) {
      return {
        name: 'Gold',
        emoji: '🥈',
        percentage: Math.min(100, Math.round(((points - 500) / 1500) * 100)),
        nextTier: 'Platinum 🥇',
        pointsNeeded: 2001 - points
      };
    } else {
      return {
        name: 'Platinum',
        emoji: '🥇',
        percentage: 100,
        nextTier: null,
        pointsNeeded: 0
      };
    }
  };

  const tierInfo = getTierInfo(user?.points_balance || 0);
  
  // Track clipboard state per coupon code to show dynamic checkmarks
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    if (!user) return;
    const target = user.points_balance || 0;
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;
    const start = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const currentVal = Math.round(start + (target - start) * progress);
      setAnimatedPoints(currentVal);
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedPoints(target);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [user?.points_balance]);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        const response = await client.get('/api/profile/points-history');
        setHistory(response.data);
      } catch (err) {
        console.error('Failed to load points history:', err);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied! ✂️`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  // Quick link cards definitions
  const quickLinks = [
    { title: 'Browse Offers', desc: 'Find exclusive local deals & weekly points boosts.', path: '/offers', color: 'bg-savomart-purple/10 text-savomart-purple border-savomart-purple/20', icon: Tag },
    { title: 'Find Stores', desc: 'Locate operational branches with maps & custom routing.', path: '/stores', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: MapPin },
    { title: 'Get Support', desc: 'Log support issues or ask AI for immediate assistance.', path: '/support', color: 'bg-slate-50 text-slate-700 border-slate-200', icon: LifeBuoy }
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">
          {greeting.text}, {user?.name?.split(' ')[0] || 'Shopper'}! {greeting.emoji}
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Check out your exclusive points balance and rewards below.
        </p>
      </div>

      {/* Premium Loyalty Points Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-savomart-purple via-savomart-darkPurple to-purple-950 text-white rounded-3xl p-6 shadow-xl border border-savomart-purple/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,242,0,0.15),transparent)] pointer-events-none"></div>
        {/* Abstract shape decoration */}
        <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-savomart-yellow/5 border-2 border-savomart-yellow/10"></div>
        
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-savomart-yellow uppercase">
              Loyalty Club Member
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-4xl font-black font-sans leading-none text-white tracking-tight">
                {animatedPoints.toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-semibold text-savomart-yellow">PTS</span>
            </div>
          </div>
          
          {/* Virtual Loyalty Card Icon */}
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
            <Gift size={22} className="text-savomart-yellow" />
          </div>
        </div>

        {/* Loyalty Tier Progress Bar */}
        <div className="mt-5 space-y-1.5 relative z-10">
          <div className="flex justify-between text-[10px] text-purple-200">
            <span>Progress to {tierInfo.nextTier ? tierInfo.nextTier : 'Max Tier 🏆'}</span>
            <span className="font-bold text-white">{tierInfo.percentage}%</span>
          </div>
          <div className="w-full bg-white/15 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/5">
            <div 
              className="bg-savomart-yellow h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${tierInfo.percentage}%` }}
            ></div>
          </div>
          {tierInfo.nextTier && (
            <p className="text-[9px] text-purple-300">
              Earn {tierInfo.pointsNeeded} more points to reach {tierInfo.nextTier}!
            </p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-purple-200">
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-purple-300">Registered Mobile</span>
            <span className="font-semibold text-white">{user?.mobile_number}</span>
          </div>
          <div className="text-right">
            <span className="block text-[9px] uppercase tracking-wider text-purple-300">Tier Status</span>
            <span className="font-semibold text-savomart-yellow">{tierInfo.name} Shopper {tierInfo.emoji}</span>
          </div>
        </div>
      </div>

      {/* Coupons Section */}
      <div className="space-y-3">
        <h2 className="text-md font-bold text-slate-800 tracking-tight flex items-center">
          <span>Your Coupons</span>
          <span className="ml-2 bg-savomart-purple/10 text-savomart-purple text-[10px] px-2 py-0.5 rounded-full font-bold">
            {user?.coupons?.length || 0} Available
          </span>
        </h2>
        
        {!user ? (
          <div className="flex space-x-4 overflow-x-auto pb-3 -mx-4 px-4 scroll-smooth">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : user.coupons && user.coupons.length > 0 ? (
          /* Horizontal Scroll Container */
          <div className="flex space-x-4 overflow-x-auto pb-3 -mx-4 px-4 scroll-smooth">
            {user.coupons.map((coupon) => (
              <div 
                key={coupon.id} 
                className="w-72 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between shrink-0 hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Visual coupon edge notches */}
                <div className="absolute top-1/2 -left-2 w-4 h-4 bg-slate-50 rounded-full border border-slate-100 translate-y-[-50%]"></div>
                <div className="absolute top-1/2 -right-2 w-4 h-4 bg-slate-50 rounded-full border border-slate-100 translate-y-[-50%]"></div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-savomart-purple/5 text-savomart-purple font-bold px-2 py-0.5 rounded-lg border border-savomart-purple/10">
                      {coupon.discount_type === 'flat' ? `Flat ₹${coupon.discount_value} OFF` : `${coupon.discount_value}% OFF`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Ends {new Date(coupon.valid_until).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 truncate">
                      {coupon.code}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {coupon.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">Apply at check-out</span>
                  <button
                    onClick={() => handleCopyCode(coupon.code)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-savomart-purple/5 hover:bg-savomart-purple text-savomart-purple hover:text-white rounded-lg text-xs font-semibold transition-all group-hover:bg-savomart-purple group-hover:text-white"
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check size={14} className="stroke-[2.5]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Clipboard size={14} className="stroke-[2.5]" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-2">
            <div className="text-3xl text-slate-300">🎟️</div>
            <h3 className="text-sm font-bold text-slate-700">No active coupons right now</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              You don't have any coupons yet. Keep shopping to earn rewards and unlock savings!
            </p>
          </div>
        )}
      </div>

      {/* Points History Timeline Section */}
      <div className="space-y-3">
        <h2 className="text-md font-bold text-slate-800 tracking-tight flex items-center justify-between">
          <span>Points History</span>
          <span className="text-[10px] text-slate-400 font-medium">Last 10 transactions</span>
        </h2>
        
        {historyLoading ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex justify-center items-center">
            <span className="text-xs text-slate-400">Loading history...</span>
          </div>
        ) : history.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
            {history.map((tx) => {
              const isEarn = tx.transaction_type === 'earn';
              return (
                <div key={tx.id} className="flex items-center justify-between pb-3 last:pb-0 border-b border-slate-50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isEarn ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {isEarn ? '↙' : '↗'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{tx.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold shrink-0 ${isEarn ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isEarn ? `+${tx.amount}` : `-${tx.amount}`} pts
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center space-y-1">
            <h3 className="text-xs font-bold text-slate-700">No transactions yet</h3>
            <p className="text-[10px] text-slate-400 font-medium">Your points activity will show up here.</p>
          </div>
        )}
      </div>

      {/* Quick Nav Cards */}
      <div className="space-y-3">
        <h2 className="text-md font-bold text-slate-800 tracking-tight">
          Explore Services
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <div 
                key={link.title}
                onClick={() => navigate(link.path)}
                className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${link.color}`}>
                    <Icon size={20} className="stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{link.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{link.desc}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 stroke-[2.5]" />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
