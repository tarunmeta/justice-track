import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    PENDING_REVIEW: { label: 'Pending Review', color: 'badge-yellow' },
    UNDER_INVESTIGATION: { label: 'Under Investigation', color: 'badge-blue' },
    VERIFIED: { label: 'Verified', color: 'badge-green' },
    COURT_HEARING: { label: 'Court Hearing', color: 'badge-blue' },
    RESOLVED: { label: 'Resolved', color: 'badge-green' },
    CLOSED: { label: 'Closed', color: 'badge-gray' },
    REJECTED: { label: 'Rejected', color: 'badge-red' },
    FLAGGED: { label: 'Flagged', color: 'badge-red' },
};

export const CATEGORY_LABELS: Record<string, string> = {
    ACCIDENT: 'Accident',
    ASSAULT: 'Assault',
    CORRUPTION: 'Corruption',
    PUBLIC_SAFETY: 'Public Safety',
    OTHER: 'Other',
};

export const CATEGORY_ICONS: Record<string, string> = {
    ACCIDENT: '🚗',
    ASSAULT: '⚠️',
    CORRUPTION: '🏛️',
    PUBLIC_SAFETY: '🛡️',
    OTHER: '📋',
};

export function timeAgo(date: string) {
    const now = new Date();
    const d = new Date(date);
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}
