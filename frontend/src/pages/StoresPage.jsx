import React, { useState, useEffect } from 'react';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { SkeletonListItem } from '../components/SkeletonLoaders';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map, List, Navigation, Phone, Clock, Landmark } from 'lucide-react';

// Custom Marker Creators using SVG DivIcons to ensure brand coloring works seamlessly
const createCustomIcon = (color, strokeColor = '#ffffff') => {
  return L.divIcon({
    html: `
      <div class="relative w-8 h-8 flex items-center justify-center filter drop-shadow-md">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="${color}" stroke="${strokeColor}" stroke-width="1.5"/>
          <circle cx="12" cy="9" r="3" fill="#ffffff"/>
        </svg>
      </div>
    `,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const purplePinIcon = createCustomIcon('#782B90');
const yellowPinIcon = createCustomIcon('#FFF200', '#782B90'); // yellow fill, purple stroke

// Helper Component to animate centering the map dynamically
const ChangeMapCenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map'); // 'map' or 'list'

  // Location / Geolocation states
  const [coords, setCoords] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [nearestStoreId, setNearestStoreId] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(5);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await client.get('/api/stores');
      setStores(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Unable to fetch store list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        
        try {
          const response = await client.get(`/api/stores/nearest?lat=${latitude}&lng=${longitude}`);
          if (response.data && response.data.length > 0) {
            setStores(response.data); // updates list sorted by distance
            const closest = response.data[0];
            setNearestStoreId(closest.id);
            
            // Re-center map to the nearest store
            setMapCenter([closest.lat, closest.lng]);
            setMapZoom(13); // close-up view
            
            toast.success(`Nearest store is ${closest.name}! 📍 (${closest.distance_km} km away)`);
          }
        } catch (err) {
          console.error(err);
          toast.error('Could not compute nearest store.');
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        setGeoLoading(false);
        console.warn('Geolocation blocked:', error);
        toast.error('Location permissions denied. Please enable them in your browser.');
      }
    );
  };



  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-10rem)] md:h-auto">
      
      {/* Header */}
      <div className="flex flex-col space-y-1 shrink-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">
              Store Locator
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Find operational Savomart branches, check operating hours, and plan paths.
            </p>
          </div>
          <button
            onClick={handleFindNearest}
            disabled={geoLoading}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-savomart-purple hover:bg-savomart-darkPurple text-white rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Navigation size={14} className={geoLoading ? 'animate-spin' : ''} />
            <span>{geoLoading ? 'Finding...' : 'Find Nearest Store'}</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-2xl shrink-0">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'map'
              ? 'bg-savomart-purple text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Map size={14} />
          <span>Map View</span>
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'list'
              ? 'bg-savomart-purple text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <List size={14} />
          <span>List View</span>
        </button>
      </div>

      {/* Main View Port */}
      <div className="flex-1 min-h-[350px] relative overflow-hidden bg-white border border-slate-100 rounded-3xl shadow-sm">
        {loading ? (
          <div className="h-full overflow-y-auto p-4 space-y-4">
            <SkeletonListItem />
            <SkeletonListItem />
            <SkeletonListItem />
            <SkeletonListItem />
            <SkeletonListItem />
          </div>
        ) : activeTab === 'map' ? (
          /* MAP VIEW */
          <div className="w-full h-full absolute inset-0 z-10">
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ChangeMapCenter center={mapCenter} zoom={mapZoom} />
              
              {stores.map((store) => {
                const isNearest = store.id === nearestStoreId;
                return (
                  <Marker
                    key={store.id}
                    position={[store.lat, store.lng]}
                    icon={isNearest ? yellowPinIcon : purplePinIcon}
                  >
                    <Popup className="rounded-xl overflow-hidden shadow-lg border border-slate-100">
                      <div className="p-2 space-y-2 font-sans">
                        <h4 className="font-bold text-sm text-savomart-purple flex items-center">
                          <Landmark size={14} className="mr-1" />
                          <span>{store.name}</span>
                          {isNearest && (
                            <span className="ml-2 bg-savomart-yellow text-slate-800 text-[8px] px-1.5 py-0.5 rounded font-extrabold tracking-wide uppercase">
                              Nearest
                            </span>
                          )}
                        </h4>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          {store.address}
                        </p>
                        <div className="flex flex-col space-y-1 text-[10px] text-slate-400 font-medium">
                          <span className="flex items-center">
                            <Clock size={11} className="mr-1.5 text-slate-300" />
                            <span>{store.hours}</span>
                          </span>
                          <span className="flex items-center">
                            <Phone size={11} className="mr-1.5 text-slate-300" />
                            <span>{store.phone}</span>
                          </span>
                          {store.distance_km && (
                            <span className="flex items-center text-savomart-purple font-semibold">
                              <Navigation size={11} className="mr-1.5" />
                              <span>Distance: {store.distance_km} km</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        ) : (
          /* LIST VIEW */
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {stores.map((store) => {
              const isNearest = store.id === nearestStoreId;
              return (
                <div
                  key={store.id}
                  className={`bg-white border rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md ${
                    isNearest 
                      ? 'border-savomart-yellow bg-savomart-yellow/5' 
                      : 'border-slate-100'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-slate-800">
                        {store.name}
                      </h3>
                      {isNearest && (
                        <span className="bg-savomart-yellow text-slate-800 text-[8px] px-2 py-0.5 rounded-full font-extrabold tracking-wide uppercase">
                          Nearest Branch
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                      {store.address}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1 text-slate-300" />
                        <span>{store.hours}</span>
                      </span>
                      <span className="flex items-center">
                        <Phone size={12} className="mr-1 text-slate-300" />
                        <span>{store.phone}</span>
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {store.distance_km !== undefined ? (
                      <span className="text-sm font-black text-savomart-purple flex items-center">
                        <Navigation size={14} className="mr-1" />
                        <span>{store.distance_km} km</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300">Distance unknown</span>
                    )}
                    <button
                      onClick={() => {
                        setActiveTab('map');
                        setMapCenter([store.lat, store.lng]);
                        setMapZoom(14);
                      }}
                      className="px-3.5 py-1.5 bg-savomart-purple/5 hover:bg-savomart-purple text-savomart-purple hover:text-white rounded-lg text-xs font-bold transition-all border border-savomart-purple/10"
                    >
                      Show on Map
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default StoresPage;
