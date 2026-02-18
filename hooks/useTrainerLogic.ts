"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Word } from "@/types";
import { calculateStars, saveLessonProgress } from "@/lib/progress";

interface UseTrainerLogicOptions {
    lessonId: string;
    words: Word[];
    responseTimer: number;
    onComplete?: (score: number) => void;
}

export function useTrainerLogic({
    lessonId,
    words,
    responseTimer,
    onComplete,
}: UseTrainerLogicOptions) {
    const [gameState, setGameState] = useState<"playing" | "result">("playing");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(responseTimer);
    const [isCorrect, setIsCorrect] = useState(false);

    const isTransitioningRef = useRef(false);
    const currentIndexRef = useRef(0);
    const scoreRef = useRef(0);

    // Sync refs
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

    const handleNext = useCallback(() => {
        if (isTransitioningRef.current) return;
        isTransitioningRef.current = true;

        setTimeout(() => {
            if (currentIndexRef.current < words.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setTimeLeft(responseTimer);
                setIsCorrect(false);
                isTransitioningRef.current = false;
            } else {
                setGameState("result");

                const finalScore = scoreRef.current;
                const maxScore = words.length;
                const finalStars = calculateStars(finalScore, maxScore);

                saveLessonProgress(lessonId, finalScore, finalStars);

                if (onComplete) onComplete(finalScore);
                isTransitioningRef.current = false;
            }
        }, 1000);
    }, [words.length, responseTimer, lessonId, onComplete]);

    const triggerMatch = useCallback(() => {
        setIsCorrect(true);
        setScore(s => {
            const newScore = s + 1;
            scoreRef.current = newScore;
            return newScore;
        });
        handleNext();
    }, [handleNext]);

    const reset = useCallback(() => {
        setGameState("playing");
        setCurrentIndex(0);
        setScore(0);
        scoreRef.current = 0;
        setTimeLeft(responseTimer);
        setIsCorrect(false);
        isTransitioningRef.current = false;
    }, [responseTimer]);

    // Timer logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (gameState === "playing" && !isCorrect) {
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
    }, [gameState, isCorrect, handleNext, responseTimer]);

    return {
        gameState,
        currentIndex,
        score,
        timeLeft,
        isCorrect,
        triggerMatch,
        reset,
        setIsCorrect
    };
}
