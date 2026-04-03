"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseSpeechRecognitionOptions {
    onResult?: (transcript: string, isFinal: boolean) => void;
    onMatch?: (transcript: string) => void;
    targetWord?: string;
    alternativeWords?: string[];
    onError?: (error: any) => void;
}

// ─── Matching Helpers ────────────────────────────────────────────────────────

/**
 * Приводить рядок до «канонічної» форми:
 * нижній регістр → прибираємо ВСЕ крім літер, цифр і пробілів → стискаємо пробіли.
 *
 * Чому так агресивно?
 *   "it's" → "its"   (апостроф зникає)
 *   "ruler." → "ruler" (крапка зникає)
 * Один підхід і до цілі, і до транскрипту → гарантована узгодженість.
 */
function normalize(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")  // залишаємо тільки літери, цифри, пробіли
        .replace(/\s+/g, " ")          // стискаємо подвійні пробіли
        .trim();
}

/**
 * Відстань Левенштейна — мінімальна кількість операцій (вставка/видалення/заміна)
 * щоб перетворити рядок `a` на рядок `b`.
 *
 * Приклад: levenshtein("aple", "apple") === 1  (одна вставка)
 */
function levenshtein(a: string, b: string): number {
    // dp[i][j] = відстань між першими i символами a та j символами b
    const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
        Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]                                // символи однакові — без змін
                : 1 + Math.min(
                    dp[i - 1][j],     // видалення
                    dp[i][j - 1],     // вставка
                    dp[i - 1][j - 1], // заміна
                );
        }
    }
    return dp[a.length][b.length];
}

/**
 * Схожість від 0 до 1:
 *   1.0 = ідентичні рядки
 *   0.0 = повністю різні
 *
 * Формула: 1 − (відстань / довжина_довшого_рядка)
 */
function similarity(a: string, b: string): number {
    if (a === b) return 1;
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - levenshtein(a, b) / maxLen;
}

/**
 * Адаптивна перевірка збігу вимовленого тексту з ціллю.
 *
 * Розрізняє два випадки:
 *
 * 1. ФРАЗА (ціль містить пробіл, наприклад "its a ruler"):
 *    → Порівнюємо весь нормалізований транскрипт з усією ціллю.
 *    → Спочатку перевіряємо substring ("its a ruler" є рядком у транскрипті).
 *    → Якщо ні — fuzzy similarity всієї фрази (дозволяє незначні помилки вимови).
 *    → Не ділимо на окремі слова: "ruler" ≠ "its a ruler".
 *
 * 2. ОДНЕ СЛОВО (ціль без пробілів, наприклад "cat"):
 *    → Ділимо транскрипт на окремі слова і перевіряємо кожне.
 *    → Запобігає хибним спрацюванням: "scatter" НЕ матчить "cat".
 *    → Дозволяємо fuzzy ≥ 82% для акцентів/незначних помилок.
 */
function spokenContains(spoke: string, target: string): boolean {
    const normalizedTarget = normalize(target);
    const normalizedSpoke = normalize(spoke);

    if (!normalizedTarget) return false;

    const isPhrase = normalizedTarget.includes(" ");

    if (isPhrase) {
        // Містить фразу як підрядок?
        if (normalizedSpoke.includes(normalizedTarget)) return true;
        // Або дуже схожа вся фраза? (Threshold нижчий — фрази довші, tolerant до 1-2 слів)
        return similarity(normalizedSpoke, normalizedTarget) >= 0.75;
    } else {
        // Одне слово: split → перевіряємо кожне слово окремо
        const spokenWords = normalizedSpoke.split(" ");
        return spokenWords.some(
            word => word === normalizedTarget || similarity(word, normalizedTarget) >= 0.82
        );
    }
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

                // Зчитуємо лише нові результати починаючи з event.resultIndex.
                // Це уникає повторної обробки старих сегментів у continuous-режимі.
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const raw = event.results[i][0].transcript;
                    if (event.results[i].isFinal) currentIsFinal = true;
                    currentTranscript += raw;

                    // Перевіряємо матч лише якщо є цільове слово
                    const currentTarget = targetWordRef.current;
                    if (!currentTarget) continue;

                    const allTargets = [currentTarget, ...alternativeWordsRef.current];

                    // spokenContains перевіряє кожне окреме слово транскрипту
                    // через точний + нечіткий збіг — see spokenContains() above
                    const matched = allTargets.some(t => spokenContains(raw, t));

                    if (matched) {
                        if (onMatchRef.current) onMatchRef.current(raw.trim());
                        setIsFinal(true);
                        return; // виходимо одразу — зайва обробка не потрібна
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

