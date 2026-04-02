"use client";

import React from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import Image from "next/image";
import { UserProgress } from "@/types";

interface HeaderProps {
    progress?: UserProgress | null;
}

export const Header: React.FC<HeaderProps> = ({ progress }) => {
    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <Image
                        src="/aura-logo.svg"
                        alt="Aura Logo"
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-xl drop-shadow-sm transition-transform group-hover:scale-105"
                    />
                    <span className="text-lg font-black tracking-tight text-slate-900">Aura</span>
                </Link>

                {/* Stars */}
                <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200/60 rounded-full">
                    <Trophy size={14} className="text-amber-500" />
                    <span className="text-sm font-black text-amber-700 tabular-nums">
                        {progress?.totalStars || 0}
                    </span>
                    <span className="text-xs font-bold text-amber-500/70 uppercase tracking-wider">stars</span>
                </div>
            </div>
        </header>
    );
};
