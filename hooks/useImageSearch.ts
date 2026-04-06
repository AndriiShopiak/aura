import { useState, useEffect, useRef } from "react";

export interface UnsplashPhoto {
    id: string;
    thumbUrl: string;
    fullUrl: string;
    altDescription: string;
    authorName: string;
    authorLink: string;
}

// ─── Keyword Extraction (Level 2) ────────────────────────────────────────────
const STOP_WORDS = new Set([
    "it's", "its", "it", "is", "a", "an", "the", "this", "that", "these", "those",
    "i", "you", "he", "she", "we", "they", "me", "him", "her", "us", "them",
    "am", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "may", "might",
    "my", "your", "his", "our", "their", "its",
    "and", "or", "but", "of", "in", "on", "at", "to", "for", "with", "by",
    "from", "up", "about", "into", "through", "there", "here", "not", "no",
    "what", "who", "where", "when", "how", "why",
]);

export function extractSearchQuery(phrase: string): string {
    if (!phrase.trim()) return "";

    const cleaned = phrase
        .toLowerCase()
        .replace(/[''`]/g, "'")   // normalize apostrophes
        .replace(/[^a-z0-9'\s-]/g, " ") // remove punctuation except apostrophe/hyphen
        .trim();

    const words = cleaned.split(/\s+/);
    const keywords = words.filter((w) => !STOP_WORDS.has(w) && w.length > 1);

    if (keywords.length === 0) return phrase.trim();
    return keywords.join(" ");
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
interface UseImageSearchReturn {
    photos: UnsplashPhoto[];
    isLoading: boolean;
    error: string | null;
    errorCode: string | null;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    search: (q: string) => void;
    clear: () => void;
}

export function useImageSearch(initialPhrase: string = ""): UseImageSearchReturn {
    const [searchQuery, setSearchQuery] = useState(() => extractSearchQuery(initialPhrase));
    const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const search = async (q: string) => {
        const trimmed = q.trim();
        if (!trimmed) return;

        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setIsLoading(true);
        setError(null);
        setErrorCode(null);

        try {
            const res = await fetch(
                `/api/images/search?q=${encodeURIComponent(trimmed)}`,
                { signal: abortRef.current.signal }
            );

            const data = await res.json();

            if (!res.ok) {
                setErrorCode(data.errorCode ?? null);
                setError(data.error ?? "Failed to fetch");
                setPhotos([]);
                return;
            }

            setPhotos(data.photos ?? []);
        } catch (err: any) {
            if (err.name !== "AbortError") {
                setError("Couldn't load images. Try again.");
                setPhotos([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const clear = () => {
        abortRef.current?.abort();
        setPhotos([]);
        setError(null);
        setErrorCode(null);
        setIsLoading(false);
    };

    return { photos, isLoading, error, errorCode, searchQuery, setSearchQuery, search, clear };
}
