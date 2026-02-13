import { useState, useEffect, useCallback } from "react";
import { Quest } from "@/types";
import { questService } from "@/services/questService";

export const useQuests = () => {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchQuests = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await questService.getQuests();
            setQuests(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch quests"));
            console.error("Failed to fetch quests:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuests();
    }, [fetchQuests]);

    return {
        quests,
        isLoading,
        error,
        refreshQuests: fetchQuests,
    };
};
