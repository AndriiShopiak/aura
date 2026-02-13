import { useState, useCallback } from "react";
import { Quest } from "@/types";
import { questService } from "@/services/questService";

interface UseQuestEditorProps {
    adminKey: string;
    onSuccess: () => void;
}

export const useQuestEditor = ({ adminKey, onSuccess }: UseQuestEditorProps) => {
    const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("🗺️");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetForm = useCallback(() => {
        setEditingQuestId(null);
        setTitle("");
        setDescription("");
        setIcon("🗺️");
        setError(null);
    }, []);

    const startCreate = useCallback(() => {
        resetForm();
    }, [resetForm]);

    const startEdit = useCallback((quest: Quest) => {
        setEditingQuestId(quest.id);
        setTitle(quest.title);
        setDescription(quest.description);
        setIcon(quest.icon || "🗺️");
        setError(null);
    }, []);

    const handleSave = useCallback(async () => {
        if (!title) {
            alert("Please enter a quest title.");
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            const questData = { title, description, icon };
            const method = editingQuestId ? "PUT" : "POST";
            const url = editingQuestId ? `/api/quests/${editingQuestId}` : "/api/quests";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...questData, adminKey })
            });

            const data = await res.json();
            if (data.success) {
                alert(editingQuestId ? "Quest updated!" : "Quest created!");
                onSuccess();
            } else {
                setError(data.error || "Failed to save quest");
            }
        } catch (err) {
            setError("A connection error occurred.");
        } finally {
            setIsSaving(false);
        }
    }, [editingQuestId, title, description, icon, adminKey, onSuccess]);

    return {
        state: { editingQuestId, title, description, icon, isSaving, error },
        actions: {
            setTitle,
            setDescription,
            setIcon,
            startCreate,
            startEdit,
            handleSave,
            resetForm
        }
    };
};
