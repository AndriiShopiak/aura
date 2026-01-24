"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Play, RotateCcw, Mic, MicOff, CheckCircle2, XCircle, ArrowLeft, Zap, Trophy } from "lucide-react";
import { Word } from "@/types";
import Link from "next/link";

interface TrainerProps {
    title: string;
    words: Word[];
    onComplete?: (score: number) => void;
}

const TIMER_START = 6;

export default function Trainer({ title, words, onComplete }: TrainerProps) {
    const [gameState, setGameState] = useState<"idle" | "playing" | "result">("idle");
    const [idx, setIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIMER_START);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [spokenText, setSpokenText] = useState("");
    const [isListening, setIsListening] = useState(false);

    // Refs for stable logic access
    const recognitionRef = useRef<any>(null);
    const watchdogRef = useRef<NodeJS.Timeout | null>(null);
    const statusRef = useRef({
        playing: false,
        busy: false,
        index: 0,
        feedback: feedback,
        starting: false
    });

    // Sync refs to state
    useEffect(() => {
        statusRef.current.playing = gameState === "playing";
        statusRef.current.index = idx;
        statusRef.current.feedback = feedback;
    }, [gameState, idx, feedback]);

    const stopMic = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch { }
        }
    }, []);

    const startMic = useCallback(() => {
        if (recognitionRef.current && statusRef.current.playing && !statusRef.current.busy && !statusRef.current.feedback) {
            if (statusRef.current.starting) return;
            try {
                statusRef.current.starting = true;
                recognitionRef.current.start();
            } catch (e) {
            } finally {
                setTimeout(() => { statusRef.current.starting = false; }, 200);
            }
        }
    }, []);

    useEffect(() => {
        watchdogRef.current = setInterval(() => {
            if (statusRef.current.playing && !statusRef.current.busy && !statusRef.current.feedback && !isListening) {
                startMic();
            }
        }, 1500);
        return () => { if (watchdogRef.current) clearInterval(watchdogRef.current); };
    }, [isListening, startMic]);

    const speak = useCallback((text: string) => {
        if (!("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = "en-US";

        utt.onstart = () => { statusRef.current.busy = true; stopMic(); };
        utt.onend = () => {
            setTimeout(() => {
                statusRef.current.busy = false;
                if (statusRef.current.playing && !statusRef.current.feedback) startMic();
            }, 400);
        };
        window.speechSynthesis.speak(utt);
    }, [stopMic, startMic]);

    const handleNext = useCallback(() => {
        setIdx(prev => {
            const n = prev + 1;
            if (n < words.length) {
                setSpokenText("");
                setFeedback(null);
                setTimeLeft(TIMER_START);
                return n;
            }
            setGameState("result");
            if (onComplete) onComplete(score);
            return prev;
        });
    }, [words.length, score, onComplete]);

    const triggerResult = useCallback((correct: boolean) => {
        if (statusRef.current.feedback) return;
        statusRef.current.feedback = correct ? "correct" : "wrong";
        stopMic();
        if (correct) {
            setFeedback("correct");
            setScore(s => s + 1);
            setTimeout(handleNext, 1200);
        } else {
            setFeedback("wrong");
            speak(words[statusRef.current.index].word);
            setTimeout(handleNext, 2200);
        }
    }, [handleNext, speak, stopMic, words]);

    useEffect(() => {
        const Speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!Speech) return;

        const rec = new Speech();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = "en-US";
        rec.maxAlternatives = 3;

        rec.onstart = () => setIsListening(true);
        rec.onend = () => {
            setIsListening(false);
            if (statusRef.current.playing && !statusRef.current.busy && !statusRef.current.feedback) {
                setTimeout(startMic, 150);
            }
        };

        rec.onerror = (e: any) => {
            setIsListening(false);
        };

        rec.onresult = (e: any) => {
            if (statusRef.current.busy || statusRef.current.feedback) return;

            const txt = Array.from(e.results)
                .map((r: any) => r[0].transcript)
                .join("")
                .toLowerCase()
                .trim();

            setSpokenText(txt);

            const target = words[statusRef.current.index];
            const match = [target.word, ...(target.alts || [])].some(m => {
                const wordsArr = txt.split(/\s+/);
                return wordsArr.includes(m.toLowerCase()) || txt === m.toLowerCase() || txt.endsWith(m.toLowerCase());
            });

            if (match) {
                triggerResult(true);
            }
        };

        recognitionRef.current = rec;
        return () => {
            rec.onend = null;
            rec.stop();
        };
    }, [triggerResult, startMic, words]);

    useEffect(() => {
        let t: any;
        if (gameState === "playing" && !feedback && isListening) {
            t = setInterval(() => {
                setTimeLeft(v => {
                    if (v <= 1) {
                        triggerResult(false);
                        return 0;
                    }
                    return v - 1;
                });
            }, 1000);
        }
        return () => clearInterval(t);
    }, [gameState, feedback, isListening, triggerResult]);

    const startGame = () => {
        setIdx(0);
        setScore(0);
        setFeedback(null);
        setSpokenText("");
        setTimeLeft(TIMER_START);
        setGameState("playing");
        statusRef.current.busy = false;
        startMic();
    };

    return (
        <div className="w-full max-w-md aura-card aura-glass p-0 relative overflow-hidden transition-all duration-500 shadow-2xl border-white/40">
            {/* Header / Scoreboard */}
            <div className="aura-gradient-primary p-6 text-white relative z-10 flex justify-between items-center">
                <div className="flex flex-col">
                    <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-all mb-2 group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
                    </Link>
                    <h1 className="text-xl font-black tracking-tight">{title}</h1>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20 flex items-center gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-sky-200">Score</span>
                        <span className="text-2xl font-black leading-none">{score}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-10 relative z-10 min-h-[440px] flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                    {gameState === "idle" && (
                        <motion.div key="idle" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="w-full text-center">
                            <div className="w-24 h-24 aura-gradient-primary rounded-4xl flex items-center justify-center mx-auto mb-8 shadow-xl aura-logo-shadow text-white">
                                <Mic size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Pronunciation Master</h2>
                            <p className="text-slate-500 font-medium mb-12 px-6 leading-relaxed">
                                Get ready to speak! We'll show you words, and you'll have <span className="text-sky-600 font-black">6 seconds</span> to pronounce each one correctly.
                            </p>
                            <button onClick={startGame} className="w-full aura-gradient-primary text-white h-16 rounded-2xl font-black transition-all shadow-xl shadow-sky-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3">
                                <Play size={22} fill="currentColor" />
                                Start Training
                            </button>
                        </motion.div>
                    )}

                    {gameState === "playing" && (
                        <motion.div key={words[idx].value} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full flex flex-col items-center">
                            <div className="relative w-48 h-48 flex items-center justify-center mb-12">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="96" cy="96" r="90" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                                    <motion.circle
                                        cx="96" cy="96" r="90" fill="transparent" stroke={timeLeft < 2 ? "#f43f5e" : "#0ea5e9"} strokeWidth="10" strokeLinecap="round"
                                        strokeDasharray={2 * Math.PI * 90}
                                        animate={{ strokeDashoffset: (1 - timeLeft / TIMER_START) * 2 * Math.PI * 90 }}
                                        transition={{ duration: 1, ease: "linear" }}
                                    />
                                </svg>
                                <span className="text-9xl font-black text-slate-900 tracking-tighter drop-shadow-sm">{words[idx].value}</span>
                            </div>

                            <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-10 min-h-28 flex flex-col justify-center shadow-inner relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-sky-100/30 rounded-bl-3xl -mr-4 -mt-4 transition-all group-hover:bg-sky-100/50" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 relative z-10">AI Hearing System</span>
                                <p className={`text-xl font-bold leading-tight relative z-10 transition-colors ${spokenText ? 'text-sky-600' : 'text-slate-300'}`}>
                                    {spokenText ? `"${spokenText}"` : "Speak now..."}
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => speak(words[idx].word)} className="w-16 h-16 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-sky-600 hover:border-sky-600 hover:shadow-lg transition-all flex items-center justify-center group shadow-sm">
                                    <Volume2 size={24} className="group-hover:scale-110 transition-transform" />
                                </button>
                                <div className={`w-16 h-16 rounded-2xl border transition-all flex items-center justify-center ${isListening ? 'bg-sky-50 border-sky-400 text-sky-600 shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                                    <Mic size={24} className={isListening ? "animate-pulse" : ""} />
                                </div>
                            </div>

                            <AnimatePresence>
                                {feedback && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`mt-8 px-8 py-3 rounded-full border text-xs font-black uppercase tracking-[0.15em] flex items-center gap-3 shadow-sm ${feedback === 'correct' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 aura-logo-shadow shadow-emerald-200/50' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                        {feedback === 'correct' ? <Zap size={16} className="fill-current" /> : <XCircle size={16} className="fill-current" />}
                                        {feedback === 'correct' ? 'Perfect Match!' : `Try again: "${words[idx].word}"`}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {gameState === "result" && (
                        <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center">
                            <div className="mb-10 relative">
                                <div className="w-32 h-32 aura-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl text-white relative z-10">
                                    <Trophy size={64} />
                                </div>
                                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 block mb-3">Session Complete</span>
                                <div className="text-8xl font-black text-slate-900 tracking-tighter">
                                    {Math.round((score / words.length) * 100)}<span className="text-3xl text-sky-500">%</span>
                                </div>
                            </div>
                            <p className="text-slate-500 font-medium mb-12 leading-relaxed">
                                Great job! You correctly pronounced <strong className="text-slate-900 font-black">{score} / {words.length}</strong> words.
                                Accuracy is the key to fluency!
                            </p>
                            <button onClick={startGame} className="w-full aura-gradient-primary text-white h-16 rounded-2xl font-black shadow-xl shadow-sky-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                                <RotateCcw size={22} />
                                Practice Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Background effects */}
            <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-500 ${feedback === "correct" ? "opacity-100" : "opacity-0"}`}>
                <div className="absolute inset-0 bg-emerald-500/5" />
                <div className="absolute top-0 w-full h-1 aura-gradient-primary" />
            </div>
            <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-500 ${feedback === "wrong" ? "opacity-100" : "opacity-0"}`}>
                <div className="absolute inset-0 bg-rose-500/5" />
            </div>
        </div>
    );
}
