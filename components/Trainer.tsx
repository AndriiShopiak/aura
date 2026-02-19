"use client";

import { useEffect, useCallback } from "react";
import { Word } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTrainerLogic } from "@/hooks/useTrainerLogic";
import { TrainerHeader } from "./trainer/TrainerHeader";
import { PlayingView } from "./trainer/PlayingView";
import { ResultView } from "./trainer/ResultView";
import { IdleView } from "./trainer/IdleView";

interface TrainerProps {
    lessonId: string;
    title: string;
    words: Word[];
    responseTimer: number;
    onComplete?: (score: number) => void;
}

export default function Trainer({ lessonId, title, words, responseTimer, onComplete }: TrainerProps) {
    const {
        gameState,
        currentIndex,
        score,
        timeLeft,
        isCorrect,
        triggerMatch,
        reset,
        startLesson,
    } = useTrainerLogic({
        lessonId,
        words,
        responseTimer,
        onComplete,
    });

    const currentWord = words[currentIndex];

    const {
        isListening,
        transcript,
        volume,
        start: startSpeech,
        stop: stopSpeech,
        setTranscript,
    } = useSpeechRecognition({
        targetWord: currentWord?.word,
        alternativeWords: currentWord?.alts,
        onMatch: triggerMatch,
    });

    const handleStart = useCallback(() => {
        startSpeech();
        startLesson();
    }, [startSpeech, startLesson]);

    // Automatically manage speech recognition based on game state
    useEffect(() => {
        if (gameState === "playing" && !isListening && !isCorrect) {
            startSpeech();
        } else if (gameState === "result" || isCorrect) {
            stopSpeech();
        }
    }, [gameState, isListening, isCorrect, startSpeech, stopSpeech]);

    const handleRetry = useCallback(() => {
        setTranscript("");
        reset();
    }, [reset, setTranscript]);

    return (
        <div className="w-full max-w-md aura-card aura-glass p-0 relative overflow-hidden transition-all duration-500 shadow-2xl border-white/40">
            <TrainerHeader title={title} />

            <div className={`p-10 relative z-10 min-h-[440px] flex flex-col items-center justify-center transition-colors duration-500 ${isCorrect ? 'bg-green-500/10' : ''}`}>
                {gameState === "idle" && (
                    <IdleView
                        title={title}
                        wordCount={words.length}
                        onStart={handleStart}
                    />
                )}

                {gameState === "playing" && (
                    <PlayingView
                        words={words}
                        currentIndex={currentIndex}
                        timeLeft={timeLeft}
                        responseTimer={responseTimer}
                        isListening={isListening}
                        volume={volume}
                        transcript={transcript}
                        isCorrect={isCorrect}
                        onStartListening={startSpeech}
                        onStopListening={stopSpeech}
                    />
                )}

                {gameState === "result" && (
                    <ResultView
                        score={score}
                        totalWords={words.length}
                        onRetry={handleRetry}
                    />
                )}
            </div>
        </div>
    );
}

