'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { MapPin, Hash, Link2, AlertTriangle, ImageIcon, FileText } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { CATEGORY_LABELS } from '@/lib/utils';
import toast from 'react-hot-toast';
import { LegalDisclaimer } from '@/components/legal-disclaimer';

/**
 * PORTAL-BASED FILE UPLOAD
 * Physically detaches the hidden input from the form's DOM tree.
 */
function PortalFileInput({
    inputRef,
    onChange,
    accept = "image/*",
    multiple = false
}: {
    inputRef: React.RefObject<HTMLInputElement>,
    onChange: (files: FileList | null) => void,
    accept?: string,
    multiple?: boolean
}) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return createPortal(
        <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => onChange(e.target.files)}
            className="hidden"
            style={{
                display: 'none',
                position: 'fixed',
                top: '-1000px',
                left: '-1000px',
                width: '1px',
                height: '1px',
                pointerEvents: 'none',
                opacity: 0,
                zIndex: -9999
            }}
            tabIndex={-1}
        />,
        document.body
    );
}

/**
 * VERSION: HYPER_ISOLATION_V6_PORTAL
 * - Uses Radix/Portal-style strategy to move inputs out of the form entirely.
 * - NO <label> tags (Using <div> for styling only).
 * - UNIQUE_RANDOM IDs on every field.
 * - Absolute stopPropagation on everything.
 */
export default function CreateCasePage() {
    console.log("RENDERED: CreateCasePage [HYPER ISOLATION V6 PORTAL]");

    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', category: 'OTHER',
        location: '', referenceNumber: '', sourceUrl: '', groundStatus: '',
    });

    // Media State
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>('');
    const [supportingDocs, setSupportingDocs] = useState<FileList | null>(null);
    const [legalChecked, setLegalChecked] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    // Refs for Portal Inputs
    const mainImagePortalRef = useRef<HTMLInputElement>(null);
    const docsPortalRef = useRef<HTMLInputElement>(null);

    // Seed for random IDs
    const [seed] = useState(() => Math.random().toString(36).substring(2, 7));

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
        e.stopPropagation();
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

    const handleInputClick = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pb-20 select-none">
            {/* DIAGNOSTIC BANNER */}
            <div className="bg-purple-600 text-white text-[10px] py-1 text-center font-mono sticky top-16 z-[60] animate-pulse">
                ACTIVE: HYPER_ISOLATION_V6_PORTAL_ACTIVE [{seed}]
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Submit a Case</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Provide factual details and official references.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" onClick={(e) => e.stopPropagation()}>
                    {/* CASE DETAILS */}
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-6">
                        <div className="text-lg font-semibold border-b border-[var(--border)] pb-3 mb-2">Case Details</div>

                        <div>
                            <div className="text-sm font-medium mb-1.5 text-[var(--text-primary)]">Case Title *</div>
                            <input
                                id={`t-${seed}`}
                                type="text"
                                className="input-field select-text"
                                placeholder="Brief, factual case title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                onClick={handleInputClick}
                                required
                            />
                        </div>

                        <div>
                            <div className="text-sm font-medium mb-1.5 text-[var(--text-primary)]">Description *</div>
                            <textarea
                                id={`d-${seed}`}
                                className="textarea-field min-h-[160px] select-text"
                                placeholder="Detailed factual description of the case..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                onClick={handleInputClick}
                                required
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <div className="text-sm font-medium mb-1.5">Category *</div>
                                <select
                                    id={`c-${seed}`}
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
                                <div className="text-sm font-medium mb-1.5">Location *</div>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    <input
                                        id={`l-${seed}`}
                                        type="text"
                                        className="input-field pl-10 select-text"
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

                    {/* MEDIA & PHOTO SECTION (EXPLICIT BUTTONS ONLY) */}
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-6">
                        <div className="text-lg font-semibold border-b border-[var(--border)] pb-3 mb-2">Evidence & Media</div>

                        <div className="space-y-4">
                            <div className="text-sm font-medium">Main Case Photo (Recommended)</div>
                            <div className="aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/10 overflow-hidden relative">
                                {mainImagePreview ? (
                                    <>
                                        <img src={mainImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); mainImagePortalRef.current?.click(); }}
                                            className="absolute bottom-4 right-4 btn-secondary text-xs bg-white dark:bg-gray-800"
                                        >
                                            Change Photo
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center p-6 flex flex-col items-center">
                                        <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); mainImagePortalRef.current?.click(); }}
                                            className="btn-secondary text-xs"
                                        >
                                            Select Case Photo
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm font-medium">Supporting Documents (Optional)</div>
                            <div className="border border-[var(--border)] rounded-xl p-6 bg-gray-50/50 dark:bg-gray-900/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm">Multiple PDFs or Images</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); docsPortalRef.current?.click(); }}
                                    className="btn-secondary text-xs"
                                >
                                    Browse Files
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4" onClick={handleInputClick}>
                        <LegalDisclaimer checked={legalChecked} onCheckedChange={setLegalChecked} />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
                        {loading ? 'Submitting Case...' : 'Submit Case Officialy'}
                    </button>
                </form>
            </div>

            {/* PORTALED INPUTS - PHYSICALLY OUTSIDE THE FORM TREE */}
            <PortalFileInput
                inputRef={mainImagePortalRef}
                onChange={(files) => {
                    const file = files?.[0];
                    if (file) {
                        if (file.size > 5 * 1024 * 1024) return toast.error('Photo exceeds 5MB');
                        setMainImage(file);
                        setMainImagePreview(URL.createObjectURL(file));
                    }
                }}
            />
            <PortalFileInput
                inputRef={docsPortalRef}
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(files) => setSupportingDocs(files)}
            />
        </div>
    );
}
