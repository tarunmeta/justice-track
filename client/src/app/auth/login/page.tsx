'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scale, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const setUser = useAuthStore((s) => s.setUser);
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', form);
            setUser(data.user, data.accessToken, data.refreshToken);
            toast.success(`Welcome back, ${data.user.name}!`);
            router.push('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-500/5" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md"
            >
                <div className="card p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1d4ed8, #06b6d4)' }}>
                            <Scale className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="font-display text-2xl font-bold">Welcome Back</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Sign in to your JusticeTrack account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    className="input-field pl-10"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    className="input-field pl-10 pr-10"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/register" className="text-blue-600 font-medium hover:underline">Register</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
