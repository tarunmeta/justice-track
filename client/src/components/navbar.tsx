'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore, useThemeStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Scale, Sun, Moon, Menu, X, LogOut, User, Shield, LayoutDashboard, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuthStore();
    const { dark, toggle } = useThemeStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const links = [
        { href: '/', label: 'Home' },
        { href: '/cases', label: 'Cases' },
    ];

    const authLinks = isAuthenticated
        ? [
            { href: '/cases/create', label: 'Submit Case' },
            ...(user?.role === 'ADMIN' || user?.role === 'MODERATOR'
                ? [{ href: '/moderate', label: 'Moderate' }]
                : []),
            ...(user?.role === 'ADMIN'
                ? [{ href: '/admin', label: 'Admin' }]
                : []),
        ]
        : [];

    return (
        <nav className="glass-nav fixed top-0 left-0 right-0 z-50 h-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1d4ed8, #06b6d4)' }}>
                        <Scale className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-display font-bold text-xl hidden sm:block">
                        <span className="gradient-text">Justice</span>Track
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-1">
                    {[...links, ...authLinks].map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={cn(
                                'px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                pathname === l.href
                                    ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800/50',
                            )}
                            style={{ color: pathname === l.href ? undefined : 'var(--text-secondary)' }}
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggle}
                        className="p-2.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50"
                        aria-label="Toggle theme"
                    >
                        {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                    </button>

                    {isAuthenticated ? (
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50"
                            >
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden sm:block text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            <AnimatePresence>
                                {profileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="absolute right-0 top-12 w-56 rounded-xl border shadow-xl overflow-hidden z-50"
                                        style={{ background: 'var(--bg-card)' }}
                                    >
                                        <div className="p-3 border-b">
                                            <p className="font-medium text-sm">{user?.name}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                                            <span className="badge-blue mt-1 text-[10px]">{user?.role}</span>
                                        </div>
                                        <div className="p-1">
                                            <Link href="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50">
                                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                                            </Link>
                                            <button
                                                onClick={() => { logout(); setProfileOpen(false); }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                                            >
                                                <LogOut className="w-4 h-4" /> Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/auth/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                            <Link href="/auth/register" className="btn-primary text-sm py-2 px-4 hidden sm:flex">Register</Link>
                        </div>
                    )}

                    {/* Mobile Menu */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg">
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t overflow-hidden"
                        style={{ background: 'var(--bg-card)' }}
                    >
                        <div className="p-4 flex flex-col gap-1">
                            {[...links, ...authLinks].map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                        pathname === l.href ? 'bg-blue-600/10 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50',
                                    )}
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
