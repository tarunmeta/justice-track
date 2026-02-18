'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, AlertTriangle, ImageIcon, FileText } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { CATEGORY_LABELS } from '@/lib/utils';
import toast from 'react-hot-toast';
import { LegalDisclaimer } from '@/components/legal-disclaimer';

/**
 * 🎯 FINAL PRODUCTION VERSION
 * - Particular Fix: Standard hidden file inputs
 * - No labels wrapping fields
 * - No Portals or Global listeners
 */
export default function CreateCasePage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'OTHER',
        location: '',
        referenceNumber: '',
        sourceUrl: '',
    });

    // Media State
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>('');
    const [supportingDocs, setSupportingDocs] = useState<FileList | null>(null);
    const [legalChecked, setLegalChecked] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    // Refs for hidden inputs (Particular Fix)
    const mainRef = useRef<HTMLInputElement>(null);
    const docsRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setHydrated(true);
    }, []);

    if (!hydrated) return null;

    if (!isAuthenticated) {
        return (
            <div className="max-w-lg mx-auto px-4 py-20 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                <h2 className="font-display text-2xl font-bold mb-2">Authentication Required</h2>
                <a href="/auth/login" className="btn-primary">Login to Continue</a>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.referenceNumber && !form.sourceUrl) {
            return toast.error('At least one reference (FIR/Case ID or News URL) is required');
        }
        if (!legalChecked) return toast.error('You must agree to the legal declaration');

        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
            if (mainImage) formData.append('mainImage', mainImage);
            if (supportingDocs) Array.from(supportingDocs).forEach((f) => formData.append('documents', f));

            await api.post('/cases', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Case submitted successfully!');
            router.push('/cases');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pb-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Submit a Case</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Provide factual details and official references for verification.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* CASE DETAILS */}
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-6 shadow-sm">
                        <div className="text-lg font-bold border-b border-[var(--border)] pb-3 mb-2">Step 1: Case Details</div>

                        <div>
                            <div className="text-sm font-semibold mb-2">Case Title *</div>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter a brief, factual title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <div className="text-sm font-semibold mb-2">Description *</div>
                            <textarea
                                className="textarea-field min-h-[160px]"
                                placeholder="Describe the incident in detail..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <div className="text-sm font-semibold mb-2">Category *</div>
                                <select
                                    className="input-field"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                >
                                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className="text-sm font-semibold mb-2">Location *</div>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        className="input-field pl-10"
                                        placeholder="City, State"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* REFERENCES */}
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-6 shadow-sm">
                        <div className="text-lg font-bold border-b border-[var(--border)] pb-3 mb-2">Step 2: Verification References</div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <div className="text-sm font-semibold mb-2">FIR Number / Case ID</div>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter official reference code"
                                    value={form.referenceNumber}
                                    onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <div className="text-sm font-semibold mb-2">News Link / URL</div>
                                <input
                                    type="url"
                                    className="input-field"
                                    placeholder="https://news-article.com/..."
                                    value={form.sourceUrl}
                                    onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* MEDIA UPLOAD */}
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-6 shadow-sm">
                        <div className="text-lg font-bold border-b border-[var(--border)] pb-3 mb-2">Step 3: Photo & Evidence</div>

                        <div className="space-y-4">
                            <div>
                                <div className="text-sm font-semibold mb-3">Main Cover Photo</div>
                                <button
                                    type="button"
                                    onClick={() => mainRef.current?.click()}
                                    className="w-full h-48 border-2 border-dashed rounded-xl flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/10 hover:bg-gray-100 dark:hover:bg-gray-800 transition overflow-hidden"
                                >
                                    {mainImagePreview ? (
                                        <img src={mainImagePreview} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <div className="text-center">
                                            <ImageIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500 font-medium">Click to Select Main Photo</span>
                                        </div>
                                    )}
                                </button>
                            </div>

                            <div>
                                <div className="text-sm font-semibold mb-3">Supporting Documents</div>
                                <button
                                    type="button"
                                    onClick={() => docsRef.current?.click()}
                                    className="w-full py-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/10 transition"
                                >
                                    <FileText className="w-5 h-5" />
                                    {supportingDocs ? `${supportingDocs.length} files selected` : "Select Supporting Documents"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <LegalDisclaimer checked={legalChecked} onCheckedChange={setLegalChecked} />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full py-5 text-xl tracking-wide shadow-xl shadow-blue-500/10">
                        {loading ? 'Processing Submission...' : 'SUBMIT CASE OFFICIALY'}
                    </button>
                </form>
            </div>

            {/* 🔥 PARTICULAR FIX: Standard Hidden Inputs (No Portals | No IDs) */}
            <input
                ref={mainRef}
                type="file"
                accept="image/*"
                hidden
                style={{ display: 'none' }}
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                        setMainImage(f);
                        setMainImagePreview(URL.createObjectURL(f));
                    }
                }}
            />
            <input
                ref={docsRef}
                type="file"
                multiple
                hidden
                style={{ display: 'none' }}
                onChange={(e) => setSupportingDocs(e.target.files)}
            />
        </div>
    );
}
