import { useState, useEffect, useCallback } from "react";
import { Lesson } from "@/types";
import { lessonService } from "@/services/lessonService";

export const useLessons = () => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchLessons = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await lessonService.getLessons();
            setLessons(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch lessons"));
            console.error("Failed to fetch lessons:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLessons();
    }, [fetchLessons]);

    return {
        lessons,
        isLoading,
        error,
        refreshLessons: fetchLessons,
    };
};
