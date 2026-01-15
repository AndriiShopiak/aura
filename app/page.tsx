"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Play, RotateCcw, Mic, MicOff, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

/**
 * Robust trainer logic with simplified Speech & TTS handling.
 */

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

const TIMER_START = 6;

export default function Home() {
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
        console.log("Mic stopped manually");
      } catch { }
    }
  }, []);

  const startMic = useCallback(() => {
    if (recognitionRef.current && statusRef.current.playing && !statusRef.current.busy && !statusRef.current.feedback) {
      if (statusRef.current.starting) return;
      try {
        statusRef.current.starting = true;
        recognitionRef.current.start();
        console.log("Mic starting...");
      } catch (e) {
        console.log("Mic start attempt failed (likely already active)");
      } finally {
        // Reset starting flag after a short delay
        setTimeout(() => { statusRef.current.starting = false; }, 200);
      }
    }
  }, []);

  // Use a watchdog to ensure mic is ALWAYS listening if it should be
  useEffect(() => {
    watchdogRef.current = setInterval(() => {
      if (statusRef.current.playing && !statusRef.current.busy && !statusRef.current.feedback && !isListening) {
        console.log("Watchdog: Mic seems inactive. Force restarting...");
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
      if (n < NUMBERS.length) {
        setSpokenText("");
        setFeedback(null);
        setTimeLeft(TIMER_START);
        return n;
      }
      setGameState("result");
      return prev;
    });
  }, []);

  const triggerResult = useCallback((correct: boolean) => {
    if (statusRef.current.feedback) return;
    statusRef.current.feedback = correct ? "correct" : "wrong"; // Immediate ref update
    stopMic();
    if (correct) {
      setFeedback("correct");
      setScore(s => s + 1);
      setTimeout(handleNext, 1200);
    } else {
      setFeedback("wrong");
      speak(NUMBERS[statusRef.current.index].word);
      setTimeout(handleNext, 2200);
    }
  }, [handleNext, speak, stopMic]);

  // Mic Logic Initialization
  useEffect(() => {
    const Speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Speech) return;

    const rec = new Speech();
    rec.continuous = false; // False is more stable for turn-based interaction
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 3;

    rec.onstart = () => {
      setIsListening(true);
      console.log("Mic Event: onstart");
    };

    rec.onend = () => {
      setIsListening(false);
      console.log("Mic Event: onend");
      // Re-trigger if still supposed to listen
      if (statusRef.current.playing && !statusRef.current.busy && !statusRef.current.feedback) {
        setTimeout(startMic, 150);
      }
    };

    rec.onerror = (e: any) => {
      console.warn("Mic Event: onerror", e.error);
      if (e.error === 'not-allowed') alert("Please allow microphone access in your browser settings.");
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

      const target = NUMBERS[statusRef.current.index];
      const match = [target.word, ...target.alts].some(m => {
        const words = txt.split(/\s+/);
        // Direct match or contains word (be careful with "to" vs "two" etc)
        return words.includes(m) || txt === m || txt.endsWith(m) || txt.split(" ").some(w => w === m);
      });

      if (match) {
        console.log("Recognition Match Found:", txt);
        triggerResult(true);
      }
    };

    recognitionRef.current = rec;
    return () => {
      rec.onend = null;
      rec.stop();
    };
  }, [triggerResult, startMic]);

  // Timer loop - ONLY ticks when mic is active and listening
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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-white border border-neutral-200 rounded-4xl p-8 shadow-xl relative overflow-hidden transition-all duration-500">

        {/* Feedack Overlays */}
        <AnimatePresence>
          {feedback === "correct" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-emerald-50/50 pointer-events-none z-0" />
          )}
          {feedback === "wrong" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-rose-50/50 pointer-events-none z-0" />
          )}
        </AnimatePresence>

        <header className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-neutral-800">English Trainer</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isListening ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-neutral-300"}`} />
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                {isListening ? "Listening" : "Standby"}
              </span>
            </div>
          </div>
          <div className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 flex flex-col items-center min-w-16">
            <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-bold">Score</span>
            <span className="text-2xl font-mono font-bold text-indigo-600 leading-none">{score}</span>
          </div>
        </header>

        <main className="relative z-10 flex flex-col items-center min-h-[340px] justify-center text-center">
          <AnimatePresence mode="wait">
            {gameState === "idle" && (
              <motion.div key="idle" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="w-full">
                <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-200 text-white">
                  <Mic size={40} />
                </div>
                <h2 className="text-2xl font-black text-neutral-800 mb-2">Numbers 1-10</h2>
                <p className="text-neutral-400 text-sm mb-10 px-4">
                  Learn to pronounce English numbers. Speak clearly when the timer starts.
                </p>
                <button onClick={startGame} className="group w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white h-16 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3">
                  <Play size={20} fill="currentColor" />
                  Get Started
                </button>
              </motion.div>
            )}

            {gameState === "playing" && (
              <motion.div key={NUMBERS[idx].value} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full flex flex-col items-center">

                {/* Timer Circle */}
                <div className="relative w-40 h-40 flex items-center justify-center mb-8">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r="74" fill="transparent" stroke="#f5f5f5" strokeWidth="8" />
                    <motion.circle
                      cx="80" cy="80" r="74" fill="transparent" stroke={timeLeft < 2 ? "#f43f5e" : "#4f46e5"} strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 74}
                      animate={{ strokeDashoffset: (1 - timeLeft / TIMER_START) * 2 * Math.PI * 74 }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </svg>
                  <span className="text-8xl font-black text-neutral-800 tracking-tight">{NUMBERS[idx].value}</span>
                </div>

                <div className="w-full bg-neutral-50 rounded-2xl p-4 border border-neutral-100 mb-6 min-h-20 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-neutral-300 tracking-[0.2em] mb-1">Live Transcript</span>
                  <p className={`text-lg font-bold leading-tight ${spokenText ? 'text-indigo-600 italic' : 'text-neutral-300'}`}>
                    {spokenText ? `"${spokenText}"` : "Waiting for voice..."}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => speak(NUMBERS[idx].word)} className="p-4 rounded-xl bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors shadow-sm">
                    <Volume2 size={24} />
                  </button>
                  <button onClick={startMic} className={`p-4 rounded-xl border transition-all ${isListening ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-neutral-200 text-neutral-400 opacity-50'}`}>
                    <Mic size={24} />
                  </button>
                </div>

                <AnimatePresence>
                  {feedback && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 px-4 py-2 rounded-full border text-xs font-black uppercase tracking-widest flex items-center gap-2 ${feedback === 'correct' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                      {feedback === 'correct' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {feedback === 'correct' ? 'Excellent!' : `It's "${NUMBERS[idx].word}"`}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {gameState === "result" && (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                <div className="mb-6">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block mb-2">Session Complete</span>
                  <div className="text-8xl font-black text-indigo-600">{Math.round((score / NUMBERS.length) * 100)}<span className="text-3xl text-indigo-300">%</span></div>
                </div>
                <div className="text-neutral-500 text-sm mb-10 font-medium">
                  You pronounced <strong className="text-neutral-800">{score} out of {NUMBERS.length}</strong> numbers correctly. Keep practicing!
                </div>
                <button onClick={startGame} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-16 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3">
                  <RotateCcw size={20} />
                  New Session
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <p className="mt-8 text-neutral-300 text-[10px] font-bold uppercase tracking-widest">
        English Numbers Speech Trainer v2.0
      </p>
    </div>
  );
}
