import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, LogOut, Loader2, Trophy } from 'lucide-react';

const getTierInfo = (points) => {
  if (points <= 500) {
    return { name: 'Silver', emoji: '🥉', color: 'text-slate-500', percentage: Math.min(100, Math.round((points / 500) * 100)), nextTier: 'Gold', pointsNeeded: 501 - points };
  } else if (points <= 2000) {
    return { name: 'Gold', emoji: '🥈', color: 'text-amber-500', percentage: Math.min(100, Math.round(((points - 500) / 1500) * 100)), nextTier: 'Platinum', pointsNeeded: 2001 - points };
  } else {
    return { name: 'Platinum', emoji: '🥇', color: 'text-purple-600', percentage: 100, nextTier: null, pointsNeeded: 0 };
  }
};

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Pre-fill fields from user profile context
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name field cannot be left blank.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(name, email);
    } catch (err) {
      // errors handled by AuthContext
    } finally {
      setIsSaving(false);
    }
  };

  // Extract initials for the avatar
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">
          My Profile
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Manage your personal credentials, check tier levels, and verify registration numbers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Profile Card (1/3 width) */}
        <div className="md:col-span-1 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-center space-y-5">
          {/* Avatar Icon */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center rounded-full bg-savomart-purple text-white font-black text-3xl shadow-md border-4 border-slate-100">
            {getInitials(user?.name)}
            {/* Sparkle badge */}
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-savomart-yellow border-2 border-white rounded-full flex items-center justify-center text-slate-700 shadow animate-pulse">
              <Trophy size={14} className="text-savomart-purple" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-800 leading-tight">
              {user?.name || 'Customer'}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Loyalty Cardholder
            </span>
          </div>

          {/* Points summary bubble */}
          {(() => {
            const tier = getTierInfo(user?.points_balance || 0);
            return (
              <div className="bg-savomart-purple/5 border border-savomart-purple/10 rounded-2xl p-4 space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">Club Balance</span>
                    <span className="text-xl font-black text-savomart-purple">{(user?.points_balance || 0).toLocaleString('en-IN')} PTS</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">Tier Status</span>
                    <span className={`text-xs font-bold ${tier.color}`}>{tier.name} Shopper {tier.emoji}</span>
                  </div>
                </div>
                {/* Tier progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>{tier.nextTier ? `Progress to ${tier.nextTier} ${tier.emoji}` : 'Max Tier Reached 🏆'}</span>
                    <span className="font-bold text-slate-600">{tier.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-savomart-purple h-full rounded-full transition-all duration-700"
                      style={{ width: `${tier.percentage}%` }}
                    />
                  </div>
                  {tier.nextTier && (
                    <p className="text-[9px] text-slate-400">{tier.pointsNeeded} pts needed for {tier.nextTier}</p>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center space-x-2 py-3 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition-all active:scale-[0.99]"
          >
            <LogOut size={14} />
            <span>Sign Out Account</span>
          </button>
        </div>

        {/* Editable form card (2/3 width) */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 tracking-tight mb-6">
            Account Preferences
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            
            {/* Mobile number read-only */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Registered Mobile (Read-only)
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone size={14} />
                </div>
                <input
                  type="text"
                  disabled
                  value={user?.mobile_number || ''}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-100 rounded-xl text-slate-500 text-xs focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={14} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arjun Kumar"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-savomart-purple focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={14} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arjun@gmail.com"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-savomart-purple focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-3 bg-savomart-purple hover:bg-savomart-darkPurple text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Update Credentials</span>
              )}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
