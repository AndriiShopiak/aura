"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, X, ExternalLink, ImageOff, AlertTriangle, Clock } from "lucide-react";
import { useImageSearch, extractSearchQuery, UnsplashPhoto } from "@/hooks/useImageSearch";

interface ImagePickerProps {
    phrase: string;              // e.g. "it's an apple"
    onSelect: (url: string) => void;
    onClose: () => void;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({ phrase, onSelect, onClose }) => {
    const { photos, isLoading, error, errorCode, searchQuery, setSearchQuery, search, clear } = useImageSearch(phrase);

    // Auto-search on mount
    useEffect(() => {
        const q = extractSearchQuery(phrase);
        if (q) {
            setSearchQuery(q);
            search(q);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") search(searchQuery);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-sm font-black text-slate-900 tracking-tight">Image Search</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Powered by Unsplash
                        </p>
                    </div>
                    <button
                        onClick={() => { clear(); onClose(); }}
                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center text-slate-400 transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-8 py-5">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search images..."
                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 focus:outline-none focus:border-sky-400 transition-all font-bold text-slate-900 text-sm"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={() => search(searchQuery)}
                            disabled={isLoading || !searchQuery.trim()}
                            className="h-12 px-6 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
                        </button>
                    </div>
                    {phrase && (
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 pl-1">
                            Auto-extracted from: <span className="text-sky-500">"{phrase}"</span>
                        </p>
                    )}
                </div>

                {/* Results Grid */}
                <div className="px-8 pb-8 overflow-y-auto flex-1">
                    {/* Rate Limit Error */}
                    {error && errorCode === "RATE_LIMIT" && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                                    <AlertTriangle size={20} className="text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-amber-900">Hourly limit reached</p>
                                    <p className="text-xs text-amber-700 font-medium mt-1 leading-relaxed">
                                        Unsplash allows <strong>50 searches per hour</strong> on the free demo plan.
                                        The limit resets automatically — come back in a bit!
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-white/70 rounded-xl px-4 py-3 border border-amber-100">
                                <div className="flex items-center gap-2 text-amber-600">
                                    <Clock size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Resets in ~1 hour</span>
                                </div>
                                <a
                                    href="https://unsplash.com/oauth/applications"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-sky-500 hover:text-sky-700 transition-colors"
                                >
                                    Apply for Production <ExternalLink size={10} />
                                </a>
                            </div>

                            <p className="text-[9px] font-bold text-amber-600/70 uppercase tracking-widest text-center">
                                You can still upload images manually using the Upload button
                            </p>
                        </div>
                    )}

                    {/* Generic Error */}
                    {error && errorCode !== "RATE_LIMIT" && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                            <ImageOff size={28} />
                            <p className="text-xs font-bold">{error}</p>
                        </div>
                    )}

                    {!isLoading && !error && photos.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-300 gap-3">
                            <Search size={28} />
                            <p className="text-xs font-bold text-slate-400">Type something to search</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={28} className="animate-spin text-sky-400" />
                        </div>
                    )}

                    {!isLoading && photos.length > 0 && (
                        <>
                            <div className="grid grid-cols-3 gap-3">
                                {photos.map((photo) => (
                                    <button
                                        key={photo.id}
                                        onClick={() => {
                                            onSelect(photo.fullUrl);
                                            onClose();
                                        }}
                                        className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-sky-500 transition-all focus:outline-none focus:border-sky-500"
                                    >
                                        <img
                                            src={photo.thumbUrl}
                                            alt={photo.altDescription}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all" />
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[8px] font-bold text-white/80 truncate">
                                                {photo.authorName}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Unsplash Attribution (required by their guidelines) */}
                            <div className="flex items-center justify-center gap-1 mt-5">
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                    Photos by
                                </p>
                                <a
                                    href="https://unsplash.com?utm_source=aura_lessons&utm_medium=referral"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] font-black text-slate-400 hover:text-sky-500 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                >
                                    Unsplash <ExternalLink size={8} />
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
