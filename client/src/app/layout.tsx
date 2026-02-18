import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
    title: 'JusticeTrack — Transparent Legal Tracking for Public Accountability',
    description: 'A civic legal transparency platform for tracking verified legal cases with official references. Ensure accountability through community engagement and legal expert insights.',
    keywords: 'legal tracking, civic transparency, FIR tracking, court cases, public accountability, justice',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen font-sans">
                <Providers>
                    <Navbar />
                    <main className="pt-16">{children}</main>
                    <footer className="border-t mt-20 py-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <h3 className="font-display font-bold text-lg mb-2">
                                        <span className="gradient-text">JusticeTrack</span>
                                    </h3>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        Transparent Legal Tracking for Public Accountability. All cases must reference official records.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2 text-sm">Legal Disclaimer</h4>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        JusticeTrack is an informational platform. All cases are sourced from official records and verified media.
                                        This platform does not make any allegations or declare anyone guilty. Content is moderated and subject to legal review.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2 text-sm">Links</h4>
                                    <div className="flex flex-col gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        <a href="/about" className="hover:underline">About</a>
                                        <a href="/cases" className="hover:underline">Browse Cases</a>
                                        <a href="/contact" className="hover:underline">Contact</a>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-4 border-t text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                                © {new Date().getFullYear()} JusticeTrack. All rights reserved.
                            </div>
                        </div>
                    </footer>
                </Providers>
            </body>
        </html>
    );
}
