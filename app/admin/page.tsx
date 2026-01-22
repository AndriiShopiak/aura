"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, ArrowLeft, Lock, Loader2, Sparkles, AlertCircle } from "lucide-react";
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

    // Handle Auth (Simple for now)
    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminKey.trim().length > 0) {
            setIsAuthorized(true);
            setError("");
        } else {
            setError("Please enter a secret key.");
        }
    };

    const addWord = () => {
        setWords([...words, { value: "", word: "", alts: [] }]);
    };

    const removeWord = (index: number) => {
        setWords(words.filter((_, i) => i !== index));
    };

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
                body: JSON.stringify({
                    title,
                    description,
                    icon,
                    words,
                    adminKey
                })
            });

            const data = await res.json();
            if (data.success) {
                alert("Lesson published successfully!");
                window.location.href = "/";
            } else {
                setError(data.error || "Failed to save lesson");
            }
        } catch (err) {
            console.error("Save error:", err);
            setError("A connection error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white p-8 rounded-4xl border border-neutral-200 shadow-xl text-center"
                >
                    <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-neutral-400">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-neutral-800 mb-2">Admin Access</h1>
                    <p className="text-neutral-400 text-sm mb-8">Enter your secret key to manage Aura lessons.</p>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                placeholder="Enter Secret Key"
                                value={adminKey}
                                onChange={(e) => setAdminKey(e.target.value)}
                                className="w-full h-14 bg-neutral-50 border border-neutral-200 rounded-2xl px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-center font-mono tracking-widest text-neutral-900"
                            />
                            {error && <p className="text-rose-500 text-xs mt-2 font-bold uppercase tracking-tight">{error}</p>}
                        </div>
                        <button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]">
                            Unlock Dashboard
                        </button>
                    </form>

                    <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 text-sm mt-8 hover:text-neutral-600 transition-colors">
                        <ArrowLeft size={14} /> Back to Student View
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-600 transition-colors mb-2 text-sm font-bold uppercase tracking-wider">
                            <ArrowLeft size={14} /> Dashboard
                        </Link>
                        <h1 className="text-3xl font-black text-neutral-800">Create New Lesson</h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-200 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all active:scale-95"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSaving ? "Saving..." : "Publish Lesson"}
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <section className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
                                <Sparkles size={14} className="text-amber-400" /> Basic Information
                            </h2>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Lesson Title</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Farm Animals"
                                    className="w-full h-12 bg-neutral-50 border border-neutral-200 rounded-xl px-4 focus:outline-none focus:border-indigo-500 transition-all text-neutral-900 font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe what students will learn..."
                                    className="w-full h-32 bg-neutral-50 border border-neutral-200 rounded-xl p-4 focus:outline-none focus:border-indigo-500 transition-all resize-none text-neutral-900"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Icon / Emoji</label>
                                <div className="flex gap-2">
                                    <input
                                        value={icon}
                                        onChange={(e) => setIcon(e.target.value)}
                                        className="w-16 h-12 bg-neutral-50 border border-neutral-200 rounded-xl text-center text-xl focus:outline-none focus:border-indigo-500 transition-all text-neutral-900"
                                    />
                                    <div className="grow flex items-center px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-400">
                                        Displayed on the card
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={20} className="text-indigo-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-indigo-700 leading-relaxed font-medium">
                                    <strong>Pro Tip:</strong> Add synonyms or common misinterpretations as alternatives (e.g. for "two", add "to" and "too").
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Word List */}
                    <section className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center mb-2 px-2">
                            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400">Word Training List</h2>
                            <span className="text-[10px] font-bold text-neutral-300 uppercase">{words.length} items total</span>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence initial={false}>
                                {words.map((word, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center relative group"
                                    >
                                        <div className="shrink-0 w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400 font-bold text-sm">
                                            #{i + 1}
                                        </div>

                                        <div className="grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-black text-neutral-300 pl-1">Display Value</label>
                                                <input
                                                    value={word.value}
                                                    onChange={(e) => updateWord(i, "value", e.target.value)}
                                                    placeholder="e.g. 1 or Cat"
                                                    className="w-full h-11 bg-neutral-50 border border-neutral-200 rounded-xl px-4 focus:outline-none focus:border-indigo-500 transition-all font-bold text-neutral-900"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-black text-neutral-300 pl-1">Target Word</label>
                                                <input
                                                    value={word.word}
                                                    onChange={(e) => updateWord(i, "word", e.target.value)}
                                                    placeholder="e.g. one or cat"
                                                    className="w-full h-11 bg-neutral-50 border border-neutral-200 rounded-xl px-4 focus:outline-none focus:border-indigo-500 transition-all font-bold text-indigo-600"
                                                />
                                            </div>
                                        </div>

                                        <div className="md:w-48 space-y-1 w-full text-right">
                                            <label className="text-[10px] uppercase font-black text-neutral-300 pr-1">Alternatives (JSON)</label>
                                            <input
                                                value={word.alts ? JSON.stringify(word.alts) : ""}
                                                onChange={(e) => {
                                                    try {
                                                        const parsed = JSON.parse(e.target.value);
                                                        updateWord(i, "alts", parsed);
                                                    } catch {
                                                        // If they are just typing, keep it as is or handle differently
                                                    }
                                                }}
                                                placeholder='["1", "to"]'
                                                className="w-full h-11 bg-neutral-50 border border-neutral-200 rounded-xl px-4 focus:outline-none focus:border-indigo-500 transition-all text-xs font-mono text-neutral-900"
                                            />
                                        </div>

                                        <button
                                            onClick={() => removeWord(i)}
                                            className="absolute -top-2 -right-2 md:relative md:top-0 md:right-0 p-3 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            <button
                                onClick={addWord}
                                className="w-full py-6 border-2 border-dashed border-neutral-200 rounded-4xl text-neutral-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-3 font-bold group"
                            >
                                <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all">
                                    <Plus size={20} />
                                </div>
                                Add Another Word
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
