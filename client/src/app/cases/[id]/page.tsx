'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MapPin, Clock, FileText, ExternalLink, Shield, Scale, User, CheckCircle, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { STATUS_LABELS, CATEGORY_LABELS, CATEGORY_ICONS, formatDate, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

const UPDATE_TYPE_ICONS: Record<string, string> = {
    SUBMISSION: '📝', REVIEW: '🔍', VERIFICATION: '✅', HEARING: '🏛️',
    RESOLUTION: '⚖️', STATUS_CHANGE: '🔄', GENERAL: '📋',
};

export default function CaseDetailPage() {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuthStore();
    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userVote, setUserVote] = useState<string | null>(null);
    const [voting, setVoting] = useState(false);

    useEffect(() => {
        if (!id) return;
        api.get(`/cases/${id}`)
            .then((r) => setCaseData(r.data))
            .catch(() => toast.error('Failed to load case'))
            .finally(() => setLoading(false));

        if (isAuthenticated) {
            api.get(`/votes/${id}`).then((r) => setUserVote(r.data.vote)).catch(() => { });
        }
    }, [id, isAuthenticated]);

    const handleVote = async (type: 'SUPPORT' | 'OPPOSE') => {
        if (!isAuthenticated) return toast.error('Please login to vote');
        setVoting(true);
        try {
            if (userVote === type) {
                // Toggle off
                await api.delete(`/votes/${id}`);
                setUserVote(null);
                setCaseData((prev: any) => ({
                    ...prev,
                    supportCount: prev.supportCount - (type === 'SUPPORT' ? 1 : 0),
                    opposeCount: prev.opposeCount - (type === 'OPPOSE' ? 1 : 0),
                }));
                toast.success('Vote removed');
            } else {
                // Add or change vote
                await api.post(`/votes/${id}`, { voteType: type });
                const oldVote = userVote;
                setUserVote(type);
                setCaseData((prev: any) => ({
                    ...prev,
                    supportCount: prev.supportCount + (type === 'SUPPORT' ? 1 : (oldVote === 'SUPPORT' ? -1 : 0)),
                    opposeCount: prev.opposeCount + (type === 'OPPOSE' ? 1 : (oldVote === 'OPPOSE' ? -1 : 0)),
                }));
                toast.success('Vote recorded');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to vote');
        } finally {
            setVoting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
            </div>
        );
    }

    if (!caseData) return <div className="text-center py-20">Case not found</div>;

    const c = caseData;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={STATUS_LABELS[c.status]?.color || 'badge-gray'}>
                            {STATUS_LABELS[c.status]?.label}
                        </span>
                        <span className="badge-gray">{CATEGORY_ICONS[c.category]} {CATEGORY_LABELS[c.category]}</span>
                        {c.verifiedBy && (
                            <span className="badge-green flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                        )}
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-3">{c.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1"><User className="w-4 h-4" /> {c.createdBy?.name}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {c.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatDate(c.createdAt)}</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <div className="card p-6">
                            <h2 className="font-semibold text-lg mb-3">Case Description</h2>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{c.description}</p>
                            {c.groundStatus && (
                                <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                    <h3 className="text-sm font-semibold mb-1 text-blue-700 dark:text-blue-300">Ground Status</h3>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.groundStatus}</p>
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="card p-6">
                            <h2 className="font-semibold text-lg mb-4">Case Timeline</h2>
                            <div className="space-y-0">
                                {c.updates?.map((u: any, i: number) => (
                                    <div key={u.id} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-gray-100 dark:bg-gray-800">
                                                {UPDATE_TYPE_ICONS[u.updateType] || '📋'}
                                            </div>
                                            {i < c.updates.length - 1 && <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 min-h-[24px]" />}
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-sm font-medium">{u.updateText}</p>
                                            <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                <span>{u.createdBy?.name}</span>
                                                <span>·</span>
                                                <span>{timeAgo(u.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lawyer Comments */}
                        {c.lawyerComments?.length > 0 && (
                            <div className="card p-6">
                                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Scale className="w-5 h-5" /> Legal Expert Insights
                                </h2>
                                <div className="space-y-4">
                                    {c.lawyerComments.map((lc: any) => (
                                        <div key={lc.id} className="p-4 rounded-lg border" style={{ background: 'var(--bg-secondary)' }}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                                    {lc.lawyer?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium">{lc.lawyer?.name}</span>
                                                    <span className="badge-green text-[10px] ml-2">Verified Lawyer</span>
                                                </div>
                                            </div>
                                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{lc.explanation}</p>
                                            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{timeAgo(lc.createdAt)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        {/* Voting */}
                        <div className="card p-5">
                            <h3 className="font-semibold mb-4">Support This Case</h3>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <button
                                    onClick={() => handleVote('SUPPORT')}
                                    disabled={voting}
                                    className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${userVote === 'SUPPORT' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-inner' : 'border-transparent hover:border-emerald-200'
                                        }`}
                                    style={{ background: userVote !== 'SUPPORT' ? 'var(--bg-secondary)' : undefined }}
                                >
                                    <ThumbsUp className={`w-6 h-6 transition-transform ${userVote === 'SUPPORT' ? 'text-emerald-600 scale-110' : 'text-gray-400 group-hover:text-emerald-500'}`} />
                                    <span className={`text-xl font-bold ${userVote === 'SUPPORT' ? 'text-emerald-700' : ''}`}>{c.supportCount}</span>
                                    <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: userVote === 'SUPPORT' ? 'var(--text-primary)' : 'var(--text-muted)' }}>Support</span>
                                </button>
                                <button
                                    onClick={() => handleVote('OPPOSE')}
                                    disabled={voting}
                                    className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${userVote === 'OPPOSE' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-inner' : 'border-transparent hover:border-red-200'
                                        }`}
                                    style={{ background: userVote !== 'OPPOSE' ? 'var(--bg-secondary)' : undefined }}
                                >
                                    <ThumbsDown className={`w-6 h-6 transition-transform ${userVote === 'OPPOSE' ? 'text-red-600 scale-110' : 'text-gray-400 group-hover:text-red-500'}`} />
                                    <span className={`text-xl font-bold ${userVote === 'OPPOSE' ? 'text-red-700' : ''}`}>{c.opposeCount}</span>
                                    <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: userVote === 'OPPOSE' ? 'var(--text-primary)' : 'var(--text-muted)' }}>Oppose</span>
                                </button>
                            </div>
                            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>One vote per user per case</p>
                        </div>

                        {/* Official References */}
                        <div className="card p-5">
                            <h3 className="font-semibold mb-3">Official References</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <FileText className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                                    <div>
                                        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Reference Number</p>
                                        <p className="font-mono font-medium">{c.referenceNumber}</p>
                                    </div>
                                </div>
                                {c.sourceUrl && (
                                    <div className="flex items-start gap-2">
                                        <ExternalLink className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                                        <div>
                                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Source URL</p>
                                            <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs break-all">
                                                {c.sourceUrl}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {c.documents?.length > 0 && (
                                    <div className="flex items-start gap-2">
                                        <FileText className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                                        <div>
                                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Documents</p>
                                            {c.documents.map((d: string, i: number) => (
                                                <a key={i} href={d} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline text-xs">
                                                    Document {i + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Case Info */}
                        <div className="card p-5">
                            <h3 className="font-semibold mb-3">Case Information</h3>
                            <div className="space-y-2 text-sm">
                                {c.verifiedBy && (
                                    <div className="flex justify-between">
                                        <span style={{ color: 'var(--text-muted)' }}>Verified By</span>
                                        <span className="font-medium">{c.verifiedBy.name}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--text-muted)' }}>Comments</span>
                                    <span className="font-medium">{c.lawyerComments?.length || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--text-muted)' }}>Updates</span>
                                    <span className="font-medium">{c.updates?.length || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Legal Disclaimer */}
                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-start gap-2">
                                <Shield className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                                    <strong>Legal Disclaimer:</strong> This case information is sourced from official records.
                                    JusticeTrack does not make allegations or declare guilt. All content is for informational purposes only.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
