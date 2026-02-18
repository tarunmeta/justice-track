'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { CATEGORY_LABELS } from '@/lib/utils';
import toast from 'react-hot-toast';
import { LegalDisclaimer } from '@/components/legal-disclaimer';

/**
 * NUCLEAR ISOLATION TEST V10
 * - ZERO FILE INPUTS IN THIS CODE
 * - NO REFS
 * - NO LOGIC FOR MEDIA
 * - IF THIS STILL TRIGGERS GALLERY, IT IS A GLOBAL OVERLAY BUG.
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
        if (!legalChecked) return toast.error('You must agree to the legal declaration');

        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
            await api.post('/cases', formData);
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
            {/* V10 NUCLEAR BANNER */}
            <div className="bg-blue-600 text-white p-6 text-center font-bold sticky top-16 z-[99999]">
                NUCLEAR ISOLATION V10: ZERO FILE INPUTS IN THIS CODE
                <br /><span className="text-xs">If you see this and gallery STILL opens, the bug is in layout.tsx or a Chrome Extension.</span>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8 font-bold text-3xl">Submit a Case (TEST MODE)</div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-6 shadow-sm">
                        <div className="text-lg font-bold border-b pb-2">Step 1: Details</div>

                        <div>
                            <div className="text-sm font-semibold mb-2">Case Title *</div>
                            <input
                                name="case-title-test"
                                type="text"
                                className="input-field border-4 border-blue-500"
                                placeholder="TYPE HERE TO TEST"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <div className="text-sm font-semibold mb-2">Description *</div>
                            <textarea
                                className="textarea-field min-h-[160px] border-4 border-blue-500"
                                placeholder="TYPE HERE TO TEST"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <div className="text-sm font-semibold mb-2">Category *</div>
                                <select
                                    className="input-field border-4 border-blue-500"
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
                                        className="input-field pl-10 border-4 border-blue-500"
                                        placeholder="City, State"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-100 border-2 border-red-500 p-6 rounded-xl text-center font-bold text-red-700">
                        MEDIA UPLOAD HAS BEEN COMPLETELY REMOVED FROM THIS SOURCE FILE.
                        <br /><span className="text-sm font-normal">If clicking above triggers a photo picker, the bug is a structural overlay outside this file.</span>
                    </div>

                    <div className="pt-4">
                        <LegalDisclaimer checked={legalChecked} onCheckedChange={setLegalChecked} />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full py-5 text-xl">
                        {loading ? 'Processing...' : 'SUBMIT CASE (V10)'}
                    </button>
                </form>
            </div>
        </div>
    );
}
