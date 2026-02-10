import { useState, useCallback } from "react";
import { Word, Lesson } from "@/types";
import { lessonService } from "@/services/lessonService";

interface UseAdminEditorProps {
    adminKey: string;
    onSuccess: () => void;
}

export const useAdminEditor = ({ adminKey, onSuccess }: UseAdminEditorProps) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [responseTimer, setResponseTimer] = useState(6);
    const [words, setWords] = useState<Word[]>([{ value: "", word: "", alts: [] }]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetForm = useCallback(() => {
        setEditingId(null);
        setTitle("");
        setDescription("");
        setResponseTimer(6);
        setWords([{ value: "", word: "", alts: [] }]);
        setError(null);
    }, []);

    const startCreate = useCallback(() => {
        resetForm();
    }, [resetForm]);

    const startEdit = useCallback((lesson: Lesson) => {
        setEditingId(lesson.id);
        setTitle(lesson.title);
        setDescription(lesson.description);
        setResponseTimer(lesson.responseTimer || 6);
        setWords(lesson.words && lesson.words.length > 0 ? [...lesson.words] : [{ value: "", word: "", alts: [] }]);
        setError(null);
    }, []);

    const startDuplicate = useCallback((lesson: Lesson) => {
        setEditingId(null);
        setTitle(`${lesson.title} (Copy)`);
        setDescription(lesson.description);
        setResponseTimer(lesson.responseTimer || 6);
        setWords((lesson.words || []).map(w => ({ ...w, id: undefined })));
        setError(null);
    }, []);

    const addWord = useCallback(() => {
        setWords(prev => [...prev, { value: "", word: "", alts: [] }]);
    }, []);

    const removeWord = useCallback((index: number) => {
        setWords(prev => prev.filter((_, i) => i !== index));
    }, []);

    const updateWord = useCallback((index: number, field: keyof Word, val: any) => {
        setWords(prev => {
            const newWords = [...prev];
            newWords[index] = { ...newWords[index], [field]: val };
            return newWords;
        });
    }, []);

    const handleSave = useCallback(async () => {
        if (!title || words.some(w => !w.word || !w.value)) {
            alert("Please fill in all word fields and the lesson title.");
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            const lessonData = { title, description, responseTimer, words };

            // We still use the API route for now as it handles the process.env.ADMIN_SECRET_KEY
            // which is only available on the server.
            const method = editingId ? "PUT" : "POST";
            const url = editingId ? `/api/lessons/${editingId}` : "/api/lessons";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...lessonData, adminKey })
            });

            const data = await res.json();
            if (data.success) {
                alert(editingId ? "Lesson updated!" : "Lesson published!");
                onSuccess();
            } else {
                setError(data.error || "Failed to save lesson");
            }
        } catch (err) {
            setError("A connection error occurred.");
        } finally {
            setIsSaving(false);
        }
    }, [editingId, title, description, responseTimer, words, adminKey, onSuccess]);

    return {
        state: { editingId, title, description, responseTimer, words, isSaving, error },
        actions: {
            setTitle,
            setDescription,
            setResponseTimer,
            addWord,
            removeWord,
            updateWord,
            startCreate,
            startEdit,
            startDuplicate,
            handleSave,
            resetForm
        }
    };
};
