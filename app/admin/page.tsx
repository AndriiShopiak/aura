"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, ArrowLeft, Loader2, Sparkles, LayoutDashboard, KeyRound, Type, AlignLeft, Info, Edit2, Copy, Clock, LogOut } from "lucide-react";
import Link from "next/link";
import { Word, Lesson } from "@/types";

export default function AdminPage() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [adminKey, setAdminKey] = useState("");
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState<"dashboard" | "editor">("dashboard");

    // Dashboard State
    const [lessons, setLessons] = useState<Lesson[]>([]);

    // Lesson Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [responseTimer, setResponseTimer] = useState(6);
    const [words, setWords] = useState<Word[]>([
        { value: "", word: "", alts: [] }
    ]);

    useEffect(() => {
        if (isAuthorized) {
            fetchLessons();
        }
    }, [isAuthorized]);

    const fetchLessons = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/lessons");
            const data = await res.json();
            setLessons(data);
        } catch (err) {
            console.error("Failed to fetch lessons:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (adminKey.trim().length === 0) {
            setError("Please enter a secret key.");
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/auth/verify?adminKey=${adminKey}`);
            const data = await res.json();
            if (data.success) {
                setIsAuthorized(true);
            } else {
                setError(data.error || "Invalid secret key.");
            }
        } catch (err) {
            setError("Connection error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle("");
        setDescription("");
        setResponseTimer(6);
        setWords([{ value: "", word: "", alts: [] }]);
    };

    const handleCreateNew = () => {
        resetForm();
        setView("editor");
    };

    const handleEdit = (lesson: Lesson) => {
        setEditingId(lesson.id);
        setTitle(lesson.title);
        setDescription(lesson.description);
        setResponseTimer(lesson.responseTimer || 6);
        setWords(lesson.words && lesson.words.length > 0 ? lesson.words : [{ value: "", word: "", alts: [] }]);
        setView("editor");
    };

    const handleDuplicate = (lesson: Lesson) => {
        setEditingId(null); // Force new lesson
        setTitle(`${lesson.title} (Copy)`);
        setDescription(lesson.description);
        setResponseTimer(lesson.responseTimer || 6);
        setWords((lesson.words || []).map(w => ({ ...w, id: undefined })));
        setView("editor");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this lesson?")) return;

        try {
            const res = await fetch(`/api/lessons/${id}?adminKey=${adminKey}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setLessons(lessons.filter(l => l.id !== id));
            } else {
                alert("Failed to delete lesson.");
            }
        } catch (err) {
            alert("Error deleting lesson.");
        }
    };

    const addWord = () => setWords([...words, { value: "", word: "", alts: [] }]);
    const removeWord = (index: number) => setWords(words.filter((_, i) => i !== index));
    const updateWord = (index: number, field: keyof Word, val: any) => {
        const newWords = [...words];
        newWords[index] = { ...newWords[index], [field]: val };
        setWords(newWords);
    };

    const handleSave = async () => {
        if (!title || words.some(w => !w.word || !w.value)) {
            alert("Please fill in all word fields and the lesson title.");
            return;
        }

        setIsSaving(true);
        try {
            const method = editingId ? "PUT" : "POST";
            const url = editingId ? `/api/lessons/${editingId}` : "/api/lessons";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, responseTimer, words, adminKey })
            });

            const data = await res.json();
            if (data.success) {
                alert(editingId ? "Lesson updated!" : "Lesson published!");
                setView("dashboard");
                fetchLessons();
            } else {
                setError(data.error || "Failed to save lesson");
            }
        } catch (err) {
            setError("A connection error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-sky-100 selection:text-sky-900">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white p-12 rounded-4xl aura-card shadow-2xl text-center border-white relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 aura-gradient-primary" />
                    <div className="w-20 h-20 aura-gradient-primary rounded-4xl flex items-center justify-center mx-auto mb-10 text-white aura-logo-shadow">
                        <KeyRound size={36} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Tutor Console</h1>
                    <p className="text-slate-500 font-medium mb-10">Enter your developer access key to manage lessons.</p>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="relative group">
                            <input
                                type="password"
                                placeholder="Access Key"
                                value={adminKey}
                                onChange={(e) => setAdminKey(e.target.value)}
                                className="w-full h-16 bg-slate-50 border border-slate-200 rounded-2xl px-6 focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all text-center font-mono font-bold tracking-widest text-slate-900"
                            />
                            {error && <p className="text-rose-500 text-[10px] mt-3 font-black uppercase tracking-widest">{error}</p>}
                        </div>
                        <button
                            disabled={isLoading}
                            className="w-full h-16 aura-gradient-primary hover:opacity-90 disabled:opacity-50 text-white rounded-2xl font-black shadow-xl shadow-sky-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Authenticate Access"}
                        </button>
                    </form>

                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mt-12 hover:text-sky-600 transition-colors group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </Link>
                </motion.div>
            </div>
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
                                {view === "dashboard" ? "Tutor Dashboard" : editingId ? "Edit Lesson" : "New Lesson"}
                            </h1>
                        </div>
                        {view === "dashboard" ? (
                            <button
                                onClick={handleCreateNew}
                                className="flex items-center gap-3 px-10 py-5 bg-white text-sky-600 hover:bg-sky-50 rounded-2xl font-black shadow-2xl aura-logo-shadow transition-all active:scale-95 whitespace-nowrap"
                            >
                                <Plus size={20} />
                                Create New Lesson
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-3 px-10 py-5 bg-white text-sky-600 hover:bg-sky-50 disabled:bg-white/20 rounded-2xl font-black shadow-2xl aura-logo-shadow transition-all active:scale-95 whitespace-nowrap"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {isSaving ? "Saving..." : editingId ? "Update Lesson" : "Publish Lesson"}
                            </button>
                        )}
                    </header>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                {view === "dashboard" ? (
                    <div className="space-y-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                                <Loader2 className="animate-spin" size={40} />
                                <span className="font-bold uppercase tracking-widest text-xs">Loading lessons...</span>
                            </div>
                        ) : lessons.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-4xl aura-card border-white/50 border-dashed border-2">
                                <p className="text-slate-400 font-bold mb-8">No lessons found. Start by creating your first one!</p>
                                <button
                                    onClick={handleCreateNew}
                                    className="px-8 py-4 aura-gradient-primary text-white rounded-2xl font-black shadow-lg"
                                >
                                    Create First Lesson
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {lessons.map((lesson) => (
                                    <motion.div
                                        key={lesson.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white p-8 rounded-4xl aura-card border-white/50 group"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 bg-slate-50 group-hover:aura-gradient-primary rounded-2xl flex items-center justify-center text-2xl transition-all shadow-inner group-hover:text-white">
                                                {lesson.icon || "🎓"}
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(lesson)} className="p-2 hover:bg-sky-50 text-sky-600 rounded-lg transition-colors" title="Edit">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDuplicate(lesson)} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors" title="Duplicate">
                                                    <Copy size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(lesson.id)} className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">{lesson.title}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
                                            {lesson.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Clock size={12} />
                                                {lesson.responseTimer || 6}s Timer
                                            </div>
                                            <div className="text-[10px] font-black text-sky-400 uppercase tracking-widest px-2 py-1 bg-sky-50 rounded-md">
                                                {lesson.words?.length || 0} Words
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Sidebar Configuration */}
                        <section className="lg:col-span-1 space-y-8">
                            <div className="bg-white p-8 rounded-4xl aura-card border-white/50 space-y-8">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 flex items-center gap-2">
                                    <Sparkles size={16} className="text-amber-400" /> Lesson Settings
                                </h2>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest"><Type size={14} /> Lesson Title</label>
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Daily Greeting"
                                        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl px-5 focus:outline-none focus:border-sky-500 transition-all text-slate-900 font-bold"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest"><AlignLeft size={14} /> Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief explanation for students..."
                                        className="w-full h-32 bg-slate-50 border border-slate-100 rounded-xl p-5 focus:outline-none focus:border-sky-500 transition-all resize-none text-slate-600 font-medium leading-relaxed"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest"><Clock size={14} /> Response Timer (seconds)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            value={responseTimer}
                                            onChange={(e) => setResponseTimer(parseInt(e.target.value) || 0)}
                                            min="1"
                                            max="60"
                                            className="w-24 h-14 bg-slate-50 border border-slate-100 rounded-xl px-5 focus:outline-none focus:border-sky-500 transition-all text-slate-900 font-bold text-center"
                                        />
                                        <div className="grow bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            Time allowed for each word
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-sky-50 p-8 rounded-4xl border border-sky-100/50 aura-logo-shadow shadow-sky-100/30">
                                <div className="flex items-start gap-4">
                                    <Info size={24} className="text-sky-500 shrink-0" />
                                    <p className="text-sm text-sky-800 leading-relaxed font-bold">
                                        Tip: Shorter timers (3-5s) encourage rapid response and fluency. Longer timers (10-15s) are better for beginners.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Word List Builder */}
                        <section className="lg:col-span-2 space-y-8">
                            <div className="flex justify-between items-center mb-4 px-4">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                                    <LayoutDashboard size={14} /> Word Inventory
                                </h2>
                                <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest px-3 py-1 bg-sky-50 rounded-full border border-sky-100">{words.length} items</span>
                            </div>

                            <div className="space-y-6">
                                <AnimatePresence initial={false}>
                                    {words.map((word, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="bg-white p-8 rounded-4xl aura-card border-white/50 flex flex-col md:flex-row gap-8 items-start md:items-center relative group hover:border-sky-500/20"
                                        >
                                            <div className="shrink-0 w-14 h-14 aura-gradient-primary rounded-2xl flex items-center justify-center text-white font-black text-base shadow-lg">
                                                {i + 1}
                                            </div>

                                            <div className="grow grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] pl-1">Visual Value</label>
                                                    <input
                                                        value={word.value}
                                                        onChange={(e) => updateWord(i, "value", e.target.value)}
                                                        placeholder="e.g. One"
                                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:outline-none focus:border-sky-500 transition-all font-black text-slate-900"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] pl-1">Target Word</label>
                                                    <input
                                                        value={word.word}
                                                        onChange={(e) => updateWord(i, "word", e.target.value)}
                                                        placeholder="e.g. one"
                                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:outline-none focus:border-sky-500 transition-all font-black text-sky-600"
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:w-56 space-y-2 w-full">
                                                <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] pl-1">Alternatives (comma separated)</label>
                                                <input
                                                    value={word.alts ? word.alts.join(", ") : ""}
                                                    onChange={(e) => {
                                                        const alts = e.target.value.split(",").map(a => a.trim()).filter(a => a);
                                                        updateWord(i, "alts", alts);
                                                    }}
                                                    placeholder='e.g. 1, to, won'
                                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:outline-none focus:border-sky-500 transition-all text-[10px] font-bold text-slate-500"
                                                />
                                            </div>

                                            <button
                                                onClick={() => removeWord(i)}
                                                className="absolute md:relative top-4 right-4 md:top-0 md:right-0 p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <button
                                    onClick={addWord}
                                    className="w-full py-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 hover:text-sky-600 hover:border-sky-300 hover:bg-white transition-all flex flex-col items-center justify-center gap-4 group"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:aura-gradient-primary group-hover:text-white flex items-center justify-center transition-all shadow-inner group-hover:shadow-lg group-hover:aura-logo-shadow">
                                        <Plus size={28} />
                                    </div>
                                    <span className="font-black uppercase tracking-[0.3em] text-xs">Append New Record</span>
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
