import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import BackgroundShapes from '../components/BackgroundShapes';
import * as api from '../lib/api';
import { Clock, DollarSign, ArrowUpDown, Filter } from 'lucide-react';


import toast from 'react-hot-toast';
import CategorySymbols from '../components/CategorySymbols';

interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  slots: string[];
  images?: string[]; // ✅ IMPORTANT
  provider: { id: string; fullName: string; email: string };
  location?: { coordinates: number[] };
  createdAt: string;
}

export default function HomePage({ navigate }: { navigate: (p: string) => void }) {
  const { isDark } = useTheme();
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await api.getAllServices();
      setServices(res.data);
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const filtered = services
    .filter(s => {
      const q = search.toLowerCase();
      const matchSearch =
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q);

      const matchCat =
        !categoryFilter ||
        s.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const categories = [...new Set(services.map(s => s.category))];
  return (
    <div className={`min-h-screen ${isDark ? 'bg-cyber-dark' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>



      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 relative">

        <BackgroundShapes />

        <div className="relative z-10">
          <Header
            onSearch={setSearch}
            searchValue={search}
            navigate={navigate}
            currentPath="/home"
          />

          <main className="max-w-7xl mx-auto px-6 py-6">

            {/* FILTER BAR */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
                ${isDark ? 'border-cyber-border text-gray-300 hover:border-neon-blue'
                    : 'border-gray-200 text-gray-600 hover:border-blue-400'}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Filter size={16} />
                Filters
              </motion.button>

              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm
              ${isDark ? 'border-cyber-border' : 'border-gray-200'}`}>
                <ArrowUpDown size={14} className={isDark ? 'text-neon-blue' : 'text-blue-500'} />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className={`bg-transparent outline-none text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
              </div>

              <span className={`ml-auto text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {filtered.length} service{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* CATEGORY FILTERS */}
            {showFilters && (
              <div className="mb-6 flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                    ${categoryFilter === cat
                        ? 'bg-neon-blue text-white'
                        : (isDark
                          ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* SERVICES GRID */}
            {loading ? (
              <div className="flex justify-center py-20">
                <motion.div
                  className="w-12 h-12 rounded-full border-2 border-neon-blue border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((service, i) => (
                  <motion.div
                    key={service.id}
                    className="glass-card rounded-2xl overflow-hidden cursor-pointer group hover:neon-glow-strong transition-all"
                    onClick={() => navigate(`/service/${service.id}`)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                  >
                    <div className="h-44 relative overflow-hidden">
                      {service.images && service.images.length > 0 ? (
                        <>
                          <img
                            src={service.images[0]}
                            alt={service.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/50" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neon-blue/10 to-neon-purple/10">
                          <CategorySymbols category={service.category} count={4} />
                        </div>
                      )}

                      <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-neon-blue text-white backdrop-blur-sm">
                        {service.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      <h3 className={`font-bold text-lg line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {service.title}
                      </h3>

                      <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {service.description || 'No description available'}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} className="text-neon-green" />
                          <span className={`font-bold ${isDark ? 'text-neon-green' : 'text-green-600'}`}>
                            ₹{service.price}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {service.slots.length} slots
                          </span>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                ))}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );

}
