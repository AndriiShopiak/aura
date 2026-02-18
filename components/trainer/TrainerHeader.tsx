"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface TrainerHeaderProps {
    title: string;
}

export function TrainerHeader({ title }: TrainerHeaderProps) {
    return (
        <div className="aura-gradient-primary p-6 text-white relative z-10 flex justify-between items-center">
            <div className="flex flex-col">
                <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-all mb-2 group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
                </Link>
                <h1 className="text-xl font-black tracking-tight">{title}</h1>
            </div>
        </div>
    );
}
