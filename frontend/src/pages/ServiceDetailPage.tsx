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
  provider: {
    id: string;
    fullName: string;
    email: string;
    mobile?: string;   // ✅ ADD THIS
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
                <div className="h-48 relative overflow-hidden bg-gradient-to-br from-neon-blue/10 to-neon-purple/10">
                  <CategorySymbols category={service.category} count={8} />
                </div>

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
                      <Clock size={16} />
                      <span className="text-sm">
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
                  <h2 className="font-bold">Select Time Slot</h2>

                  <div className="flex flex-wrap gap-2">
                    {service.slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2 rounded-xl border ${selectedSlot === slot
                          ? "bg-neon-blue text-white"
                          : "border-gray-300"
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
                <h3 className="font-bold">Service Provider</h3>

                <div
                  onClick={() => navigate(`/providers/${service.provider.id}`)}
                  className="flex gap-4 cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                    <User size={22} className="text-white" />
                  </div>

                  <div>
                    <p className="font-semibold">
                      {service.provider.fullName}
                    </p>

                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Mail size={14} />
                      <span className="break-all">
                        {service.provider.email}
                      </span>
                    </div>

                    {service.provider.mobile && (
                      <div className="flex items-center gap-2 text-sm mt-1">
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
                  <h3 className="font-bold">Location</h3>

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
