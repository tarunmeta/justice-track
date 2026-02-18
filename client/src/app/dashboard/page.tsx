'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Clock, ThumbsUp, Scale } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { STATUS_LABELS, CATEGORY_LABELS, timeAgo } from '@/lib/utils';

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (isAuthenticated) {
            api.get('/users/profile').then((r) => setProfile(r.data)).catch(() => { });
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="max-w-lg mx-auto px-4 py-20 text-center">
                <LayoutDashboard className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h2 className="font-display text-2xl font-bold mb-2">Login Required</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Sign in to access your dashboard</p>
                <Link href="/auth/login" className="btn-primary">Login</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold">Dashboard</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.name}</p>
                </div>

                {/* Profile Card */}
                <div className="card p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold" style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-display text-xl font-bold">{user?.name}</h2>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="badge-blue">{user?.role}</span>
                                <span className="badge-green">{user?.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <Link href="/cases/create" className="stat-card group hover:shadow-lg transition-all">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <h3 className="font-semibold">Submit New Case</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Report a verified incident</p>
                    </Link>
                    <Link href="/cases" className="stat-card group hover:shadow-lg transition-all">
                        <Scale className="w-6 h-6 text-emerald-600" />
                        <h3 className="font-semibold">Browse Cases</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>View all verified cases</p>
                    </Link>
                    <div className="stat-card">
                        <ThumbsUp className="w-6 h-6 text-amber-600" />
                        <h3 className="font-semibold">Your Activity</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Votes and submissions</p>
                    </div>
                </div>

                {/* Role-specific content */}
                {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
                    <div className="card p-6">
                        <h3 className="font-semibold text-lg mb-3">Administrative Actions</h3>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/moderate" className="btn-secondary">Moderation Panel</Link>
                            {user.role === 'ADMIN' && <Link href="/admin" className="btn-primary">Admin Dashboard</Link>}
                        </div>
                    </div>
                )}

                {user?.role === 'LAWYER' && (
                    <div className="card p-6">
                        <h3 className="font-semibold text-lg mb-3">Lawyer Actions</h3>
                        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                            As a verified lawyer, you can add legal explanations and insights to verified cases.
                        </p>
                        <Link href="/cases" className="btn-primary">Browse Cases to Comment</Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
