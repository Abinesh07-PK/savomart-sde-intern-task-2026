import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { Tag, MapPin, Calendar, X, Compass, HelpCircle, ChevronRight, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useCountdown from '../hooks/useCountdown';
import { SkeletonOfferCard } from '../components/SkeletonLoaders';

const OfferCard = ({ offer, onClick, isSaved, onToggleSave }) => {
  const timeLeft = useCountdown(offer.valid_until);
  const isExpired = timeLeft === 'Expired';

  return (
    <div
      onClick={() => onClick(offer)}
      className="bg-white rounded-3xl border-2 border-slate-100 hover:border-savomart-yellow shadow-sm hover:shadow-lg overflow-hidden flex flex-col justify-between transition-all duration-300 cursor-pointer group"
    >
      <div className="relative">
        <div className="h-44 bg-slate-100">
          <img
            src={offer.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'}
            alt={offer.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Heart button */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
            className="absolute top-2 right-2 text-white bg-black/45 rounded-full p-1 hover:bg-black/70 transition"
          >
            <Heart size={20} className={isSaved ? 'fill-red-500 text-red-500' : ''} />
          </button>
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-sm text-slate-800 group-hover:text-savomart-purple transition-colors truncate">
            {offer.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {offer.description}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="border-t border-slate-50 pt-3 flex justify-between items-center text-[10px] text-slate-400">
          <span className={`flex items-center space-x-1 ${isExpired ? 'text-red-500 font-semibold' : ''}`}>
            <span>⏳</span>
            <span>{timeLeft}</span>
          </span>
          <span className="font-bold text-savomart-purple flex items-center group-hover:underline">
            View Deal <ChevronRight size={10} className="ml-0.5 mt-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedOffers, setSavedOffers] = useState(() => {
    const stored = localStorage.getItem('savedOffers');
    return stored ? JSON.parse(stored) : [];
  });

  const toggleSave = (offerId) => {
    setSavedOffers((prev) => {
      const exists = prev.includes(offerId);
      const newList = exists ? prev.filter((id) => id !== offerId) : [...prev, offerId];
      localStorage.setItem('savedOffers', JSON.stringify(newList));
      return newList;
    });
  };

  const isSaved = (offerId) => savedOffers.includes(offerId);

  // Extend filterMode to include 'saved'
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'near', 'saved'


  // Geolocation states
  const [geoAllowed, setGeoAllowed] = useState(null); // null, 'prompt', 'granted', 'denied'
  const [geoLoading, setGeoLoading] = useState(false);
  const [nearestStore, setNearestStore] = useState(null);

  // Modal active state
  const [selectedOffer, setSelectedOffer] = useState(null);

  const fetchOffers = async (storeId = null) => {
    try {
      setLoading(true);
      const url = storeId !== null ? `/api/offers?store_id=${storeId}` : '/api/offers';
      const response = await client.get(url);
      setOffers(response.data);
      setFilteredOffers(response.data);
    } catch (error) {
      console.error('Failed to load offers:', error);
      toast.error('Unable to fetch latest offers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Sync / apply filter rules based on filterMode
  useEffect(() => {
    if (filterMode === 'all') {
      setFilteredOffers(offers);
    } else if (filterMode === 'near' && nearestStore) {
      // Filter list to All Stores (store_id == null) OR matching closest store
      const nearOffers = offers.filter(
        (o) => o.store_id === null || o.store_id === nearestStore.id
      );
      setFilteredOffers(nearOffers);
    } else if (filterMode === 'saved') {
      const saved = offers.filter((o) => savedOffers.includes(o.id));
      setFilteredOffers(saved);
    }
  }, [filterMode, nearestStore, offers, savedOffers]);

  // Request browser geolocation coordinates
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      setGeoAllowed('denied');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGeoAllowed('granted');
        
        try {
          // Fetch nearest store
          const response = await client.get(`/api/stores/nearest?lat=${latitude}&lng=${longitude}`);
          if (response.data && response.data.length > 0) {
            const closest = response.data[0];
            setNearestStore(closest);
            toast.success(`Found nearest branch: ${closest.name} (${closest.distance_km} km away) 📍`);
          } else {
            toast.error('Could not determine nearest branch.');
          }
        } catch (err) {
          console.error(err);
          toast.error('Failed to communicate with store services.');
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        setGeoLoading(false);
        setGeoAllowed('denied');
        setFilterMode('all'); // force back to all
        console.warn('Geolocation access blocked:', error);
        toast.error('Location permission was denied. Try adding it in your browser settings.');
      }
    );
  };

  const handleToggleFilter = (mode) => {
    if (mode === 'near') {
      if (!nearestStore) {
        setFilterMode('near');
        handleRequestLocation();
      } else {
        setFilterMode('near');
      }
    } else {
      setFilterMode('all');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">
            Current Offers
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Unlock exclusive rewards, vouchers, and discounts across Savomart branches.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <SkeletonOfferCard />
          <SkeletonOfferCard />
          <SkeletonOfferCard />
          <SkeletonOfferCard />
          <SkeletonOfferCard />
          <SkeletonOfferCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">
          Current Offers
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Unlock exclusive rewards, vouchers, and discounts across Savomart branches.
        </p>
      </div>

      {/* Filter Toggle */}
      <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setFilterMode('all')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            filterMode === 'all'
              ? 'bg-savomart-purple text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Stores
        </button>
        <button
          onClick={() => setFilterMode('near')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center space-x-1.5 ${
            filterMode === 'near'
              ? 'bg-savomart-purple text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <MapPin size={14} className={filterMode === 'near' ? 'text-savomart-yellow' : ''} />
          <span>Near Me</span>
        </button>
        <button
          onClick={() => setFilterMode('saved')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center space-x-1.5 ${
            filterMode === 'saved'
              ? 'bg-savomart-purple text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Heart size={14} className={filterMode === 'saved' ? 'text-savomart-yellow' : ''} />
          <span>Saved</span>
        </button>
      </div>

      {/* Geolocation Prompt Box (if permission was denied or requested) */}
      {filterMode === 'near' && !nearestStore && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-savomart-yellow/20 rounded-full flex items-center justify-center mx-auto text-amber-700 animate-pulse">
            <Compass size={24} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-800">
              Location Services Required
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              We need your coordinates to identify the closest Savomart branch and filter store-specific discounts!
            </p>
          </div>
          <button
            onClick={handleRequestLocation}
            disabled={geoLoading}
            className="px-5 py-2.5 bg-savomart-purple hover:bg-savomart-darkPurple text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98]"
          >
            {geoLoading ? 'Acquiring location...' : 'Allow Location Access'}
          </button>
        </div>
      )}

      {/* Geolocated Filter Sub-header */}
      {filterMode === 'near' && nearestStore && (
        <div className="bg-purple-50 border border-savomart-purple/10 rounded-2xl p-4 flex justify-between items-center text-xs text-savomart-purple font-medium">
          <div className="flex items-center space-x-2">
            <MapPin size={16} className="text-savomart-purple shrink-0" />
            <span>
              Showing deals for <strong>{nearestStore.name}</strong> ({nearestStore.distance_km} km)
            </span>
          </div>
          <button 
            onClick={handleRequestLocation}
            className="text-[10px] font-bold underline text-savomart-purple hover:text-savomart-darkPurple"
          >
            Update
          </button>
        </div>
      )}

      {/* Offers Cards Grid */}
      {filteredOffers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            onClick={setSelectedOffer}
            isSaved={isSaved(offer.id)}
            onToggleSave={() => toggleSave(offer.id)}
          />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-3">
          <div className="text-4xl">🛒</div>
          <h3 className="text-sm font-bold text-slate-700">No active offers right now</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Check back soon! We update our catalog of deals weekly to offer you maximum value.
          </p>
        </div>
      )}

      {/* Details Modal Popup Drawer */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden relative animate-scale-up">
            
            {/* Image header */}
            <div className="h-52 bg-slate-100 relative">
              <img
                src={selectedOffer.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'}
                alt={selectedOffer.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedOffer(null)}
                className="absolute top-4 right-4 bg-black/45 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${
                  selectedOffer.store_id === null
                    ? 'bg-savomart-yellow text-slate-800'
                    : 'bg-savomart-purple text-white'
                }`}>
                  {selectedOffer.store_id === null ? 'All Savomart Branches' : 'Store-specific Deal'}
                </span>
                <h3 className="font-extrabold text-base text-slate-800 leading-tight">
                  {selectedOffer.title}
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedOffer.description}
              </p>

              <div className="border-t border-slate-100 pt-4 flex flex-col space-y-2 text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <Calendar size={14} className="text-slate-400 stroke-[2]" />
                  <span>Valid From: {new Date(selectedOffer.valid_from).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={14} className="text-slate-400 stroke-[2]" />
                  <span>Valid Until: {new Date(selectedOffer.valid_until).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOffer(null)}
                className="w-full mt-2 py-3 bg-savomart-purple hover:bg-savomart-darkPurple text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Dismiss Offer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OffersPage;
