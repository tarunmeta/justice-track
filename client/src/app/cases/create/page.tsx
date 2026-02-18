'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, MapPin, Hash, Link2, AlertTriangle, ArrowRight, Camera, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { CATEGORY_LABELS } from '@/lib/utils';
import toast from 'react-hot-toast';
import { LegalDisclaimer } from '@/components/legal-disclaimer';

/**
 * VERSION: INTERACTIVITY_TOTAL_ISOLATION_V3
 * This version removes all 'label' tags and 'htmlFor' attributes to prevent
 * any potential browser-level click redirection to hidden file inputs.
 */
export default function CreateCasePage() {
    console.log("RENDERED: CreateCasePage [TOTAL ISOLATION V3]");

    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', category: 'OTHER',
        location: '', referenceNumber: '', sourceUrl: '', groundStatus: '',
    });
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>('');
    const [files, setFiles] = useState<FileList | null>(null);
    const [legalChecked, setLegalChecked] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const mainImageRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (isAuthenticated || !savedUser) {
            setHydrated(true);
        } else {
            const timer = setTimeout(() => setHydrated(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated]);

    if (!hydrated) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="max-w-lg mx-auto px-4 py-20 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                <h2 className="font-display text-2xl font-bold mb-2">Authentication Required</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>You must be logged in to submit a case</p>
                <a href="/auth/login" className="btn-primary">Login to Continue</a>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.referenceNumber && !form.sourceUrl) {
            return toast.error('At least one reference (FIR Number, Case Number, or News URL) is required');
        }
        if (!legalChecked) {
            return toast.error('You must agree to the legal declaration');
        }

        if (files) {
            const oversizeFiles = Array.from(files).some(f => f.size > 5 * 1024 * 1024);
            if (oversizeFiles) {
                return toast.error('Some files exceed the 5MB limit. Please remove them.');
            }
        }
        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
            if (mainImage) formData.append('mainImage', mainImage);
            if (files) Array.from(files).forEach((f) => formData.append('documents', f));

            await api.post('/cases', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Case submitted for review!');
            router.push('/cases');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold">Submit a Case</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Provide official references and factual details.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* === CASE DETAILS === */}
                <div className="card p-6 space-y-4">
                    <h2 className="font-semibold text-lg border-b pb-2 mb-4">Case Overview</h2>

                    <div>
                        <div className="text-sm font-medium mb-1.5">Case Title *</div>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="What is this case about?"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <div className="text-sm font-medium mb-1.5">Detailed Description *</div>
                        <textarea
                            className="textarea-field min-h-[150px]"
                            placeholder="Describe the facts of the case..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-medium mb-1.5">Category *</div>
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
                            <div className="text-sm font-medium mb-1.5">Location *</div>
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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

                {/* === OFFICIAL REFERENCES === */}
                <div className="card p-6 space-y-4">
                    <h2 className="font-semibold text-lg border-b pb-2 mb-4">Verification References</h2>
                    <p className="text-xs text-gray-500 mb-2">Provide at least one official record or news link.</p>

                    <div>
                        <div className="text-sm font-medium mb-1.5">FIR / Case ID</div>
                        <div className="relative">
                            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                className="input-field pl-10"
                                placeholder="e.g., FIR/123/2024"
                                value={form.referenceNumber}
                                onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-medium mb-1.5">News Source URL</div>
                        <div className="relative">
                            <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="url"
                                className="input-field pl-10"
                                placeholder="https://..."
                                value={form.sourceUrl}
                                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* === MEDIA === */}
                <div className="card p-6 space-y-5">
                    <h2 className="font-semibold text-lg border-b pb-2 mb-4">Evidence & Media</h2>

                    <div>
                        <div className="text-sm font-medium mb-3">Main Cover Photo (Optional)</div>
                        <div className="aspect-video rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/10 overflow-hidden relative">
                            {mainImagePreview ? (
                                <>
                                    <img src={mainImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => mainImageRef.current?.click()}
                                        className="absolute bottom-4 right-4 btn-secondary text-xs shadow-lg"
                                    >
                                        Change Photo
                                    </button>
                                </>
                            ) : (
                                <div className="text-center p-6">
                                    <ImageIcon className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                                    <button
                                        type="button"
                                        onClick={() => mainImageRef.current?.click()}
                                        className="btn-secondary text-xs"
                                    >
                                        Select Case Photo
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-medium mb-3">Supporting Documents</div>
                        <div className="border rounded-xl p-6 bg-gray-50/50 dark:bg-gray-900/10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium">Add PDF or Images (Max 5MB)</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn-secondary text-xs"
                                >
                                    Browse Files
                                </button>
                            </div>
                            {files && files.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {Array.from(files).map((f, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 rounded bg-white dark:bg-gray-800 border text-xs">
                                            <span className="truncate max-w-[200px]">{f.name}</span>
                                            <span className="text-gray-400">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <LegalDisclaimer checked={legalChecked} onCheckedChange={setLegalChecked} />

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 text-lg shadow-xl shadow-blue-500/20 disabled:opacity-50"
                >
                    {loading ? 'Submitting Case...' : 'Submit for Verification'}
                </button>
            </form>

            <div style={{ display: 'none' }}>
                <input
                    type="file"
                    ref={mainImageRef}
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be less than 5MB');
                            setMainImage(file);
                            setMainImagePreview(URL.createObjectURL(file));
                        }
                    }}
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                        const selectedFiles = e.target.files;
                        if (selectedFiles) {
                            setFiles(selectedFiles);
                        }
                    }}
                />
            </div>
        </div>
    );
}
