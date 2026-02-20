import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import CategorySymbols from '../components/CategorySymbols';
import BackgroundShapes from '../components/BackgroundShapes';
import * as api from '../lib/api';
import {
  ArrowLeft,
  DollarSign,
  Clock,
  User,
  Mail,
  Phone,   // ✅ ADD THIS
  MapPin,
  Loader2,
  Check
} from 'lucide-react';

import toast from 'react-hot-toast';

interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  slots: string[];
  images?: string[];
  provider: {
    id: string;
    fullName: string;
    email: string;
    mobile?: string;
    role: string
  };

  location?: { coordinates: number[] };
}

interface ProviderService {
  id: string;
  title: string;
  category: string;
  price: number;
}

export default function ServiceDetailPage({
  serviceId,
  navigate
}: {
  serviceId: string;
  navigate: (p: string) => void;
}) {
  const { isDark } = useTheme();
  const { user } = useAuth();

  /* ===========================
     ALL HOOKS MUST BE HERE
  ============================ */

  const [service, setService] = useState<Service | null>(null);
  const [otherServices, setOtherServices] = useState<ProviderService[]>([]);
  const [providerCategories, setProviderCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [customerLocation, setCustomerLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  /* ===========================
     LOAD SERVICE
  ============================ */

  useEffect(() => {
    loadService();
  }, [serviceId]);

  /* ===========================
     GET CUSTOMER LOCATION
  ============================ */

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomerLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => {
        console.log("Location permission denied");
      }
    );
  }, []);

  const loadService = async () => {
    try {
      const res = await api.getServiceById(serviceId);
      const serviceData: Service = res.data.service;
      setService(serviceData);

      // If provider, fetch their categories
      if (user?.role === "SERVICE_PROVIDER") {
        const allServices = await api.getAllServices();
        const myServices = allServices.data.filter(
          (s: any) => s.provider?.id === user.id
        );
        setProviderCategories(myServices.map((s: any) => s.category));
      }

      // Load other services by provider
      if (serviceData?.provider?.id) {
        const provRes = await api.getProviderProfile(
          serviceData.provider.id
        );
        const services: ProviderService[] =
          provRes.data.services || [];
        setOtherServices(
          services.filter((s) => s.id !== serviceId)
        );
      }
    } catch {
      toast.error("Failed to load service");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!selectedSlot) {
      toast.error("Select a time slot");
      return;
    }

    setRequesting(true);
    try {
      await api.createServiceRequest(serviceId, selectedSlot);
      toast.success("Service requested successfully!");
      setSelectedSlot('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to request service");
    } finally {
      setRequesting(false);
    }
  };

  /* ===========================
     CONDITIONAL RETURNS
  ============================ */

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-cyber-dark' : 'bg-white'}`}>
        <motion.div
          className="w-12 h-12 rounded-full border-2 border-neon-blue border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!service) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-cyber-dark' : 'bg-white'}`}>
        <Header navigate={navigate} currentPath="" />
        <div className="text-center py-20">
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Service not found
          </p>
        </div>
      </div>
    );
  }

  /* ===========================
     SAFE VALUES
  ============================ */

  const isOwnService = user?.id === service.provider?.id;

  const isProviderSameCategory =
    user?.role === "SERVICE_PROVIDER" &&
    providerCategories.includes(service.category);

  const providerLat = service.location?.coordinates?.[1];
  const providerLng = service.location?.coordinates?.[0];

  const directionsUrl =
    customerLocation && providerLat && providerLng
      ? `https://www.google.com/maps/dir/?api=1&origin=${customerLocation.lat},${customerLocation.lng}&destination=${providerLat},${providerLng}&travelmode=driving`
      : null;

  /* ===========================
     UI
  ============================ */

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cyber-dark' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <BackgroundShapes />
      <div className="relative z-10">
        <Header navigate={navigate} currentPath="" />

        <main className="max-w-5xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/home')}
            className={`flex items-center gap-1 mb-6 text-sm ${isDark ? 'text-neon-blue' : 'text-blue-600'}`}
          >
            <ArrowLeft size={16} /> Back to Services
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT SIDE */}
            <div className="lg:col-span-2 space-y-6">

              {/* HERO */}
              <motion.div
                className="glass-card rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {service.images && service.images.length > 0 ? (
                  <ServiceImageGallery images={service.images} />
                ) : (
                  <div className="h-64 relative overflow-hidden bg-gradient-to-br from-neon-blue/10 to-neon-purple/10">
                    <CategorySymbols category={service.category} count={8} />
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {service.title}
                  </h1>

                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-1">
                      <DollarSign size={18} className="text-neon-green" />
                      <span className="font-bold text-neon-green">
                        ₹{service.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {service.slots.length} slots
                      </span>
                    </div>
                  </div>

                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {service.description || "No description provided"}
                  </p>
                </div>
              </motion.div>

              {/* REQUEST SECTION */}
              {!isOwnService && user?.role !== "ADMIN" && (
                <motion.div
                  className="glass-card rounded-2xl p-6 space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Select Time Slot</h2>

                  <div className="flex flex-wrap gap-2">
                    {service.slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2 rounded-xl border transition-all ${selectedSlot === slot
                          ? "bg-neon-blue text-white border-neon-blue"
                          : isDark ? "border-gray-600 text-gray-300 hover:border-neon-blue" : "border-gray-300 text-gray-700 hover:border-blue-400"
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleRequest}
                    disabled={requesting || !selectedSlot || isProviderSameCategory}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white"
                  >
                    {requesting ? <Loader2 className="animate-spin" /> : "Request Service"}
                  </button>
                </motion.div>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="space-y-6">

              {/* PROVIDER CARD */}
              <motion.div
                className="glass-card rounded-2xl p-6 space-y-4"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Service Provider</h3>

                <div
                  onClick={() => navigate(`/providers/${service.provider.id}`)}
                  className="flex gap-4 cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                    <User size={22} className="text-white" />
                  </div>

                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {service.provider.fullName}
                    </p>

                    <div className={`flex items-center gap-2 text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Mail size={14} />
                      <span className="break-all">
                        {service.provider.email}
                      </span>
                    </div>

                    {service.provider.mobile && (
                      <div className={`flex items-center gap-2 text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <Phone size={14} />
                        <span>
                          {service.provider.mobile}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>

              {/* MAP CARD */}
              {providerLat && providerLng && (
                <motion.div
                  className="glass-card rounded-2xl p-6 space-y-4"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Location</h3>

                  <iframe
                    title="map"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.google.com/maps?q=${providerLat},${providerLng}&z=15&output=embed`}
                  />

                  {directionsUrl && (
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center py-2 rounded-xl bg-emerald-500 text-white"
                    >
                      View Route in Google Maps
                    </a>
                  )}
                </motion.div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

/* ===========================
   SERVICE IMAGE GALLERY
   Shows images with prev/next arrows.
   Falls back to gradient if all images fail to load.
============================ */
function ServiceImageGallery({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());

  const validImages = images.filter((_, i) => !failedIndexes.has(i));

  const prev = () => setCurrent(c => (c - 1 + validImages.length) % validImages.length);
  const next = () => setCurrent(c => (c + 1) % validImages.length);

  if (validImages.length === 0) {
    return (
      <div className="h-64 w-full bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 flex items-center justify-center">
        <span className="text-gray-400 text-sm">No images available</span>
      </div>
    );
  }

  // Keep current index in bounds after a failed image is removed
  const safeIndex = Math.min(current, validImages.length - 1);

  return (
    <div className="relative h-64 w-full group select-none">
      <img
        key={validImages[safeIndex]}
        src={validImages[safeIndex]}
        alt={`Service image ${safeIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
        onError={() => {
          // Find original index of this url and mark it failed
          const originalIdx = images.indexOf(validImages[safeIndex]);
          setFailedIndexes(prev => new Set([...prev, originalIdx]));
        }}
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Prev / Next arrows — only show when multiple images */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
            aria-label="Next image"
          >
            ›
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {validImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === safeIndex ? 'bg-white w-4' : 'bg-white/50'
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Image counter badge */}
      {validImages.length > 1 && (
        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs text-white bg-black/50 z-10">
          {safeIndex + 1} / {validImages.length}
        </span>
      )}
    </div>
  );
}
