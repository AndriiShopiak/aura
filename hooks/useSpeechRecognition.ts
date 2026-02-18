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
    const [volume, setVolume] = useState(0);

    const recognitionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isMountedRef = useRef(true);

    const stop = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort();
            } catch (e) {
                console.error("Error aborting recognition:", e);
            }
            recognitionRef.current = null;
        }

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

    const start = useCallback(async () => {
        if (typeof window === "undefined") return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        // Stop any existing instances
        stop();

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);

        recognitionRef.current.onresult = (event: any) => {
            let currentTranscript = "";
            const target = targetWord?.toLowerCase().trim();
            const alts = alternativeWords.map(a => a.toLowerCase().trim());

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const spoke = event.results[i][0].transcript.toLowerCase().trim();
                currentTranscript += event.results[i][0].transcript;

                if (target && (spoke === target || spoke.includes(target) || alts.some(a => spoke === a || spoke.includes(a)))) {
                    if (onMatch) onMatch(spoke);
                    return;
                }
            }

            setTranscript(currentTranscript);
            if (onResult) onResult(currentTranscript, event.results[event.results.length - 1].isFinal);
        };

        try {
            recognitionRef.current.start();

            // Audio Analysis for Volume
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
                setVolume(Math.min(1, average / 60));
                animationFrameRef.current = requestAnimationFrame(updateVolume);
            };
            updateVolume();
        } catch (err) {
            console.error("Error starting speech/audio:", err);
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
        volume,
        start,
        stop,
        setTranscript
    };
}
