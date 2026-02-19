"use client";

import { Mic, Play } from "lucide-react";
import { motion } from "framer-motion";

interface IdleViewProps {
    title: string;
    wordCount: number;
    onStart: () => void;
}

export function IdleView({ title, wordCount, onStart }: IdleViewProps) {
    return (
        <div className="w-full text-center flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="w-24 h-24 bg-blue-500/10 rounded-4xl flex items-center justify-center text-blue-500 mb-6 mx-auto">
                    <Mic size={40} className="animate-pulse" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Ready to Start?</h2>
                <p className="text-slate-500 font-medium">
                    You'll practice {wordCount} words in this lesson.
                </p>
            </motion.div>

            <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                className="group relative px-10 h-16 aura-gradient-primary text-white rounded-2xl font-black text-sm transition-all shadow-xl hover:shadow-2xl flex items-center gap-3"
            >
                <Play size={15} fill="currentColor" />
                Start Lesson & Mic
                <div className="absolute -inset- rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
            </motion.button>

            <p className="mt-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 max-w-[200px]">
                Clicking start will request microphone access
            </p>
        </div>
    );
}
