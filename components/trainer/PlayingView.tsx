"use client";

import { Mic, MicOff, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Word } from "@/types";

interface PlayingViewProps {
    words: Word[];
    currentIndex: number;
    timeLeft: number;
    responseTimer: number;
    isListening: boolean;
    isFinal: boolean;
    isTimeout: boolean;
    volume: number;
    transcript: string;
    isCorrect: boolean;
    stage: "with-hint" | "recall";
    onStartListening: () => void;
    onStopListening: () => void;
}

export function PlayingView({
    words,
    currentIndex,
    timeLeft,
    responseTimer,
    isListening,
    isFinal,
    isTimeout,
    volume,
    transcript,
    isCorrect,
    stage,
    onStartListening,
    onStopListening,
}: PlayingViewProps) {
    const totalWords = words.length;
    const stage1Progress = stage === "with-hint" ? (currentIndex / totalWords) * 100 : 100;
    const stage2Progress = stage === "recall" ? (currentIndex / totalWords) * 100 : 0;

    // isMismatch = є фінальний транскрипт, НІ матчу, НІ коректної відповіді.
    // Важливо: isCorrect перевіряємо першим — якщо матч вже зафіксовано,
    // ми НЕ показуємо помилку навіть якщо isFinal теж true.
    // (React оновлює стан асинхронно, тому isCorrect може прийти чуть пізніше за isFinal)
    const isMismatch = !isCorrect && isFinal && transcript.trim().length > 0;
    const showFeedbackError = isMismatch || isTimeout;

    return (
        <div className="w-full text-center flex flex-col items-center">
            {/* 0. Prominent Timer */}
            <div className="mb-4 flex flex-col items-center">
                <motion.div
                    animate={timeLeft < 3 ? {
                        scale: [1, 1.1, 1],
                        color: ["#64748b", "#f43f5e", "#64748b"]
                    } : {}}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="flex flex-col items-center"
                >
                    <div className="flex items-center gap-2">
                        <Clock size={20} className={timeLeft < 3 ? 'text-rose-500' : 'text-slate-400'} />
                        <span className={`text-4xl font-black tabular-nums tracking-tight ${timeLeft < 3 ? 'text-rose-500' : 'text-slate-700'}`}>
                            {timeLeft}
                        </span>
                        <span className={`text-sm font-bold mt-2 ${timeLeft < 3 ? 'text-rose-400' : 'text-slate-400'}`}>
                            sec
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* 1. Dual Round Progress Bar */}
            <div className="w-full flex gap-2 mb-4 items-center px-1">
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                        <span className={`text-[7px] font-black uppercase tracking-tighter ${stage === "with-hint" ? "text-blue-500" : "text-slate-400"}`}>
                            Round 1: Hint
                        </span>
                        {stage === "with-hint" && (
                            <span className="text-[7px] font-bold text-slate-400">{currentIndex + 1}/{totalWords}</span>
                        )}
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stage1Progress}%` }}
                            className="h-full bg-blue-500 rounded-full"
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                        <span className={`text-[7px] font-black uppercase tracking-tighter ${stage === "recall" ? "text-indigo-500" : "text-slate-400"}`}>
                            Round 2: Recall
                        </span>
                        {stage === "recall" && (
                            <span className="text-[7px] font-bold text-slate-400">{currentIndex + 1}/{totalWords}</span>
                        )}
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stage2Progress}%` }}
                            className="h-full bg-indigo-500 rounded-full"
                        />
                    </div>
                </div>
            </div>

            {/* 1. Target Word & Image (Optimized Height) */}
            <motion.div
                animate={showFeedbackError ? { x: [-8, 8, -8, 8, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={`mb-4 w-full p-2 rounded-2xl transition-colors duration-300 ${showFeedbackError ? 'bg-rose-50' : ''}`}
            >
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] mb-2">
                    {stage === "with-hint" ? "Say this word:" : "Say from memory:"}
                </p>
                <div className="flex flex-col items-center gap-3">
                    {words[currentIndex]?.imageUrl && (
                        <div className="w-full h-36 flex items-center justify-center bg-white/50 rounded-2xl border border-white/40 shadow-inner overflow-hidden">
                            <img
                                src={words[currentIndex].imageUrl}
                                alt="Target visual"
                                className="max-h-full max-w-full object-contain p-2"
                            />
                        </div>
                    )}
                    <div className="flex flex-col items-center gap-0.5">
                        <h3 className={`text-3xl font-black tracking-tight transition-colors duration-300 ${showFeedbackError ? 'text-rose-500' : 'text-slate-800'}`}>
                            {words[currentIndex]?.value}
                        </h3>
                        {stage === "with-hint" && (
                            <motion.p
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`font-bold text-base uppercase tracking-wider transition-colors duration-300 ${showFeedbackError ? 'text-rose-400' : 'text-blue-500'}`}
                            >
                                {words[currentIndex]?.word}
                            </motion.p>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* 2. Microphone Interaction */}
            <div className="mb-2 flex flex-col items-center">
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
                                    backgroundColor: isCorrect ? "#22c55e" : showFeedbackError ? "#f43f5e" : "#5d5dff"
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg text-white z-10 relative"
                            >
                                <Mic size={32} />
                            </motion.div>
                            <motion.div
                                animate={{
                                    scale: 1 + volume * 2,
                                    opacity: 0.5 - volume * 0.3
                                }}
                                transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                                className={`absolute inset-0 rounded-3xl z-0 ${showFeedbackError ? 'bg-rose-500/20' : 'bg-blue-500/20'}`}
                            />
                        </motion.div>
                    ) : (
                        <motion.button
                            key="idle-mic"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={onStartListening}
                            className={`w-16 h-16 bg-white border-2 rounded-3xl flex items-center justify-center shadow-sm transition-all group ${showFeedbackError ? 'border-rose-100 text-rose-400' : 'border-slate-100 text-slate-400 hover:text-blue-500 hover:border-blue-200'}`}
                        >
                            <Mic size={32} className="group-hover:scale-110 transition-transform" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Transcript / Timeout Bubble (Integrated in Layout) */}
            <div className="h-12 flex items-center justify-center mb-2">
                <AnimatePresence>
                    {(transcript || isTimeout) && (
                        <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.9 }}
                            className={`px-3 py-1 rounded-xl text-[10px] font-bold shadow-md border backdrop-blur-md z-20 ${isCorrect
                                ? 'bg-green-500/90 text-white border-green-400'
                                : showFeedbackError
                                    ? 'bg-rose-500/90 text-white border-rose-400'
                                    : 'bg-white/90 text-slate-600 border-white/40'
                                }`}
                        >
                            {isTimeout ? "Time's up! 🕒" : (isMismatch ? `Try again: "${transcript}"` : transcript)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. Status Label & Progress (Dots removed by user, Timer moved to top) */}
            <div className="w-full mt-2" />
        </div>
    );
}
