'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore, useThemeStore } from '@/lib/store';

export function Providers({ children }: { children: React.ReactNode }) {
    const loadAuth = useAuthStore((s) => s.loadFromStorage);
    const initTheme = useThemeStore((s) => s.init);

    useEffect(() => {
        initTheme();
        loadAuth();
    }, [initTheme, loadAuth]);

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        fontSize: '14px',
                    },
                }}
            />
            {children}
        </>
    );
}
