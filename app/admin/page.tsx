"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, LogOut, Plus, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLessons } from "@/hooks/useLessons";
import { useQuests } from "@/hooks/useQuests";
import { useAdminEditor } from "@/hooks/useAdminEditor";
import { useQuestEditor } from "@/hooks/useQuestEditor";
import { authService } from "@/services/authService";
import { lessonService } from "@/services/lessonService";
import { questService } from "@/services/questService";
import { Button } from "@/components/ui/Button";
import { AdminLogin } from "@/components/features/admin/AdminLogin";
import { AdminDashboard } from "@/components/features/admin/AdminDashboard";
import { LessonEditor } from "@/components/features/admin/LessonEditor";
import { QuestDashboard } from "@/components/features/admin/QuestDashboard";
import { QuestEditor } from "@/components/features/admin/QuestEditor";

export default function AdminPage() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [adminKey, setAdminKey] = useState("");
    const [authError, setAuthError] = useState("");
    const [isCheckingAuth, setIsCheckingAuth] = useState(false);
    const [view, setView] = useState<"dashboard" | "editor">("dashboard");
    const [adminMode, setAdminMode] = useState<"lessons" | "quests">("lessons");

    const { lessons, isLoading: isLoadingLessons, refreshLessons } = useLessons();
    const { quests, isLoading: isLoadingQuests, refreshQuests } = useQuests();

    const { state: editorState, actions: editorActions } = useAdminEditor({
        adminKey,
        onSuccess: () => {
            setView("dashboard");
            refreshLessons();
        }
    });

    const { state: questEditorState, actions: questEditorActions } = useQuestEditor({
        adminKey,
        onSuccess: () => {
            setView("dashboard");
            refreshQuests();
        }
    });

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (adminKey.trim().length === 0) {
            setAuthError("Please enter a secret key.");
            return;
        }

        setIsCheckingAuth(true);
        setAuthError("");

        const result = await authService.verifyAdminKey(adminKey);
        if (result.success) {
            setIsAuthorized(true);
        } else {
            setAuthError(result.error || "Invalid secret key.");
        }
        setIsCheckingAuth(false);
    };

    const handleDelete = async (id: string) => {
        const itemType = adminMode === "lessons" ? "lesson" : "quest";
        if (!confirm(`Are you sure you want to delete this ${itemType}?`)) return;
        try {
            if (adminMode === "lessons") {
                await lessonService.deleteLesson(id);
                refreshLessons();
            } else {
                await questService.deleteQuest(id);
                refreshQuests();
            }
        } catch (err) {
            alert(`Error deleting ${itemType}.`);
        }
    };

    const handleSave = () => {
        if (adminMode === "lessons") {
            editorActions.handleSave();
        } else {
            questEditorActions.handleSave();
        }
    };

    if (!isAuthorized) {
        return (
            <AdminLogin
                adminKey={adminKey}
                setAdminKey={setAdminKey}
                onSubmit={handleAuth}
                isLoading={isCheckingAuth}
                error={authError}
            />
        );
    }

    const currentTitle = view === "dashboard"
        ? "Tutor Dashboard"
        : adminMode === "lessons"
            ? (editorState.editingId ? "Edit Lesson" : "New Lesson")
            : (questEditorState.editingQuestId ? "Edit Quest" : "New Quest");

    const handleCreateNew = () => {
        if (adminMode === "lessons") {
            editorActions.startCreate();
        } else {
            questEditorActions.startCreate();
        }
        setView("editor");
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 selection:bg-sky-100 selection:text-sky-900">
            {/* Admin Header */}
            <div className="aura-gradient-primary text-white py-12 mb-12">
                <div className="max-w-6xl mx-auto px-6">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                {view === "editor" ? (
                                    <button
                                        onClick={() => setView("dashboard")}
                                        className="inline-flex items-center gap-2 text-sky-100/70 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] group"
                                    >
                                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                                    </button>
                                ) : (
                                    <Link href="/" className="inline-flex items-center gap-2 text-sky-100/70 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] group">
                                        <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> Exit Tutor Console
                                    </Link>
                                )}
                            </div>
                            <h1 className="text-4xl font-black tracking-tight leading-none">
                                {currentTitle}
                            </h1>
                        </div>

                        {view === "dashboard" && (
                            <div className="flex bg-white/10 p-1 rounded-2xl backdrop-blur-sm border border-white/10">
                                <button
                                    onClick={() => setAdminMode("lessons")}
                                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminMode === "lessons" ? "bg-white text-primary shadow-lg" : "text-white/70 hover:text-white"}`}
                                >
                                    Lessons
                                </button>
                                <button
                                    onClick={() => setAdminMode("quests")}
                                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminMode === "quests" ? "bg-white text-primary shadow-lg" : "text-white/70 hover:text-white"}`}
                                >
                                    Quests
                                </button>
                            </div>
                        )}

                        {view === "dashboard" ? (
                            <Button
                                onClick={handleCreateNew}
                                variant="secondary"
                                size="xl"
                                leftIcon={<Plus size={20} />}
                            >
                                {adminMode === "lessons" ? "Create Lesson" : "Create Quest"}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSave}
                                isLoading={adminMode === "lessons" ? editorState.isSaving : questEditorState.isSaving}
                                variant="secondary"
                                size="xl"
                                leftIcon={<Save size={20} />}
                            >
                                {adminMode === "lessons"
                                    ? (editorState.editingId ? "Update Lesson" : "Publish Lesson")
                                    : (questEditorState.editingQuestId ? "Update Quest" : "Create Quest")}
                            </Button>
                        )}
                    </header>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                {view === "dashboard" ? (
                    adminMode === "lessons" ? (
                        <AdminDashboard
                            lessons={lessons}
                            isLoading={isLoadingLessons}
                            onEdit={(lesson) => {
                                editorActions.startEdit(lesson);
                                setView("editor");
                            }}
                            onDuplicate={(lesson) => {
                                editorActions.startDuplicate(lesson);
                                setView("editor");
                            }}
                            onDelete={handleDelete}
                            onCreateNew={handleCreateNew}
                        />
                    ) : (
                        <QuestDashboard
                            quests={quests}
                            isLoading={isLoadingQuests}
                            onEdit={(quest) => {
                                questEditorActions.startEdit(quest);
                                setView("editor");
                            }}
                            onDelete={handleDelete}
                            onCreateNew={handleCreateNew}
                        />
                    )
                ) : (
                    adminMode === "lessons" ? (
                        <LessonEditor
                            {...editorState}
                            {...editorActions}
                            quests={quests}
                        />
                    ) : (
                        <QuestEditor
                            {...questEditorState}
                            {...questEditorActions}
                        />
                    )
                )}
            </div>
        </div>
    );
}
