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
 * PORTAL V7 - COMPLETELY DETACHED
 */
function PortalV7({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return createPortal(children, document.body);
}

/**
 * VERSION: NUCLEAR_ISOLATION_V7
 * - NO IDs
 * - NO htmlFor
 * - NO <label> tags (Using <div> only)
 * - Absolute Click Capture Diagnostic
 */
export default function CreateCasePage() {
    // DIAGNOSTIC CORE
    useEffect(() => {
        console.log("DIAGNOSTIC: V7 ACTIVE - MAPPING ALL CLICKS");
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const path = [];
            let curr: HTMLElement | null = target;
            while (curr && curr !== document.body) {
                path.push(`${curr.tagName.toLowerCase()}${curr.id ? '#' + curr.id : ''}${curr.className ? '.' + curr.className.split(' ').join('.') : ''}`);
                curr = curr.parentElement;
            }
            console.log("CLICK DETECTED ON:", path.join(' > '));
            if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'file') {
                console.warn("!!!! FILE INPUT TRIGGERED !!!!");
            }
        };
        window.addEventListener('click', handler, true);
        return () => window.removeEventListener('click', handler, true);
    }, []);

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

    // Refs
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
            toast.success('Case submitted!');
            router.push('/cases');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pb-20">
            {/* BIG RED FRESHNESS BANNER */}
            <div className="bg-red-600 text-white p-4 text-center font-bold sticky top-16 z-[99999] border-4 border-yellow-400">
                NUCLEAR FIX V7 ACTIVE - IF YOU SEE THIS, IT'S THE NEWEST CODE
                <br /><span className="text-xs font-mono">NO LABELS | NO IDs | PORTAL DETACHED | CLICK TRACKER ON</span>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Submit a Case</h1>
                    <p className="text-sm text-[var(--text-secondary)]">Factual references required.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-6">
                        {/* CASE TITLE */}
                        <div>
                            <div className="text-sm font-semibold mb-2">Case Title *</div>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Factual title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                required
                            />
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                            <div className="text-sm font-semibold mb-2">Description *</div>
                            <textarea
                                className="textarea-field min-h-[150px]"
                                placeholder="Describe facts..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
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
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className="text-sm font-semibold mb-2">Location *</div>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        className="input-field pl-10"
                                        placeholder="City, State"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        onClick={(e) => e.stopPropagation()}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* REFERENCES */}
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-6">
                        <div className="text-lg font-bold border-b pb-2">Verification References</div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <div className="text-sm font-semibold mb-2">FIR / Case ID</div>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="ID number"
                                    value={form.referenceNumber}
                                    onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                            <div>
                                <div className="text-sm font-semibold mb-2">News URL</div>
                                <input
                                    type="url"
                                    className="input-field"
                                    placeholder="Link to source"
                                    value={form.sourceUrl}
                                    onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    </div>

                    {/* PHOTO UPLOAD (REFS ONLY) */}
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-6">
                        <div className="text-lg font-bold border-b pb-2">Photo & Media</div>
                        <div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); mainRef.current?.click(); }}
                                className="w-full h-40 border-2 border-dashed rounded-xl flex items-center justify-center hover:bg-slate-50 transition"
                            >
                                {mainImagePreview ? (
                                    <img src={mainImagePreview} className="h-full w-full object-cover rounded-lg" />
                                ) : (
                                    <div className="text-center">
                                        <ImageIcon className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                                        <span className="text-sm text-slate-500 font-medium">Click to upload Main Photo</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                        <LegalDisclaimer checked={legalChecked} onCheckedChange={setLegalChecked} />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full py-5 text-xl">
                        {loading ? 'Submitting...' : 'SUBMIT CASE OFFICIALY'}
                    </button>
                </form>
            </div>

            {/* COMPLETELY DETACHED INPUTS */}
            <PortalV7>
                <div style={{ position: 'fixed', top: '-5000px', left: '-5000px' }}>
                    <input
                        ref={mainRef}
                        type="file"
                        accept="image/*"
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
                        onChange={(e) => setSupportingDocs(e.target.files)}
                    />
                </div>
            </PortalV7>
        </div>
    );
}
