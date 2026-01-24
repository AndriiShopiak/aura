"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, ArrowLeft, Lock, Loader2, Sparkles, AlertCircle, LayoutDashboard, KeyRound, Type, AlignLeft, Info } from "lucide-react";
import Link from "next/link";
import { Word } from "@/types";

export default function AdminPage() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [adminKey, setAdminKey] = useState("");
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Lesson Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("🎓");
    const [words, setWords] = useState<Word[]>([
        { value: "", word: "", alts: [] }
    ]);

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminKey.trim().length > 0) {
            setIsAuthorized(true);
            setError("");
        } else {
            setError("Please enter a secret key.");
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
            const res = await fetch("/api/lessons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, icon, words, adminKey })
            });

            const data = await res.json();
            if (data.success) {
                alert("Lesson published successfully!");
                window.location.href = "/";
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
                        <button className="w-full h-16 aura-gradient-primary hover:opacity-90 text-white rounded-2xl font-black shadow-xl shadow-sky-200 transition-all active:scale-[0.98]">
                            Authenticate Access
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
                            <Link href="/" className="inline-flex items-center gap-2 text-sky-100/70 hover:text-white transition-colors mb-4 text-[10px] font-black uppercase tracking-[0.2em] group">
                                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Exit Tutor Console
                            </Link>
                            <h1 className="text-4xl font-black tracking-tight leading-none">Lesson Architect</h1>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-3 px-10 py-5 bg-white text-sky-600 hover:bg-sky-50 disabled:bg-white/20 rounded-2xl font-black shadow-2xl aura-logo-shadow transition-all active:scale-95 whitespace-nowrap"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {isSaving ? "Publishing..." : "Finalize & Publish"}
                        </button>
                    </header>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Sidebar Configuration */}
                    <section className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-8 rounded-4xl aura-card border-white/50 space-y-8">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 flex items-center gap-2">
                                <Sparkles size={16} className="text-amber-400" /> Module Configuration
                            </h2>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest"><Type size={14} /> Module Title</label>
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
                                <label className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">Iconography</label>
                                <div className="flex gap-4">
                                    <input
                                        value={icon}
                                        onChange={(e) => setIcon(e.target.value)}
                                        className="w-20 h-16 bg-slate-50 border border-slate-100 rounded-2xl text-center text-3xl focus:outline-none focus:border-sky-500 transition-all text-slate-900 shadow-inner"
                                    />
                                    <div className="grow flex items-center px-5 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/50">
                                        Module Visual Identifier
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-sky-50 p-8 rounded-4xl border border-sky-100/50 aura-logo-shadow shadow-sky-100/30">
                            <div className="flex items-start gap-4">
                                <Info size={24} className="text-sky-500 shrink-0" />
                                <p className="text-sm text-sky-800 leading-relaxed font-bold">
                                    Include common homophones or variations in the "Alternatives" field to improve recognition accuracy.
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
                                            <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] pl-1">Alt Tags (JSON)</label>
                                            <input
                                                value={word.alts ? JSON.stringify(word.alts) : ""}
                                                onChange={(e) => {
                                                    try {
                                                        const parsed = JSON.parse(e.target.value);
                                                        updateWord(i, "alts", parsed);
                                                    } catch {
                                                    }
                                                }}
                                                placeholder='["1", "to"]'
                                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:outline-none focus:border-sky-500 transition-all text-xs font-mono font-bold text-slate-500"
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
            </div>
        </div>
    );
}
