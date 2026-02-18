'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scale, Mail, Lock, User, Eye, EyeOff, ArrowRight, KeyRound } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<'register' | 'otp'>('register');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [devOtp, setDevOtp] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', form);
            if (data.devOtp) setDevOtp(data.devOtp);
            toast.success('Registration successful! Please verify your email.');
            setStep('otp');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/verify-otp', { email: form.email, otp });
            toast.success('Email verified! You can now login.');
            router.push('/auth/login');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-blue-500/5" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md"
            >
                <div className="card p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #1d4ed8)' }}>
                            <Scale className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="font-display text-2xl font-bold">
                            {step === 'register' ? 'Create Account' : 'Verify Email'}
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            {step === 'register' ? 'Join JusticeTrack to track and engage with verified cases' : 'Enter the OTP sent to your email'}
                        </p>
                    </div>

                    {step === 'register' ? (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        className="input-field pl-10"
                                        placeholder="John Doe"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                    <input
                                        type="email"
                                        className="input-field pl-10"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        className="input-field pl-10 pr-10"
                                        placeholder="Minimum 8 characters"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        minLength={8}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating account...
                                    </span>
                                ) : (
                                    <>Create Account <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            {devOtp && (
                                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm">
                                    <span className="font-medium text-amber-700 dark:text-amber-300">Dev Mode OTP: </span>
                                    <code className="font-mono font-bold text-amber-800 dark:text-amber-200">{devOtp}</code>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">OTP Code</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        className="input-field pl-10 text-center text-xl tracking-[0.3em] font-mono"
                                        placeholder="000000"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </button>
                        </form>
                    )}

                    <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">Sign In</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
