"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, ArrowLeft, MicOff, Map as MapIcon } from "lucide-react";
import { Word } from "@/types";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { calculateStars, saveLessonProgress } from "@/lib/progress";
import { Star as StarIcon } from "lucide-react";

interface TrainerProps {
    lessonId: string;
    title: string;
    words: Word[];
    responseTimer: number;
    onComplete?: (score: number) => void;
}

export default function Trainer({ lessonId, title, words, responseTimer, onComplete }: TrainerProps) {
    const [gameState, setGameState] = useState<"playing" | "result">("playing");
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [volume, setVolume] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(responseTimer);
    const [isCorrect, setIsCorrect] = useState(false);

    const recognitionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isTransitioningRef = useRef(false);
    const currentIndexRef = useRef(0);
    const isCorrectRef = useRef(false);
    const scoreRef = useRef(0);
    const isMountedRef = useRef(true);

    // Synchronize refs with state for use in async/closure-bound functions
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        isCorrectRef.current = isCorrect;
    }, [isCorrect]);

    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

    const stopListening = useCallback(() => {
        // Зупинка розпізнавання
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort();
            } catch (e) {
                console.error("Error aborting recognition:", e);
            }
            recognitionRef.current = null;
        }

        // Очищення Audio API
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (audioContextRef.current) {
            try {
                audioContextRef.current.close();
            } catch (e) {
                console.error("Error closing audio context:", e);
            }
            audioContextRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setVolume(0);
        setIsListening(false);
    }, []);

    const handleNext = useCallback(() => {
        if (isTransitioningRef.current) return;
        isTransitioningRef.current = true;

        setTimeout(() => {
            if (currentIndexRef.current < words.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setTimeLeft(responseTimer);
                setIsCorrect(false);
                setTranscript("");
                isTransitioningRef.current = false;
            } else {
                setGameState("result");
                stopListening();

                // Calculate and save progress using Ref for latest value
                const finalScore = scoreRef.current;
                const maxScore = words.length;
                const finalStars = calculateStars(finalScore, maxScore);

                saveLessonProgress(lessonId, finalScore, finalStars);

                if (onComplete) onComplete(finalScore);
                isTransitioningRef.current = false;
            }
        }, 1000);
    }, [words.length, responseTimer, stopListening, lessonId, onComplete]);

    const startListening = useCallback(async () => {
        if (typeof window !== "undefined") {
            // 1. Спроба розпізнавання мовлення
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onstart = () => setIsListening(true);
                recognitionRef.current.onend = () => setIsListening(false);

                recognitionRef.current.onresult = (event: any) => {
                    if (isTransitioningRef.current) return;

                    let currentTranscript = "";
                    const currentWord = words[currentIndexRef.current];
                    if (!currentWord || isCorrectRef.current) return;

                    const target = currentWord.word.toLowerCase().trim();
                    const alts = currentWord.alts?.map(a => a.toLowerCase().trim()) || [];

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const spoke = event.results[i][0].transcript.toLowerCase().trim();
                        currentTranscript += event.results[i][0].transcript;

                        if (spoke === target || spoke.includes(target) || alts.some(a => spoke === a || spoke.includes(a))) {
                            if (isCorrectRef.current) return;
                            setIsCorrect(true);
                            setScore(s => {
                                const newScore = s + 1;
                                scoreRef.current = newScore; // Синхронно оновлюємо ref перед handleNext
                                return newScore;
                            });
                            handleNext();
                            return;
                        }
                    }
                    setTranscript(currentTranscript);
                };

                recognitionRef.current.start();

                // 2. Налаштування Web Audio API для амплітуди
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

                    if (!isMountedRef.current) {
                        stream.getTracks().forEach(track => track.stop());
                        return;
                    }

                    streamRef.current = stream;

                    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const source = audioContext.createMediaStreamSource(stream);
                    const analyser = audioContext.createAnalyser();

                    analyser.fftSize = 256;
                    source.connect(analyser);

                    audioContextRef.current = audioContext;
                    analyserRef.current = analyser;

                    const dataArray = new Uint8Array(analyser.frequencyBinCount);

                    const updateVolume = () => {
                        if (!analyserRef.current) return;

                        analyserRef.current.getByteFrequencyData(dataArray);
                        let sum = 0;
                        for (let i = 0; i < dataArray.length; i++) {
                            sum += dataArray[i];
                        }
                        const average = sum / dataArray.length;
                        // Нормалізуємо значення (від 0 до 1), де 0 - тиша, 1 - гучно
                        const normalizedVolume = Math.min(1, average / 60);
                        setVolume(normalizedVolume);

                        animationFrameRef.current = requestAnimationFrame(updateVolume);
                    };

                    updateVolume();
                } catch (err) {
                    console.error("Error accessing microphone for AudioContext:", err);
                }
            } else {
                alert("Speech recognition is not supported in this browser.");
            }
        }
    }, [currentIndex, isCorrect, words, responseTimer, handleNext, stopListening]);


    useEffect(() => {
        if (gameState === "playing" && !isListening && !isCorrect) {
            startListening();
        }
    }, [gameState, isListening, isCorrect, startListening]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (gameState === "playing" && isListening && !isCorrect) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleNext();
                        return responseTimer;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [gameState, isListening, isCorrect, handleNext, responseTimer]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            stopListening();
        };
    }, [stopListening]);

    return (
        <div className="w-full max-w-md aura-card aura-glass p-0 relative overflow-hidden transition-all duration-500 shadow-2xl border-white/40">
            {/* Header */}
            <div className="aura-gradient-primary p-6 text-white relative z-10 flex justify-between items-center">
                <div className="flex flex-col">
                    <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-all mb-2 group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
                    </Link>
                    <h1 className="text-xl font-black tracking-tight">{title}</h1>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`p-10 relative z-10 min-h-[440px] flex flex-col items-center justify-center transition-colors duration-500 ${isCorrect ? 'bg-green-500/10' : ''}`}>

                {gameState === "playing" && (
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
                                                scale: 1 + volume * 2, // Хвиля розходиться сильніше
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
                                        onClick={startListening}
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

                        <div className="w-full min-h-[100px] p-6 rounded-2xl bg-white/50 border border-slate-100 mb-8 flex flex-col items-center justify-center backdrop-blur-sm">
                            {transcript ? (
                                <p className="text-xl font-bold text-slate-800 italic">"{transcript}"</p>
                            ) : (
                                <p className="text-slate-400 font-medium italic">Listening...</p>
                            )}
                        </div>
                        <pre className="text-slate-400 font-medium italic">{currentIndex}</pre>

                        {isListening ? (
                            <button
                                onClick={stopListening}
                                className="px-8 h-12 bg-rose-50 text-rose-600 rounded-xl font-black text-sm transition-all hover:bg-rose-100 flex items-center gap-2"
                            >
                                <MicOff size={16} />
                                Stop Listening
                            </button>
                        ) : (
                            <button
                                onClick={startListening}
                                className="px-8 h-12 aura-gradient-primary text-white rounded-xl font-black text-sm transition-all shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                Activate Microphone
                            </button>
                        )}
                    </div>
                )}

                {gameState === "result" && (
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
                                        className={`${star <= calculateStars(score, words.length)
                                            ? "text-amber-400 fill-current"
                                            : "text-slate-200"
                                            } drop-shadow-lg`}
                                    />
                                </motion.div>
                            ))}
                        </div>
                        <div className="w-24 h-24 aura-gradient-primary rounded-4xl flex items-center justify-center mx-auto mb-8 text-white shadow-xl">
                            <span className="text-3xl font-black">{Math.round((score / words.length) * 100)}%</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Well Done!</h2>
                        <p className="text-slate-500 font-medium mb-12">
                            You balanced {score} out of {words.length} items.
                        </p>
                        <div className="flex flex-col gap-4 w-full">
                            <button
                                onClick={() => {
                                    setGameState("playing");
                                    setCurrentIndex(0);
                                    setScore(0);
                                    scoreRef.current = 0;
                                    setTranscript("");
                                    setTimeLeft(responseTimer);
                                }}
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
                )}
            </div>
        </div>
    );
}
