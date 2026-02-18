"use client";

import { useRef } from "react";
import { ImageIcon, FileText, Camera } from "lucide-react";

interface FileUploadProps {
    label: string;
    accept?: string;
    multiple?: boolean;
    onSelect: (files: FileList | null) => void;
    preview?: string;
    placeholderIcon?: "image" | "file";
}

export default function FileUpload({
    label,
    accept = "image/*",
    multiple = false,
    onSelect,
    preview,
    placeholderIcon = "image",
}: FileUploadProps) {
    const fileRef = useRef<HTMLInputElement>(null);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        fileRef.current?.click();
    };

    return (
        <div className="space-y-3">
            <div className="text-sm font-medium">{label}</div>

            <input
                ref={fileRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={(e) => onSelect(e.target.files)}
                className="hidden"
                style={{ display: 'none' }}
                tabIndex={-1}
            />

            <div
                className="aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/10 overflow-hidden relative"
            >
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={handleClick}
                            className="absolute bottom-4 right-4 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg text-xs font-medium shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition"
                        >
                            Change Photo
                        </button>
                    </>
                ) : (
                    <div className="text-center p-6 flex flex-col items-center">
                        {placeholderIcon === "image" ? (
                            <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                        ) : (
                            <FileText className="w-10 h-10 mb-3 text-gray-400" />
                        )}
                        <button
                            type="button"
                            onClick={handleClick}
                            className="px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--border)] border rounded-lg text-xs font-medium transition"
                        >
                            {multiple ? "Browse Files" : "Select Case Photo"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
