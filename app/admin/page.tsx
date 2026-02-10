"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, LogOut, Plus, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLessons } from "@/hooks/useLessons";
import { useAdminEditor } from "@/hooks/useAdminEditor";
import { authService } from "@/services/authService";
import { lessonService } from "@/services/lessonService";
import { Button } from "@/components/ui/Button";
import { AdminLogin } from "@/components/features/admin/AdminLogin";
import { AdminDashboard } from "@/components/features/admin/AdminDashboard";
import { LessonEditor } from "@/components/features/admin/LessonEditor";

export default function AdminPage() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [adminKey, setAdminKey] = useState("");
    const [authError, setAuthError] = useState("");
    const [isCheckingAuth, setIsCheckingAuth] = useState(false);
    const [view, setView] = useState<"dashboard" | "editor">("dashboard");

    const { lessons, isLoading: isLoadingLessons, refreshLessons } = useLessons();

    const { state: editorState, actions: editorActions } = useAdminEditor({
        adminKey,
        onSuccess: () => {
            setView("dashboard");
            refreshLessons();
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
        if (!confirm("Are you sure you want to delete this lesson?")) return;
        try {
            await lessonService.deleteLesson(id);
            refreshLessons();
        } catch (err) {
            alert("Error deleting lesson.");
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
                                {view === "dashboard" ? "Tutor Dashboard" : editorState.editingId ? "Edit Lesson" : "New Lesson"}
                            </h1>
                        </div>
                        {view === "dashboard" ? (
                            <Button
                                onClick={() => {
                                    editorActions.startCreate();
                                    setView("editor");
                                }}
                                variant="secondary"
                                size="xl"
                                leftIcon={<Plus size={20} />}
                            >
                                Create New Lesson
                            </Button>
                        ) : (
                            <Button
                                onClick={editorActions.handleSave}
                                isLoading={editorState.isSaving}
                                variant="secondary"
                                size="xl"
                                leftIcon={<Save size={20} />}
                            >
                                {editorState.editingId ? "Update Lesson" : "Publish Lesson"}
                            </Button>
                        )}
                    </header>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                {view === "dashboard" ? (
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
                        onCreateNew={() => {
                            editorActions.startCreate();
                            setView("editor");
                        }}
                    />
                ) : (
                    <LessonEditor
                        {...editorState}
                        {...editorActions}
                    />
                )}
            </div>
        </div>
    );
}
