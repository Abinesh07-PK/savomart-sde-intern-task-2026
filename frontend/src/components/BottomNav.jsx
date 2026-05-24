import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Tag, MapPin, LifeBuoy, User } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Offers', path: '/offers', icon: Tag },
    { name: 'Stores', path: '/stores', icon: MapPin },
    { name: 'Support', path: '/support', icon: LifeBuoy },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg px-2 py-1 z-40 md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b md:shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-around md:justify-between md:px-6 h-14">
        {/* Desktop Branding */}
        <div 
          onClick={() => navigate('/')} 
          className="hidden md:flex items-center space-x-2 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-lg bg-savomart-purple flex items-center justify-center font-bold text-white shadow-md">
            S
          </div>
          <span className="text-xl font-bold font-sans tracking-tight text-savomart-purple">
            Savo<span className="text-amber-500 font-extrabold">mart</span>
          </span>
        </div>

        {/* Tab Items */}
        <div className="flex w-full md:w-auto items-center justify-around md:space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 px-3 py-1.5 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'text-savomart-purple font-semibold bg-savomart-purple/5'
                    : 'text-slate-500 hover:text-savomart-purple hover:bg-slate-50'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'stroke-[2.5] text-savomart-purple' : 'stroke-[2] text-slate-400 group-hover:text-savomart-purple'
                  }`} 
                />
                <span className={`text-[10px] md:text-sm tracking-wide ${isActive ? 'text-savomart-purple' : 'text-slate-500 group-hover:text-savomart-purple'}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
