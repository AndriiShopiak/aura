"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Star as StarIcon, Map as MapIcon, ArrowLeft } from "lucide-react";
import { calculateStars } from "@/lib/progress";

interface ResultViewProps {
    score: number;
    totalWords: number;
    onRetry: () => void;
}

export function ResultView({ score, totalWords, onRetry }: ResultViewProps) {
    const stars = calculateStars(score, totalWords);

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center">
            <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map((star) => (
                    <motion.div
                        key={star}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 + star * 0.1, type: "spring" }}
                    >
                        <StarIcon
                            size={40}
                            className={`${star <= stars
                                ? "text-amber-400 fill-current"
                                : "text-slate-200"
                                } drop-shadow-lg`}
                        />
                    </motion.div>
                ))}
            </div>
            <div className="w-24 h-24 aura-gradient-primary rounded-4xl flex items-center justify-center mx-auto mb-8 text-white shadow-xl">
                <span className="text-3xl font-black">{Math.round((score / totalWords) * 100)}%</span>
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Well Done!</h2>
            <p className="text-slate-500 font-medium mb-12">
                You balanced {score} out of {totalWords} items.
            </p>
            <div className="flex flex-col gap-4 w-full">
                <button
                    onClick={onRetry}
                    className="w-full aura-gradient-primary text-white h-16 rounded-2xl font-black transition-all shadow-xl hover:scale-[1.02] active:scale-95"
                >
                    Try Again
                </button>

                <Link
                    href="/map"
                    className="w-full bg-sky-400 border-b-4 border-sky-600 text-sky-900 h-16 rounded-2xl font-black transition-all shadow-lg hover:bg-sky-300 flex items-center justify-center gap-2 active:translate-y-1 active:shadow-none"
                >
                    <MapIcon size={20} />
                    Back to Map
                </Link>

                <Link
                    href="/"
                    className="w-full bg-slate-100 text-slate-500 h-14 rounded-2xl font-bold transition-all hover:bg-slate-200 flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Dashboard
                </Link>
            </div>
        </motion.div>
    );
}
