'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Flag, Eye, Clock, FileText, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { STATUS_LABELS, CATEGORY_LABELS, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ModeratePage() {
    const { user, isAuthenticated } = useAuthStore();
    const [cases, setCases] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'pending' | 'all' | 'logs'>('pending');
    const [actionLoading, setActionLoading] = useState('');

    const isAuthorized = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'MODERATOR');

    useEffect(() => {
        if (!isAuthorized) return;
        fetchData();
    }, [isAuthorized, tab]);

    const fetchData = () => {
        setLoading(true);
        if (tab === 'logs') {
            api.get('/moderation/logs').then((r) => setLogs(r.data.logs)).catch(() => { }).finally(() => setLoading(false));
        } else {
            const status = tab === 'pending' ? '&status=PENDING_REVIEW' : '';
            api.get(`/cases?page=1&limit=50${tab === 'pending' ? '&status=PENDING_REVIEW' : ''}`)
                .then((r) => setCases(r.data.cases))
                .catch(() => api.get('/cases/moderation/all').then((r) => setCases(r.data.cases)).catch(() => { }))
                .finally(() => setLoading(false));
        }
    };

    const handleAction = async (action: string, caseId: string) => {
        const reason = action === 'approve' ? '' : prompt('Enter reason:') || '';
        if (action !== 'approve' && !reason) return;
        setActionLoading(caseId);
        try {
            await api.post(`/moderation/cases/${caseId}/${action}`, { reason });
            toast.success(`Case ${action}ed successfully`);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading('');
        }
    };

    if (!isAuthorized) {
        return (
            <div className="max-w-lg mx-auto px-4 py-20 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h2 className="font-display text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Only moderators and admins can access this page</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold">Moderation Panel</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Review, approve, and manage submitted cases</p>
                    </div>
                    <span className="badge-blue">{user?.role}</span>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--bg-secondary)' }}>
                    {[
                        { key: 'pending', label: 'Pending Review', icon: Clock },
                        { key: 'all', label: 'All Cases', icon: FileText },
                        { key: 'logs', label: 'Moderation Logs', icon: Shield },
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white dark:bg-gray-800 shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            <t.icon className="w-4 h-4" /> {t.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card p-5 animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : tab === 'logs' ? (
                    <div className="space-y-2">
                        {logs.map((log) => (
                            <div key={log.id} className="card p-4 flex items-center justify-between">
                                <div>
                                    <span className="badge-gray text-xs mr-2">{log.actionType}</span>
                                    <span className="text-sm font-medium">{log.performedBy?.name}</span>
                                </div>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(log.createdAt)}</span>
                            </div>
                        ))}
                        {logs.length === 0 && <div className="card p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No moderation logs yet</div>}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cases.map((c) => (
                            <div key={c.id} className="card p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={STATUS_LABELS[c.status]?.color || 'badge-gray'}>
                                                {STATUS_LABELS[c.status]?.label}
                                            </span>
                                            <span className="badge-gray text-xs">{CATEGORY_LABELS[c.category]}</span>
                                        </div>
                                        <h3 className="font-semibold">{c.title}</h3>
                                        <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{c.description}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                            <span>Ref: {c.referenceNumber}</span>
                                            <span>By: {c.createdBy?.name || 'Unknown'}</span>
                                            <span>{timeAgo(c.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                {c.status === 'PENDING_REVIEW' && (
                                    <div className="flex gap-2 mt-3 pt-3 border-t">
                                        <button
                                            onClick={() => handleAction('approve', c.id)}
                                            disabled={actionLoading === c.id}
                                            className="btn-success text-xs py-1.5 px-3"
                                        >
                                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction('reject', c.id)}
                                            disabled={actionLoading === c.id}
                                            className="btn-danger text-xs py-1.5 px-3"
                                        >
                                            <XCircle className="w-3.5 h-3.5" /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction('flag', c.id)}
                                            disabled={actionLoading === c.id}
                                            className="btn-secondary text-xs py-1.5 px-3"
                                        >
                                            <Flag className="w-3.5 h-3.5" /> Flag
                                        </button>
                                        <a href={`/cases/${c.id}`} target="_blank" className="btn-secondary text-xs py-1.5 px-3 ml-auto">
                                            <Eye className="w-3.5 h-3.5" /> View
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                        {cases.length === 0 && (
                            <div className="card p-12 text-center">
                                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                                <h3 className="font-semibold text-lg">All Clear!</h3>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No cases pending review</p>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
