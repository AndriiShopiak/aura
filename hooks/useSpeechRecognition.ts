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

    const recognitionRef = useRef<any>(null);
    const isMountedRef = useRef(true);

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
                const target = targetWord?.toLowerCase().trim();
                const alts = alternativeWords.map(a => a.toLowerCase().trim());

                // We want to check the most recent results
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i][0].transcript.toLowerCase().trim();
                    // Remove punctuation that might be added by mobile browsers
                    const spoke = result.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();

                    currentTranscript += event.results[i][0].transcript;

                    if (target) {
                        const normalizedTarget = target.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
                        const matchesTarget = spoke === normalizedTarget || spoke.includes(normalizedTarget);
                        const matchesAlts = alts.some(a => {
                            const normalizedAlt = a.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
                            return spoke === normalizedAlt || spoke.includes(normalizedAlt);
                        });

                        if (matchesTarget || matchesAlts) {
                            if (onMatch) onMatch(spoke);
                            return;
                        }
                    }
                }

                setTranscript(currentTranscript);
                if (onResult) onResult(currentTranscript, event.results[event.results.length - 1].isFinal);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.error("Error starting speech recognition:", err);
            setIsListening(false);
        }
    }, [targetWord, alternativeWords, onMatch, onResult, stop]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            stop();
        };
    }, [stop]);

    return {
        isListening,
        transcript,
        volume: 0, // Keep volume for API compatibility but return 0
        start,
        stop,
        setTranscript
    };
}

