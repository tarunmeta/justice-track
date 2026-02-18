'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, ThumbsUp, ThumbsDown, Clock, Scale, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { STATUS_LABELS, CATEGORY_LABELS, CATEGORY_ICONS, timeAgo } from '@/lib/utils';

export default function CasesPage() {
    const [cases, setCases] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const fetchCases = () => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), limit: '12' });
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        if (location) params.set('location', location);

        api.get(`/cases?${params}`)
            .then((r) => {
                setCases(r.data.cases);
                setTotal(r.data.total);
                setTotalPages(r.data.totalPages);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchCases(); }, [page, category]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchCases();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold">Verified Cases</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {total} cases tracked with official references
                </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="input-field pl-10 pr-4"
                        placeholder="Search cases by title, description, or reference..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
                <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary">
                    <Filter className="w-4 h-4" /> Filters
                    {(category || location) && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                </button>
            </div>

            {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card p-4 mb-6">
                    <div className="flex flex-wrap gap-3">
                        <div>
                            <label className="block text-xs font-medium mb-1">Category</label>
                            <select
                                className="input-field text-sm py-2"
                                value={category}
                                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                            >
                                <option value="">All Categories</option>
                                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">Location</label>
                            <input
                                type="text"
                                className="input-field text-sm py-2"
                                placeholder="e.g. Delhi"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                onBlur={fetchCases}
                            />
                        </div>
                        {(category || location) && (
                            <button onClick={() => { setCategory(''); setLocation(''); setPage(1); }} className="self-end btn-secondary text-xs py-2">
                                <X className="w-3 h-3" /> Clear
                            </button>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Cases Grid */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="card p-5 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : cases.length === 0 ? (
                <div className="card p-16 text-center">
                    <Scale className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <h3 className="font-semibold text-lg mb-2">No cases found</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {cases.map((c, i) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link href={`/cases/${c.id}`} className="card p-5 block group hover:shadow-lg transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <span className={STATUS_LABELS[c.status]?.color || 'badge-gray'}>
                                        {STATUS_LABELS[c.status]?.label || c.status}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {CATEGORY_ICONS[c.category]} {CATEGORY_LABELS[c.category]}
                                    </div>
                                </div>
                                <h3 className="font-semibold text-sm leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {c.title}
                                </h3>
                                <p className="text-xs mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                    {c.description}
                                </p>
                                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1 text-emerald-600">
                                            <ThumbsUp className="w-3 h-3" /> {c.supportCount}
                                        </span>
                                        <span className="flex items-center gap-1 text-red-500">
                                            <ThumbsDown className="w-3 h-3" /> {c.opposeCount}
                                        </span>
                                    </div>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {c.location}
                                    </span>
                                </div>
                                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                                    <span>{c.createdBy?.name}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(c.createdAt)}</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="btn-secondary py-2 px-3 disabled:opacity-40"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium px-4">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="btn-secondary py-2 px-3 disabled:opacity-40"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
