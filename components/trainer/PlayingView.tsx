"use client";

import { Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Word } from "@/types";

interface PlayingViewProps {
    words: Word[];
    currentIndex: number;
    timeLeft: number;
    responseTimer: number;
    isListening: boolean;
    volume: number;
    transcript: string;
    isCorrect: boolean;
    onStartListening: () => void;
    onStopListening: () => void;
}

export function PlayingView({
    words,
    currentIndex,
    timeLeft,
    responseTimer,
    isListening,
    volume,
    transcript,
    isCorrect,
    onStartListening,
    onStopListening,
}: PlayingViewProps) {
    return (
        <div className="w-full text-center flex flex-col items-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">
                Step 1: Speech Recognition
            </p>

            <div className="relative mb-12">
                <AnimatePresence mode="wait">
                    {isListening ? (
                        <motion.div
                            key="listening"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative"
                        >
                            <motion.div
                                animate={{
                                    scale: 1 + volume * 0.5,
                                    backgroundColor: isCorrect ? "#22c55e" : "#5d5dff"
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="w-24 h-24 rounded-4xl flex items-center justify-center shadow-xl text-white z-10 relative"
                            >
                                <Mic size={40} />
                            </motion.div>
                            <motion.div
                                animate={{
                                    scale: 1 + volume * 2,
                                    opacity: 0.5 - volume * 0.3
                                }}
                                transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                                className="absolute inset-0 bg-blue-500/20 rounded-4xl z-0"
                            />
                        </motion.div>
                    ) : (
                        <motion.button
                            key="idle-mic"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={onStartListening}
                            className="w-24 h-24 bg-white border-2 border-slate-100 rounded-4xl flex items-center justify-center shadow-sm text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all group"
                        >
                            <Mic size={40} className="group-hover:scale-110 transition-transform" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <div className="w-full mb-8">
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Time Remaining
                    </span>
                    <span className={`text-sm font-black ${timeLeft <= 3 ? 'text-rose-500 animate-pulse' : 'text-slate-600'}`}>
                        {timeLeft}s
                    </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: `${(timeLeft / responseTimer) * 100}%` }}
                        className={`h-full ${timeLeft <= 3 ? 'bg-rose-500' : 'bg-blue-500'}`}
                    />
                </div>
            </div>

            <div className="mb-8">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">
                    Say this word:
                    <span className="ml-2 text-slate-300">({currentIndex + 1}/{words.length})</span>
                </p>
                <h3 className="text-4xl font-black text-slate-800 tracking-tight">
                    {words[currentIndex]?.value}
                </h3>
            </div>
        </div>
    );
}
