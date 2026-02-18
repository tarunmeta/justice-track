'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Upload, MapPin, Hash, Link2, AlertTriangle, ArrowRight, Paperclip, Camera, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { CATEGORY_LABELS } from '@/lib/utils';
import toast from 'react-hot-toast';
import { LegalDisclaimer } from '@/components/legal-disclaimer';

export default function CreateCasePage() {
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
    const mainImageRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

        // Client-side file validation
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
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold">Submit a Case</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        All cases require at least one official reference. Cases go through moderation before publication.
                    </p>
                </div>

                {/* Important Notice */}
                <div className="card p-4 mb-6 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Legal Safety Notice</h3>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                Only submit cases with verifiable official references (FIR Number, Court Case Number, or verified News URL).
                                Unverified accusations are strictly prohibited and may lead to account suspension.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Photo Section */}
                    <div className="card p-6 space-y-4">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Camera className="w-5 h-5" /> Main Case Photo
                        </h2>
                        <label
                            className="relative block aspect-video rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 cursor-pointer overflow-hidden transition-all bg-gray-50/50 dark:bg-gray-900/10 hover:border-blue-500 hover:bg-blue-50/30"
                        >
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                style={{ pointerEvents: 'auto' }}
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
                            {mainImagePreview ? (
                                <>
                                    <img src={mainImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <p className="text-white text-sm font-medium">Click to change photo</p>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
                                    <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm font-medium">Upload a primary photo for this case</p>
                                    <p className="text-xs text-gray-500 mt-1 mb-4">This will be shown in the case list</p>
                                    <div className="btn-secondary py-2 px-4 text-xs pointer-events-auto">
                                        Select Photo
                                    </div>
                                </div>
                            )}
                        </label>
                    </div>

                    <div className="card p-6 space-y-4">
                        <h2 className="font-semibold text-lg">Case Details</h2>

                        <div>
                            <label htmlFor="case-title" className="block text-sm font-medium mb-1.5">Case Title *</label>
                            <input
                                id="case-title"
                                type="text"
                                className="input-field"
                                placeholder="Brief, factual case title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="case-description" className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                                Case Description * <FileText className="w-3.5 h-3.5 text-gray-400" />
                            </label>
                            <textarea
                                id="case-description"
                                className="textarea-field"
                                rows={5}
                                placeholder="Detailed factual description of the case..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="case-category" className="block text-sm font-medium mb-1.5">Category *</label>
                                <select
                                    id="case-category"
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
                                <label htmlFor="case-location" className="block text-sm font-medium mb-1.5">Location *</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                    <input
                                        id="case-location"
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

                    <div className="card p-6 space-y-4">
                        <h2 className="font-semibold text-lg">Official References (at least one required)</h2>

                        <div>
                            <label htmlFor="reference-number" className="block text-sm font-medium mb-1.5">FIR / Court Case Number</label>
                            <div className="relative">
                                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    id="reference-number"
                                    type="text"
                                    className="input-field pl-10"
                                    placeholder="e.g. FIR/2024/DL/00789 or WP(C) 123/2024"
                                    value={form.referenceNumber}
                                    onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="source-url" className="block text-sm font-medium mb-1.5">Verified News Source URL</label>
                            <div className="relative">
                                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    id="source-url"
                                    className="input-field pl-10"
                                    type="url"
                                    placeholder="https://news-source.com/article"
                                    value={form.sourceUrl}
                                    onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card p-6 space-y-4">
                        <h2 className="font-semibold text-lg">Supporting Information</h2>

                        <div>
                            <label htmlFor="ground-status" className="block text-sm font-medium mb-1.5">Ground Status Description</label>
                            <textarea
                                id="ground-status"
                                className="textarea-field"
                                rows={3}
                                placeholder="Current ground-level situation..."
                                value={form.groundStatus}
                                onChange={(e) => setForm({ ...form, groundStatus: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Supporting Documents (PDF/Images)</label>
                            <label
                                className="relative block border-2 border-dashed rounded-xl p-8 text-center bg-gray-50/50 dark:bg-gray-900/10 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                            >
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    style={{ pointerEvents: 'auto' }}
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                        const selectedFiles = e.target.files;
                                        if (selectedFiles) {
                                            const validFiles = Array.from(selectedFiles).filter(file => {
                                                if (file.size > 5 * 1024 * 1024) {
                                                    toast.error(`${file.name} is too large (max 5MB)`);
                                                    return false;
                                                }
                                                return true;
                                            });
                                            setFiles(selectedFiles);
                                        }
                                    }}
                                />
                                <div className="pointer-events-none">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-3">
                                        <Upload className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-medium mb-1">Upload supporting documents</p>
                                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>PDF, JPG, PNG — Max 5MB each</p>

                                    <div className="btn-secondary py-2 px-6 text-xs pointer-events-auto">
                                        Select Files
                                    </div>
                                </div>
                            </label>
                            {files && (
                                <div className="mt-2 space-y-1">
                                    {Array.from(files).map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                                            <FileText className="w-3.5 h-3.5" />
                                            <span className={f.size > 5 * 1024 * 1024 ? "text-red-500 line-through" : ""}>{f.name}</span>
                                            <span className="text-muted-foreground ml-auto">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <LegalDisclaimer checked={legalChecked} onCheckedChange={setLegalChecked} />

                    <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Submitting...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                Submit for Review <ArrowRight className="w-4 h-4" />
                            </span>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
