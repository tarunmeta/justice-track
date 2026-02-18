'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scale, Shield, Users, TrendingUp, ArrowRight, Search, ChevronRight, ThumbsUp, MapPin, Clock } from 'lucide-react';
import api from '@/lib/api';
import { STATUS_LABELS, CATEGORY_LABELS, CATEGORY_ICONS, timeAgo } from '@/lib/utils';

export default function HomePage() {
    const [trending, setTrending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/cases/trending?limit=6')
            .then((r) => setTrending(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-500/5" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 badge-blue mb-6 px-4 py-1.5 text-sm">
                            <Shield className="w-3.5 h-3.5" /> Verified Cases Only
                        </div>
                        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                            Transparent Legal{' '}
                            <span className="gradient-text">Tracking</span> for{' '}
                            <span className="gradient-text">Public Accountability</span>
                        </h1>
                        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            Track verified legal cases with official FIR numbers, court case references, and verified news sources.
                            No unverified accusations — only documented facts.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/cases" className="btn-primary text-base px-8 py-3.5">
                                Browse Cases <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link href="/auth/register" className="btn-secondary text-base px-8 py-3.5">
                                Join as Contributor
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {[
                        { icon: Scale, label: 'Verified Cases', value: '1,200+', color: '#1d4ed8' },
                        { icon: Users, label: 'Active Users', value: '5,400+', color: '#7c3aed' },
                        { icon: Shield, label: 'Expert Lawyers', value: '120+', color: '#059669' },
                        { icon: TrendingUp, label: 'Cases Resolved', value: '340+', color: '#d97706' },
                    ].map((s, i) => (
                        <div key={i} className="stat-card group">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-1" style={{ background: `${s.color}15` }}>
                                <s.icon className="w-5 h-5" style={{ color: s.color }} />
                            </div>
                            <p className="text-2xl font-bold font-display">{s.value}</p>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* How It Works */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
                <div className="text-center mb-12">
                    <h2 className="font-display text-3xl font-bold mb-3">How JusticeTrack Works</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Ensuring accountability through verified, transparent legal tracking</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            step: '01',
                            title: 'Submit with Official Reference',
                            desc: 'Every case must include an FIR number, court case number, or verified news URL. No unverified accusations allowed.',
                            gradient: 'from-blue-500 to-cyan-500',
                        },
                        {
                            step: '02',
                            title: 'Moderation & Verification',
                            desc: 'Our moderation team reviews every submission. Cases are verified with official records before becoming public.',
                            gradient: 'from-violet-500 to-purple-500',
                        },
                        {
                            step: '03',
                            title: 'Track & Engage',
                            desc: 'Follow case progress through transparent timelines. Support cases, read legal expert insights, and stay informed.',
                            gradient: 'from-emerald-500 to-teal-500',
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.15 }}
                            className="card p-6 group hover:shadow-lg"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white font-bold text-sm mb-4`}>
                                {item.step}
                            </div>
                            <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Trending Cases */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="font-display text-3xl font-bold">Trending Cases</h2>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Most supported verified cases</p>
                    </div>
                    <Link href="/cases" className="btn-secondary text-sm">
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card p-5 animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : trending.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {trending.map((c, i) => (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link href={`/cases/${c.id}`} className="card p-5 block group hover:shadow-lg transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className={STATUS_LABELS[c.status]?.color || 'badge-gray'}>
                                            {STATUS_LABELS[c.status]?.label || c.status}
                                        </span>
                                        <span className="text-lg">{CATEGORY_ICONS[c.category]}</span>
                                    </div>
                                    <h3 className="font-semibold text-sm leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {c.title}
                                    </h3>
                                    <p className="text-xs mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                        {c.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                                        <span className="flex items-center gap-1">
                                            <ThumbsUp className="w-3 h-3" /> {c.supportCount}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {c.location}
                                        </span>
                                        <span className="flex items-center gap-1 ml-auto">
                                            <Clock className="w-3 h-3" /> {timeAgo(c.createdAt)}
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="card p-12 text-center">
                        <Scale className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                        <p className="font-medium mb-2">No cases yet</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Be the first to submit a verified case</p>
                    </div>
                )}
            </section>
        </div>
    );
}
