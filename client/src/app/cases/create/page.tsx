'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { MapPin, Hash, Link2, AlertTriangle, ImageIcon, FileText, Trash2, Crosshair } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { CATEGORY_LABELS } from '@/lib/utils';
import toast from 'react-hot-toast';
import { LegalDisclaimer } from '@/components/legal-disclaimer';

/**
 * PORTAL V8 - COMPLETELY DETACHED
 */
function PortalV8({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return createPortal(children, document.body);
}

/**
 * VERSION: HYPER_DIAGNOSTIC_V8
 * - Visual Pathology: Highlights all file inputs in red.
 * - Real-time Trace: Shows the last clicked element path in the UI.
 * - Clean Mode: Button to remove all file inputs from DOM.
 */
export default function CreateCasePage() {
    const [lastTrace, setLastTrace] = useState<string>("No clicks detected yet.");
    const [vizActive, setVizActive] = useState(true);

    // -------------------------------------------------------------------------
    // DIAGNOSTIC CORE - SHOWS PATHOLOGY
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (!vizActive) return;

        const visualizerInterval = setInterval(() => {
            const fileInputs = document.querySelectorAll('input[type="file"]');
            fileInputs.forEach((el, i) => {
                const input = el as HTMLInputElement;
                input.style.display = 'block';
                input.style.position = 'fixed';
                input.style.border = '5px solid red';
                input.style.padding = '10px';
                input.style.background = 'white';
                input.style.color = 'black';
                input.style.fontWeight = 'bold';
                input.style.zIndex = '99999999';
                input.style.opacity = '1';
                input.style.pointerEvents = 'auto'; // Make it visible and clickable for proof

                // Add a label if missing
                let label = document.getElementById(`diag-label-${i}`);
                if (!label) {
                    label = document.createElement('div');
                    label.id = `diag-label-${i}`;
                    label.textContent = `!!!! RENDERED FILE INPUT #${i} !!!!`;
                    label.style.position = 'fixed';
                    label.style.background = 'red';
                    label.style.color = 'white';
                    label.style.padding = '2px 8px';
                    label.style.fontSize = '10px';
                    label.style.zIndex = '99999999';
                    document.body.appendChild(label);
                }

                const rect = input.getBoundingClientRect();
                label.style.top = `${rect.top - 20}px`;
                label.style.left = `${rect.left}px`;
            });
        }, 1000);

        const clickTracer = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const path = [];
            let curr: HTMLElement | null = target;
            while (curr && curr !== document.body) {
                path.push(`${curr.tagName.toLowerCase()}${curr.id ? '#' + curr.id : ''}${curr.className ? '.' + curr.className.split(' ').join('.') : ''}`);
                curr = curr.parentElement;
            }
            const pathStr = path.reverse().join(' > ');
            console.log("V8 TRACE:", pathStr);
            setLastTrace(pathStr);

            if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'file') {
                console.error("V8 ALERT: A FILE INPUT CAPTURED THIS CLICK!");
                toast.error("V8 ALERT: File Input Intercepted Click!", { id: 'v8-alert' });
            }
        };

        window.addEventListener('click', clickTracer, true);
        return () => {
            clearInterval(visualizerInterval);
            window.removeEventListener('click', clickTracer, true);
        };
    }, [vizActive]);

    const nukeAllInputs = () => {
        const inputs = document.querySelectorAll('input[type="file"]');
        inputs.forEach(i => i.remove());
        toast.success(`Nuked ${inputs.length} file inputs from DOM`);
    };

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
            {/* V8 ROYAL BLUE DIAGNOSTIC BANNER */}
            <div className="bg-blue-700 text-white p-4 text-center sticky top-16 z-[999999] border-b-4 border-white shadow-2xl">
                <div className="font-black text-lg">DIAGNOSTIC BUILD V8 ACTIVE</div>
                <div className="text-xs opacity-90 font-mono mt-1">
                    PATHOLOGY VISUALIZER ON | CLICK TRACER ON | PORTAL V8 DETACHED
                </div>

                {/* TOOLBAR */}
                <div className="flex justify-center gap-4 mt-4">
                    <button
                        onClick={nukeAllInputs}
                        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-bold flex items-center gap-2 transition shadow-lg"
                    >
                        <Trash2 className="w-3 h-3" /> NUKE ALL FILE INPUTS
                    </button>
                    <button
                        onClick={() => setVizActive(!vizActive)}
                        className={`${vizActive ? 'bg-amber-500' : 'bg-gray-500'} px-3 py-1 rounded text-xs font-bold flex items-center gap-2 transition shadow-lg`}
                    >
                        <Crosshair className="w-3 h-3" /> {vizActive ? 'VISUALIZER: ON' : 'VISUALIZER: OFF'}
                    </button>
                </div>

                {/* REAL-TIME TRACE */}
                <div className="mt-3 bg-black/40 p-2 rounded text-[10px] font-mono text-cyan-300 border border-white/20 truncate">
                    LAST CLICK PATH: {lastTrace}
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Submit a Case</h1>
                    <p className="text-sm text-[var(--text-secondary)]">Factual references required.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-6 shadow-sm">
                        <div className="text-sm font-bold border-b pb-2 mb-2 text-blue-600 dark:text-blue-400">DEBUG ZONE: NO LABELS | NO IDs</div>

                        {/* CASE TITLE */}
                        <div>
                            <div className="text-sm font-semibold mb-2">Case Title *</div>
                            <input
                                type="text"
                                className="input-field border-2 focus:border-blue-500"
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
                                className="textarea-field min-h-[150px] border-2 focus:border-blue-500"
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
                                    className="input-field border-2"
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
                                        className="input-field pl-10 border-2"
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

                    {/* PHOTO UPLOAD (REFS ONLY) */}
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-6 shadow-sm">
                        <div className="text-lg font-bold border-b pb-2">Photo & Media</div>
                        <div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); mainRef.current?.click(); }}
                                className="w-full h-40 border-2 border-dashed rounded-xl flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/10 transition"
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

                    <button type="submit" disabled={loading} className="btn-primary w-full py-5 text-xl shadow-xl shadow-blue-500/20 active:scale-[0.98]">
                        {loading ? 'Submitting...' : 'SUBMIT CASE OFFICIALY'}
                    </button>
                </form>
            </div>

            {/* COMPLETELY DETACHED INPUTS V8 */}
            <PortalV8>
                <div id="v8-portal-container" style={{ position: 'fixed', top: '-1000px', left: '-1000px', visibility: 'visible', opacity: 1 }}>
                    <input
                        id="v8-main-file-input"
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
                        id="v8-docs-file-input"
                        ref={docsRef}
                        type="file"
                        multiple
                        onChange={(e) => setSupportingDocs(e.target.files)}
                    />
                </div>
            </PortalV8>
        </div>
    );
}
