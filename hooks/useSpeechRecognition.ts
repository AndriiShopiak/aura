"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseSpeechRecognitionOptions {
    onResult?: (transcript: string, isFinal: boolean) => void;
    onMatch?: (transcript: string) => void;
    targetWord?: string;
    alternativeWords?: string[];
    onError?: (error: any) => void;
}

export function useSpeechRecognition({
    onResult,
    onMatch,
    targetWord,
    alternativeWords = [],
}: UseSpeechRecognitionOptions = {}) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isFinal, setIsFinal] = useState(false);

    const recognitionRef = useRef<any>(null);
    const isMountedRef = useRef(true);

    // Dynamic state refs to avoid stale closures in recognition callbacks
    const targetWordRef = useRef(targetWord);
    const alternativeWordsRef = useRef(alternativeWords);
    const onMatchRef = useRef(onMatch);

    // Keep refs in sync with props
    useEffect(() => {
        targetWordRef.current = targetWord;
        alternativeWordsRef.current = alternativeWords;
        onMatchRef.current = onMatch;
    }, [targetWord, alternativeWords, onMatch]);

    const stop = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.onresult = null;
                recognitionRef.current.onend = null;
                recognitionRef.current.onerror = null;
                recognitionRef.current.stop();
            } catch (e) {
                console.error("Error stopping recognition:", e);
            }
            recognitionRef.current = null;
        }
        setIsListening(false);
        setIsFinal(false);
    }, []);

    const start = useCallback(async () => {
        if (typeof window === "undefined") return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        // Stop any existing instances
        stop();
        setTranscript("");
        setIsFinal(false);

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                if (isMountedRef.current) setIsListening(true);
            };

            recognition.onend = () => {
                if (isMountedRef.current) setIsListening(false);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                if (isMountedRef.current) setIsListening(false);
            };

            recognition.onresult = (event: any) => {
                if (!isMountedRef.current) return;

                let currentTranscript = "";
                let currentIsFinal = false;
                const currentTarget = targetWordRef.current?.toLowerCase().trim();
                const currentAlts = alternativeWordsRef.current.map(a => a.toLowerCase().trim());

                // We want to check the most recent results
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i][0].transcript.toLowerCase().trim();
                    const isFinalResult = event.results[i].isFinal;
                    if (isFinalResult) currentIsFinal = true;

                    // Remove punctuation that might be added by mobile browsers
                    const spoke = result.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();

                    currentTranscript += event.results[i][0].transcript;

                    if (currentTarget) {
                        const normalizedTarget = currentTarget.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
                        const matchesTarget = spoke === normalizedTarget || spoke.includes(normalizedTarget);
                        const matchesAlts = currentAlts.some(a => {
                            const normalizedAlt = a.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
                            return spoke === normalizedAlt || spoke.includes(normalizedAlt);
                        });

                        if (matchesTarget || matchesAlts) {
                            if (onMatchRef.current) onMatchRef.current(spoke);
                            setIsFinal(true);
                            return;
                        }
                    }
                }

                setTranscript(currentTranscript);
                setIsFinal(currentIsFinal);
                if (onResult) onResult(currentTranscript, currentIsFinal);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.error("Error starting speech recognition:", err);
            setIsListening(false);
        }
    }, [onResult, stop]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            stop();
        };
    }, [stop]);

    // Reset state when targetWord changes to prevent stale feedback
    useEffect(() => {
        setTranscript("");
        setIsFinal(false);
    }, [targetWord]);

    return {
        isListening,
        transcript,
        isFinal,
        volume: 0, // Keep volume for API compatibility but return 0
        start,
        stop,
        setTranscript
    };
}

