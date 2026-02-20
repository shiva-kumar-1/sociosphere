import { useEffect, useState } from 'react';
import * as api from '../lib/api';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

interface Provider {
    id: string;
    fullName: string;
    email: string;
    role: string;
    averageRating?: number;
    totalReviews?: number;
}

interface ProviderService {
    id: string;
    title: string;
    description?: string;
    category: string;
    price: number;
    averageRating?: number;
    totalReviews?: number;
}


interface Props {
    providerId: string;
    navigate: (path: string) => void;
}

export default function ProviderProfilePage({ providerId, navigate }: Props) {
    const [provider, setProvider] = useState<Provider | null>(null);
    const [services, setServices] = useState<ProviderService[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingService, setEditingService] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        price: '',
        slots: '',
        category: ''
    });
    const { user } = useAuth();

    useEffect(() => {
        loadProvider();
    }, [providerId]);

    const loadProvider = async () => {
        try {
            const res = await api.getProviderProfile(providerId);
            setProvider(res.data.provider);
            setServices(res.data.services || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    if (!provider) return <div>Provider not found</div>;

    return (
        <div className="min-h-screen">
            <Header navigate={navigate} currentPath="" />

            <div className="max-w-5xl mx-auto px-4 py-6">
                <button
                    onClick={() => navigate('/home')}
                    className="mb-4 text-blue-500"
                >
                    Back
                </button>

                <h1 className="text-3xl font-bold">{provider.fullName}</h1>
                <p>{provider.email}</p>

                <div className="mt-4">
                    <p>Rating: {provider.averageRating ?? 0}</p>
                    <p>Total Reviews: {provider.totalReviews ?? 0}</p>
                </div>

                <h2 className="mt-8 font-bold text-2xl">Services</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {services.map((s) => (
                        <div
                            key={s.id}
                            className="glass-card rounded-2xl p-6 hover:neon-glow transition-all relative"
                        >
                            <div onClick={() => navigate(`/service/${s.id}`)} className="cursor-pointer">
                                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>

                                <p className="text-gray-400 text-sm mb-3">
                                    {s.description || "No description provided"}
                                </p>

                                <div className="flex items-center justify-between">
                                    <span className="text-green-400 font-bold text-lg">
                                        ₹{s.price}
                                    </span>

                                    <div className="text-sm text-gray-400">
                                        ⭐ {s.averageRating ?? 0} ({s.totalReviews ?? 0} reviews)
                                    </div>
                                </div>
                            </div>

                            {/* ✅ EDIT BUTTON (ONLY OWNER) */}
                            {user?.role === "SERVICE_PROVIDER" && user?.id === provider.id && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingService(s);
                                        setEditForm({
                                            title: s.title,
                                            description: s.description || '',
                                            price: String(s.price),
                                            slots: '',
                                            category: s.category
                                        });
                                    }}
                                    className="absolute top-4 right-4 text-sm text-neon-blue hover:underline"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {editingService && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-cyber-dark p-6 rounded-xl w-full max-w-md space-y-4">
                            <h3 className="text-lg font-semibold text-white">Edit Service</h3>

                            <input
                                value={editForm.title}
                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                placeholder="Title"
                                className="w-full p-2 rounded bg-white/10 text-white"
                            />

                            <input
                                value={editForm.description}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                placeholder="Description"
                                className="w-full p-2 rounded bg-white/10 text-white"
                            />

                            <input
                                value={editForm.price}
                                onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                placeholder="Price"
                                type="number"
                                className="w-full p-2 rounded bg-white/10 text-white"
                            />

                            <input
                                value={editForm.category}
                                onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                placeholder="Category"
                                className="w-full p-2 rounded bg-white/10 text-white"
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setEditingService(null)}
                                    className="px-4 py-2 text-gray-300"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={async () => {
                                        try {
                                            await api.updateService(editingService.id, {
                                                ...editForm,
                                                price: Number(editForm.price)
                                            });

                                            setEditingService(null);
                                            loadProvider();
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                    className="bg-neon-blue text-white px-4 py-2 rounded"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
