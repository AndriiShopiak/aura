"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Play, RotateCcw, Mic, MicOff, CheckCircle2, XCircle } from "lucide-react";

const NUMBERS = [
    { value: 1, word: "one", alts: ["1"] },
    { value: 2, word: "two", alts: ["2", "to", "too"] },
    { value: 3, word: "three", alts: ["3"] },
    { value: 4, word: "four", alts: ["4", "for"] },
    { value: 5, word: "five", alts: ["5"] },
    { value: 6, word: "six", alts: ["6"] },
    { value: 7, word: "seven", alts: ["7"] },
    { value: 8, word: "eight", alts: ["8", "ate"] },
    { value: 9, word: "nine", alts: ["9"] },
    { value: 10, word: "ten", alts: ["10"] },
];

const TIMER_DURATION = 5; // seconds

export default function EnglishTrainer() {
    const [gameState, setGameState] = useState<"idle" | "playing" | "result">("idle");
    const [currentNumberIdx, setCurrentNumberIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [spokenText, setSpokenText] = useState("");
    const [autoPlay, setAutoPlay] = useState(true);

    const recognitionRef = useRef<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const currentWordRef = useRef<string>(NUMBERS[0].word);
    const currentAltsRef = useRef<string[]>(NUMBERS[0].alts);
    const isProcessingRef = useRef<boolean>(false);
    const gameStateRef = useRef<string>("idle");

    const currentNumber = NUMBERS[currentNumberIdx];

    // Update refs to latest state for use in callbacks
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    const speak = useCallback((text: string) => {
        if ("speechSynthesis" in window) {
            isProcessingRef.current = true;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";
            utterance.rate = 0.9;

            utterance.onstart = () => {
                isProcessingRef.current = true;
            };

            utterance.onend = () => {
                setTimeout(() => {
                    if (gameStateRef.current === "playing") {
                        isProcessingRef.current = false;
                    }
                }, 300);
            };

            window.speechSynthesis.speak(utterance);
        }
    }, []);

    const startNextRound = useCallback(() => {
        // Reset processing state
        isProcessingRef.current = false;

        setCurrentNumberIdx((prev) => {
            const nextIdx = prev + 1;
            if (nextIdx < NUMBERS.length) {
                const nextWord = NUMBERS[nextIdx].word;
                const nextAlts = NUMBERS[nextIdx].alts;
                currentWordRef.current = nextWord;
                currentAltsRef.current = nextAlts;
                setTimeLeft(TIMER_DURATION);
                setFeedback(null);
                setSpokenText("");
                if (autoPlay) speak(nextWord);
                return nextIdx;
            } else {
                setGameState("result");
                return prev;
            }
        });
    }, [autoPlay, speak]);

    const handleSuccess = useCallback(() => {
        if (isProcessingRef.current || feedback) return;
        isProcessingRef.current = true;
        setFeedback("correct");
        setScore((prev) => prev + 1);
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeout(startNextRound, 1500);
    }, [feedback, startNextRound]);

    const handleFailure = useCallback(() => {
        if (isProcessingRef.current || feedback) return;
        isProcessingRef.current = true;
        setFeedback("wrong");
        speak(currentWordRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeout(startNextRound, 2000);
    }, [feedback, speak, startNextRound]);

    // Use refs for callbacks in the Speech Recognition effect
    const handleSuccessRef = useRef(handleSuccess);
    useEffect(() => {
        handleSuccessRef.current = handleSuccess;
    }, [handleSuccess]);

    // Initialize Speech Recognition ONCE
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
            if (isProcessingRef.current || gameStateRef.current !== "playing") return;

            const lastResult = event.results[event.results.length - 1];
            const transcript = lastResult[0].transcript.toLowerCase().trim();
            setSpokenText(transcript);

            const target = currentWordRef.current;
            const alts = currentAltsRef.current;

            const isMatch = [target, ...alts].some(match => {
                // Match exact word, digit, or if the transcript contains the word
                const words = transcript.split(/\s+/);
                return words.includes(match) || transcript === match || transcript.includes(match);
            });

            if (isMatch) {
                handleSuccessRef.current();
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error !== 'aborted') console.error("Speech error:", event.error);
        };

        recognition.onend = () => {
            // Auto-restart if we're supposed to be listening
            if (gameStateRef.current === "playing") {
                try { recognition.start(); } catch { }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []); // Run once on mount

    // Control recognition start/stop based on gameState
    useEffect(() => {
        if (gameState === "playing") {
            setIsListening(true);
            try { recognitionRef.current?.start(); } catch { }
        } else {
            setIsListening(false);
            try { recognitionRef.current?.stop(); } catch { }
        }
    }, [gameState]);

    // Timer loop
    useEffect(() => {
        if (gameState === "playing" && !feedback) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleFailure();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [gameState, feedback, handleFailure]);

    const startGame = () => {
        setCurrentNumberIdx(0);
        setScore(0);
        setTimeLeft(TIMER_DURATION);
        setFeedback(null);
        setSpokenText("");
        isProcessingRef.current = false;
        currentWordRef.current = NUMBERS[0].word;
        currentAltsRef.current = NUMBERS[0].alts;
        setGameState("playing");
        if (autoPlay) speak(NUMBERS[0].word);
    };

    const restartGame = () => {
        startGame();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-4 font-sans selection:bg-indigo-500/30">
            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className={`absolute inset-0 transition-opacity duration-1000 ${feedback === "correct" ? "bg-emerald-500/10 opacity-100" :
                    feedback === "wrong" ? "bg-rose-500/10 opacity-100" : "opacity-0"
                    }`} />

                <header className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h1 className="text-xl font-bold bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            Number Trainer
                        </h1>
                        <p className="text-slate-400 text-sm">Level: 1-10</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Score</p>
                        <p className="text-2xl font-mono font-bold text-indigo-400">{score}</p>
                    </div>
                </header>

                <main className="relative z-10 min-h-[300px] flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        {gameState === "idle" && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-center"
                            >
                                <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
                                    <Mic size={40} />
                                </div>
                                <h2 className="text-2xl font-bold mb-4">Ready to start?</h2>
                                <p className="text-slate-400 mb-8 max-w-[250px] mx-auto">
                                    Say the number you see in English before the time runs out!
                                </p>
                                <button
                                    onClick={startGame}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25"
                                >
                                    <Play size={20} fill="currentColor" />
                                    Start Training
                                </button>
                            </motion.div>
                        )}

                        {gameState === "playing" && (
                            <motion.div
                                key={currentNumber.value}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full flex flex-col items-center"
                            >
                                {/* Timer Ring */}
                                <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            fill="transparent"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            className="text-slate-800"
                                        />
                                        <motion.circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            fill="transparent"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            strokeDasharray={2 * Math.PI * 88}
                                            animate={{ strokeDashoffset: (1 - timeLeft / TIMER_DURATION) * 2 * Math.PI * 88 }}
                                            transition={{ duration: 1, ease: "linear" }}
                                            className={`${timeLeft < 2 ? "text-rose-500" : "text-indigo-500"}`}
                                        />
                                    </svg>

                                    <span className="text-8xl font-black">{currentNumber.value}</span>
                                </div>

                                <div className="flex gap-4 mb-6">
                                    <button
                                        onClick={() => speak(currentNumber.word)}
                                        className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                        title="Listen"
                                    >
                                        <Volume2 size={24} />
                                    </button>
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isListening ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-400" : "bg-slate-800 border-slate-700 text-slate-500"}`}>
                                        {isListening ? <Mic size={18} className="animate-pulse" /> : <MicOff size={18} />}
                                        <span className="text-sm font-medium">{isListening ? "Listening..." : "Off"}</span>
                                    </div>
                                </div>

                                <div className="h-8 text-center">
                                    <p className="text-slate-400 italic">"{spokenText || "..."}"</p>
                                </div>

                                <AnimatePresence>
                                    {feedback && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="mt-4 flex items-center gap-2"
                                        >
                                            {feedback === "correct" ? (
                                                <>
                                                    <CheckCircle2 className="text-emerald-500" />
                                                    <span className="text-emerald-500 font-bold uppercase tracking-widest">Perfect!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="text-rose-500" />
                                                    <span className="text-rose-500 font-bold uppercase tracking-widest">It was "{currentNumber.word}"</span>
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {gameState === "result" && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <div className="text-slate-400 text-sm uppercase tracking-widest mb-2">Training Finished</div>
                                <div className="text-6xl font-black mb-6 text-indigo-400">{score}/{NUMBERS.length}</div>
                                <h3 className="text-2xl font-bold mb-8">
                                    {score === NUMBERS.length ? "Excellent! 🏆" : score > 5 ? "Good Job! 👍" : "Keep Practicing! 💪"}
                                </h3>
                                <button
                                    onClick={restartGame}
                                    className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all mx-auto"
                                >
                                    <RotateCcw size={20} />
                                    Retry Level
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                <footer className="mt-8 pt-8 border-t border-slate-800 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="autoplay"
                                checked={autoPlay}
                                onChange={(e) => setAutoPlay(e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
                            />
                            <label htmlFor="autoplay" className="text-xs text-slate-400 cursor-pointer">Auto-pronunciation</label>
                        </div>
                        <button
                            onClick={() => setGameState("idle")}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest font-bold"
                        >
                            Exit
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
