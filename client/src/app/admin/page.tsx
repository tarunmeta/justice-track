'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, FileText, TrendingUp, Shield, PieChart, MapPin, Activity } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { CATEGORY_LABELS } from '@/lib/utils';

export default function AdminPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [analytics, setAnalytics] = useState<any>(null);
    const [users, setUsers] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const isAdmin = isAuthenticated && user?.role === 'ADMIN';

    useEffect(() => {
        if (!isAdmin) return;
        Promise.all([
            api.get('/analytics/dashboard'),
            api.get('/users/stats'),
        ])
            .then(([a, u]) => { setAnalytics(a.data); setUsers(u.data); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <div className="max-w-lg mx-auto px-4 py-20 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h2 className="font-display text-2xl font-bold mb-2">Admin Only</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>This page is restricted to administrators</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const o = analytics?.overview || {};

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Platform overview and analytics</p>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: FileText, label: 'Total Cases', value: o.totalCases || 0, color: '#1d4ed8', bg: 'from-blue-500/10 to-blue-600/5' },
                        { icon: Users, label: 'Total Users', value: o.totalUsers || 0, color: '#7c3aed', bg: 'from-purple-500/10 to-purple-600/5' },
                        { icon: Activity, label: 'Pending Review', value: o.pendingCases || 0, color: '#d97706', bg: 'from-amber-500/10 to-amber-600/5' },
                        { icon: TrendingUp, label: 'Resolution Rate', value: o.resolutionRate || '0%', color: '#059669', bg: 'from-emerald-500/10 to-emerald-600/5' },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className={`card p-6 bg-gradient-to-br ${s.bg}`}>
                            <div className="flex items-center justify-between mb-3">
                                <s.icon className="w-5 h-5" style={{ color: s.color }} />
                            </div>
                            <p className="text-3xl font-bold font-display">{s.value}</p>
                            <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Cases by Category */}
                    <div className="card p-6">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <PieChart className="w-5 h-5" /> Cases by Category
                        </h3>
                        <div className="space-y-3">
                            {analytics?.byCategory?.map((cat: any, i: number) => {
                                const total = analytics.overview.totalCases || 1;
                                const pct = ((cat.count / total) * 100).toFixed(0);
                                const colors = ['#1d4ed8', '#7c3aed', '#059669', '#d97706', '#64748b'];
                                return (
                                    <div key={i}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-medium">{CATEGORY_LABELS[cat.category] || cat.category}</span>
                                            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{cat.count} ({pct}%)</span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                                            <div className="h-full rounded-full transition-all duration-500" style={{
                                                width: `${pct}%`, backgroundColor: colors[i % colors.length]
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                            {(!analytics?.byCategory || analytics.byCategory.length === 0) && (
                                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No data available</p>
                            )}
                        </div>
                    </div>

                    {/* Geographic Distribution */}
                    <div className="card p-6">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5" /> Geographic Distribution
                        </h3>
                        <div className="space-y-3">
                            {analytics?.byLocation?.map((loc: any, i: number) => {
                                const maxCount = analytics.byLocation[0]?.count || 1;
                                const pct = ((loc.count / maxCount) * 100).toFixed(0);
                                return (
                                    <div key={i}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-medium">{loc.location}</span>
                                            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{loc.count}</span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                                            <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                            {(!analytics?.byLocation || analytics.byLocation.length === 0) && (
                                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No data available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Supported Cases */}
                <div className="card p-6 mb-8">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" /> Most Supported Cases
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 font-medium" style={{ color: 'var(--text-muted)' }}>#</th>
                                    <th className="text-left py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Title</th>
                                    <th className="text-left py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Category</th>
                                    <th className="text-right py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Support</th>
                                    <th className="text-right py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Oppose</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics?.topSupported?.map((c: any, i: number) => (
                                    <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                        <td className="py-3 font-mono text-xs">{i + 1}</td>
                                        <td className="py-3 font-medium">{c.title.substring(0, 50)}...</td>
                                        <td className="py-3">{CATEGORY_LABELS[c.category]}</td>
                                        <td className="py-3 text-right text-emerald-600 font-semibold">{c.supportCount}</td>
                                        <td className="py-3 text-right text-red-500">{c.opposeCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* User Stats */}
                {users && (
                    <div className="card p-6">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5" /> User Statistics
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'Total', value: users.total, color: 'text-blue-600' },
                                { label: 'Verified', value: users.verified, color: 'text-emerald-600' },
                                { label: 'Pending', value: users.pending, color: 'text-amber-600' },
                                { label: 'Suspended', value: users.suspended, color: 'text-red-600' },
                            ].map((s, i) => (
                                <div key={i} className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                                    <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
