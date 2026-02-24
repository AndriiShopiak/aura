import { useState, useCallback } from "react";
import { Word, Lesson } from "@/types";
import { lessonService } from "@/services/lessonService";
import { storageService } from "@/services/storageService";

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
    const [initialWords, setInitialWords] = useState<Word[]>([]);
    const [questId, setQuestId] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetForm = useCallback(() => {
        setEditingId(null);
        setTitle("");
        setDescription("");
        setResponseTimer(6);
        setWords([{ value: "", word: "", alts: [] }]);
        setInitialWords([]);
        setQuestId("");
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
        const lessonWords = lesson.words && lesson.words.length > 0 ? [...lesson.words] : [{ value: "", word: "", alts: [] }];
        setWords(lessonWords);
        setInitialWords([...lessonWords]);
        setQuestId(lesson.quest_id || "");
        setError(null);
    }, []);

    const startDuplicate = useCallback((lesson: Lesson) => {
        setEditingId(null);
        setTitle(`${lesson.title} (Copy)`);
        setDescription(lesson.description);
        setResponseTimer(lesson.responseTimer || 6);
        setWords((lesson.words || []).map(w => ({ ...w, id: undefined })));
        setInitialWords([]);
        setQuestId(lesson.quest_id || "");
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
        if (!title || !questId || words.some(w => !w.word || !w.value)) {
            alert("Please fill in all word fields, lesson title, and select a quest.");
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            // 1. Upload new files and get public URLs
            const finalWords = await Promise.all(words.map(async (w) => {
                if (w.tempFile) {
                    try {
                        const publicUrl = await storageService.uploadLessonImage(w.tempFile);
                        // Revoke blob URL to clean up memory
                        if (w.imageUrl?.startsWith('blob:')) {
                            URL.revokeObjectURL(w.imageUrl);
                        }
                        const { tempFile, ...wordWithoutFile } = w;
                        return { ...wordWithoutFile, imageUrl: publicUrl };
                    } catch (err) {
                        console.error("Failed to upload image for word:", w.word, err);
                        throw new Error(`Failed to upload image for "${w.word}"`);
                    }
                }
                return w;
            }));

            // 2. Find images to delete (present in initialWords but not in current words)
            const currentImageUrls = new Set(finalWords.filter(w => w.imageUrl).map(w => w.imageUrl));
            const imagesToDelete = initialWords
                .filter((w): w is Word & { imageUrl: string } => !!(w.imageUrl && !currentImageUrls.has(w.imageUrl)))
                .map(w => w.imageUrl);

            // Perform deletions
            for (const url of imagesToDelete) {
                try {
                    await storageService.deleteImage(url);
                } catch (err) {
                    console.error("Failed to delete orphaned image:", url, err);
                    // Continue anyway to save the lesson
                }
            }

            const lessonData = { title, description, responseTimer, words: finalWords, questId };

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
    }, [editingId, title, description, responseTimer, words, initialWords, questId, adminKey, onSuccess]);

    return {
        state: { editingId, title, description, responseTimer, words, questId, isSaving, error },
        actions: {
            setTitle,
            setDescription,
            setResponseTimer,
            setQuestId,
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
