"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Quest } from "@/types";
import { motion } from "framer-motion";

interface QuestCardProps {
    quest: Quest;
    index?: number;
}

// Hardcoded Tailwind classes — динамічна інтерполяція не підтримується JIT
const ACCENT_COLORS = [
    {
        bar:     "bg-rose-500",
        iconBg:  "bg-rose-50 border-rose-100",
        arrowBg: "bg-rose-50 group-hover:bg-rose-500",
        arrow:   "text-rose-400 group-hover:text-white",
        title:   "group-hover:text-rose-500",
    },
    {
        bar:     "bg-sky-500",
        iconBg:  "bg-sky-50 border-sky-100",
        arrowBg: "bg-sky-50 group-hover:bg-sky-500",
        arrow:   "text-sky-400 group-hover:text-white",
        title:   "group-hover:text-sky-500",
    },
    {
        bar:     "bg-violet-500",
        iconBg:  "bg-violet-50 border-violet-100",
        arrowBg: "bg-violet-50 group-hover:bg-violet-500",
        arrow:   "text-violet-400 group-hover:text-white",
        title:   "group-hover:text-violet-500",
    },
    {
        bar:     "bg-amber-500",
        iconBg:  "bg-amber-50 border-amber-100",
        arrowBg: "bg-amber-50 group-hover:bg-amber-500",
        arrow:   "text-amber-400 group-hover:text-white",
        title:   "group-hover:text-amber-500",
    },
    {
        bar:     "bg-emerald-500",
        iconBg:  "bg-emerald-50 border-emerald-100",
        arrowBg: "bg-emerald-50 group-hover:bg-emerald-500",
        arrow:   "text-emerald-400 group-hover:text-white",
        title:   "group-hover:text-emerald-500",
    },
    {
        bar:     "bg-pink-500",
        iconBg:  "bg-pink-50 border-pink-100",
        arrowBg: "bg-pink-50 group-hover:bg-pink-500",
        arrow:   "text-pink-400 group-hover:text-white",
        title:   "group-hover:text-pink-500",
    },
];

export const QuestCard: React.FC<QuestCardProps> = ({ quest, index = 0 }) => {
    const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.3, ease: "easeOut" }}
        >
            <Link href={`/map?questId=${quest.id}`} className="group block">
                <div className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-200 relative overflow-hidden">

                    {/* Лівий кольоровий акцент */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${accent.bar}`} />

                    {/* Icon */}
                    <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl border ${accent.iconBg}`}>
                        {quest.icon || "🗺️"}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 pl-1">
                        <h3 className={`font-black text-slate-900 truncate text-base leading-tight mb-0.5 transition-colors ${accent.title}`}>
                            {quest.title}
                        </h3>
                        <p className="text-slate-400 text-sm font-medium truncate">
                            {quest.description}
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 ease-in-out ${accent.arrowBg}`}>
                        <ArrowRight
                            size={15}
                            className={`transition-all duration-300 ease-in-out group-hover:translate-x-0.5 ${accent.arrow}`}
                        />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};
