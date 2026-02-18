'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, MapPin, Hash, Link2, AlertTriangle, Camera, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { CATEGORY_LABELS } from '@/lib/utils';
import toast from 'react-hot-toast';
import { LegalDisclaimer } from '@/components/legal-disclaimer';

/**
 * VERSION: HYPER_ISOLATION_V4
 * - NO labels.
 * - NO IDs on inputs.
 * - NO framer-motion in the form area.
 * - File inputs are literally outside the main container div.
 * - Diagnostic banner added.
 */
export default function CreateCasePage() {
    console.log("RENDERED: CreateCasePage [HYPER ISOLATION V4]");

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
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* DIAGNOSTIC BANNER */}
            <div className="bg-blue-600 text-white text-[10px] py-1 text-center font-mono">
                DIAGNOSTIC: HYPER_ISOLATION_V4_ACTIVE
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Submit a Case</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Provide factual details and official references.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* CASE DETAILS */}
                    <div className="bg-[var(--bg-card)] rounded-xl border p-6 space-y-4">
                        <div className="text-lg font-semibold border-b pb-2 mb-4">Case Details</div>

                        <div>
                            <div className="text-sm font-medium mb-1.5">Case Title *</div>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Brief, factual case title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <div className="text-sm font-medium mb-1.5">Description *</div>
                            <textarea
                                className="textarea-field min-h-[150px]"
                                placeholder="Detailed factual description of the case..."
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

                    {/* REFERENCES */}
                    <div className="bg-[var(--bg-card)] rounded-xl border p-6 space-y-4">
                        <div className="text-lg font-semibold border-b pb-2 mb-4">Verification References</div>
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

                    {/* MEDIA */}
                    <div className="bg-[var(--bg-card)] rounded-xl border p-6 space-y-5">
                        <div className="text-lg font-semibold border-b pb-2 mb-4">Evidence & Media</div>
                        <div>
                            <div className="text-sm font-medium mb-3">Main Cover Photo (Optional)</div>
                            <div className="aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/10 overflow-hidden relative">
                                {mainImagePreview ? (
                                    <>
                                        <img src={mainImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => mainImageRef.current?.click()} className="absolute bottom-4 right-4 btn-secondary text-xs">Change Photo</button>
                                    </>
                                ) : (
                                    <div className="text-center p-6">
                                        <ImageIcon className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                                        <button type="button" onClick={() => mainImageRef.current?.click()} className="btn-secondary text-xs">Select Case Photo</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium mb-3">Supporting Documents</div>
                            <div className="border rounded-xl p-6 bg-gray-50/50 dark:bg-gray-900/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm">Add PDF or Images (Max 5MB)</span>
                                </div>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary text-xs">Browse Files</button>
                            </div>
                        </div>
                    </div>

                    <LegalDisclaimer checked={legalChecked} onCheckedChange={setLegalChecked} />

                    <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg disabled:opacity-50">
                        {loading ? 'Submitting Case...' : 'Submit Case'}
                    </button>
                </form>
            </div>

            {/* COMPLETELY DETACHED FILE INPUTS */}
            <div style={{ display: 'none', visibility: 'hidden', pointerEvents: 'none' }}>
                <input type="file" ref={mainImageRef} accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size <= 5 * 1024 * 1024) {
                        setMainImage(file);
                        setMainImagePreview(URL.createObjectURL(file));
                    } else if (file) toast.error('Photo exceeds 5MB');
                }} />
                <input type="file" ref={fileInputRef} multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
                    if (e.target.files) setFiles(e.target.files);
                }} />
            </div>
        </div>
    );
}
