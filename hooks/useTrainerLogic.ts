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
    const [gameState, setGameState] = useState<"idle" | "playing" | "result">("idle");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(responseTimer);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isTimeout, setIsTimeout] = useState(false);
    const [stage, setStage] = useState<"with-hint" | "recall">("with-hint");

    const isTransitioningRef = useRef(false);
    const currentIndexRef = useRef(0);
    const scoreRef = useRef(0);
    // stageRef дозволяє handleNext завжди читати актуальне значення stage
    // без залежності від closure — інакше таймер міг читати застарілий stage
    const stageRef = useRef<"with-hint" | "recall">("with-hint");

    // Sync refs
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

    useEffect(() => {
        stageRef.current = stage;
    }, [stage]);

    const startLesson = useCallback(() => {
        setGameState("playing");
        setTimeLeft(responseTimer);
        setStage("with-hint");
        setIsTimeout(false);
    }, [responseTimer]);

    const handleNext = useCallback(() => {
        if (isTransitioningRef.current) return;
        isTransitioningRef.current = true;

        setTimeout(() => {
            if (currentIndexRef.current < words.length - 1) {
                // Move to next word in the current round
                setCurrentIndex(prev => prev + 1);
                setTimeLeft(responseTimer);
                setIsCorrect(false);
                setIsTimeout(false);
                isTransitioningRef.current = false;
            } else {
                // Reached the end of the round
                // Читаємо з ref, а не з closure — уникаємо stale stage
                if (stageRef.current === "with-hint") {
                    // Switch to Recall Round
                    setCurrentIndex(0);
                    setStage("recall");
                    setTimeLeft(responseTimer);
                    setIsCorrect(false);
                    setIsTimeout(false);
                    isTransitioningRef.current = false;
                } else {
                    // Finished Recall Round
                    setGameState("result");

                    const finalScore = scoreRef.current;
                    const maxPossibleScore = words.length * 2;
                    const finalStars = calculateStars(finalScore, maxPossibleScore);

                    saveLessonProgress(lessonId, finalScore, finalStars);

                    if (onComplete) onComplete(finalScore);
                    isTransitioningRef.current = false;
                }
            }
        }, 1000);
    // stage прибрано з deps — він читається через stageRef.current
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [words.length, responseTimer, lessonId, onComplete]);

    const triggerMatch = useCallback(() => {
        setIsCorrect(true);

        // Option B: Always count score for correct answers in both rounds
        setScore(s => {
            const newScore = s + 1;
            scoreRef.current = newScore;
            return newScore;
        });

        handleNext();
    }, [handleNext]);

    const reset = useCallback(() => {
        setGameState("idle");
        setCurrentIndex(0);
        setScore(0);
        scoreRef.current = 0;
        setTimeLeft(responseTimer);
        setIsCorrect(false);
        setStage("with-hint");
        setIsTimeout(false);
        isTransitioningRef.current = false;
    }, [responseTimer]);

    // Timer logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (gameState === "playing" && !isCorrect) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsTimeout(true);
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
        isTimeout,
        stage,
        triggerMatch,
        reset,
        setIsCorrect,
        startLesson
    };
}

