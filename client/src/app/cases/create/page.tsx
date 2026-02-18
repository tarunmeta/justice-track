'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Hash, Link2, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/utils';
import toast from 'react-hot-toast';
import { LegalDisclaimer } from '@/components/legal-disclaimer';
import FileUpload from '@/components/file-upload';

/**
 * VERSION: DEFINITIVE_SENIOR_FIX_V5
 * - Uses modular FileUpload component.
 * - Standard <label> and <input id="..."> pattern (Safe naming).
 * - Explicit stopPropagation on input clicks.
 * - Cleaned layout following user's "Senior Engineer" advice.
 */
export default function CreateCasePage() {
    console.log("RENDERED: CreateCasePage [DEFINITIVE SENIOR FIX V5]");

    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', category: 'OTHER',
        location: '', referenceNumber: '', sourceUrl: '', groundStatus: '',
    });
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>('');
    const [supportingDocs, setSupportingDocs] = useState<FileList | null>(null);
    const [legalChecked, setLegalChecked] = useState(false);
    const [hydrated, setHydrated] = useState(false);

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
            return toast.error('At least one reference (FIR Number, Case Number, or News URL) is required');
        }
        if (!legalChecked) return toast.error('You must agree to the legal declaration');

        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
            if (mainImage) formData.append('mainImage', mainImage);
            if (supportingDocs) Array.from(supportingDocs).forEach((f) => formData.append('documents', f));

            await api.post('/cases', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Case submitted for review!');
            router.push('/cases');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    const handleInputClick = (e: React.MouseEvent) => {
        // Stop any bubbling that might trigger an invisible label or file input
        e.stopPropagation();
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pb-20">
            {/* DIAGNOSTIC BANNER */}
            <div className="bg-emerald-600 text-white text-[10px] py-1 text-center font-mono sticky top-16 z-[60]">
                ACTIVE VERSION: DEFINITIVE_SENIOR_FIX_V5
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Submit a Case</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Provide factual details and official references.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" onClick={(e) => e.stopPropagation()}>
                    {/* CASE DETAILS SECTION */}
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-6">
                        <div className="text-lg font-semibold border-b border-[var(--border)] pb-3 mb-2">Case Details</div>

                        <div>
                            <label htmlFor="field-case-title" className="block text-sm font-medium mb-1.5 cursor-pointer">Case Title *</label>
                            <input
                                id="field-case-title"
                                type="text"
                                className="input-field"
                                placeholder="Brief, factual case title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                onClick={handleInputClick}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="field-case-desc" className="block text-sm font-medium mb-1.5 cursor-pointer">Description *</label>
                            <textarea
                                id="field-case-desc"
                                className="textarea-field min-h-[160px]"
                                placeholder="Detailed factual description of the case..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                onClick={handleInputClick}
                                required
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="field-case-cat" className="block text-sm font-medium mb-1.5 cursor-pointer">Category *</label>
                                <select
                                    id="field-case-cat"
                                    className="input-field cursor-pointer"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    onClick={handleInputClick}
                                >
                                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="field-case-loc" className="block text-sm font-medium mb-1.5 cursor-pointer">Location *</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    <input
                                        id="field-case-loc"
                                        type="text"
                                        className="input-field pl-10"
                                        placeholder="City, State"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        onClick={handleInputClick}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* VERIFICATION REFERENCES SECTION */}
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-6">
                        <div className="text-lg font-semibold border-b border-[var(--border)] pb-3 mb-2">Verification References</div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="field-case-ref" className="block text-sm font-medium mb-1.5 cursor-pointer">FIR / Case ID</label>
                                <div className="relative">
                                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    <input
                                        id="field-case-ref"
                                        type="text"
                                        className="input-field pl-10"
                                        placeholder="e.g., FIR/123/2024"
                                        value={form.referenceNumber}
                                        onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                                        onClick={handleInputClick}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="field-case-url" className="block text-sm font-medium mb-1.5 cursor-pointer">News Source URL</label>
                                <div className="relative">
                                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    <input
                                        id="field-case-url"
                                        type="url"
                                        className="input-field pl-10"
                                        placeholder="https://..."
                                        value={form.sourceUrl}
                                        onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                                        onClick={handleInputClick}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MEDIA & EVIDENCE SECTION */}
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-6">
                        <div className="text-lg font-semibold border-b border-[var(--border)] pb-3 mb-2">Evidence & Media</div>

                        <div className="grid gap-8">
                            <FileUpload
                                label="Main Case Photo (Recommended)"
                                preview={mainImagePreview}
                                onSelect={(files) => {
                                    const file = files?.[0];
                                    if (file) {
                                        if (file.size > 5 * 1024 * 1024) return toast.error('Photo exceeds 5MB');
                                        setMainImage(file);
                                        setMainImagePreview(URL.createObjectURL(file));
                                    }
                                }}
                            />

                            <FileUpload
                                label="Supporting Documents (Optional)"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png"
                                placeholderIcon="file"
                                onSelect={(files) => setSupportingDocs(files)}
                            />
                        </div>
                    </div>

                    {/* LEGAL DISCLAIMER */}
                    <div className="pt-4" onClick={handleInputClick}>
                        <LegalDisclaimer
                            checked={legalChecked}
                            onCheckedChange={setLegalChecked}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 text-lg shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                        {loading ? 'Submitting Case...' : 'Submit Case Officialy'}
                    </button>
                </form>
            </div>
        </div>
    );
}
