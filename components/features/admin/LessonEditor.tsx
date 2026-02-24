"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Type, AlignLeft, Clock, Info, LayoutDashboard, Plus, Trash2, Image as ImageIcon, FileText, Upload, Loader2 } from "lucide-react";
import { Word, Quest } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
interface LessonEditorProps {
    title: string;
    description: string;
    responseTimer: number;
    words: Word[];
    questId: string;
    quests: Quest[];
    setTitle: (val: string) => void;
    setDescription: (val: string) => void;
    setResponseTimer: (val: number) => void;
    setQuestId: (val: string) => void;
    addWord: () => void;
    removeWord: (idx: number) => void;
    updateWord: (idx: number, field: keyof Word, val: any) => void;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({
    title,
    description,
    responseTimer,
    words,
    questId,
    quests,
    setTitle,
    setDescription,
    setResponseTimer,
    setQuestId,
    addWord,
    removeWord,
    updateWord,
}) => {

    const handleImageUpload = (index: number, file: File) => {
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        updateWord(index, "imageUrl", previewUrl);
        updateWord(index, "tempFile", file);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Sidebar Configuration */}
            <section className="lg:col-span-1 space-y-8">
                <Card className="bg-white p-8 space-y-8" hover={false}>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-400" /> Lesson Settings
                    </h2>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                            <LayoutDashboard size={14} /> Assigned Quest
                        </label>
                        <select
                            value={questId}
                            onChange={(e) => setQuestId(e.target.value)}
                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl px-5 focus:outline-none focus:border-sky-500 transition-all text-slate-900 font-bold appearance-none cursor-pointer"
                        >
                            <option value="">Select a Quest...</option>
                            {quests.map(q => (
                                <option key={q.id} value={q.id}>{q.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                            <Type size={14} /> Lesson Title
                        </label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Daily Greeting"
                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl px-5 focus:outline-none focus:border-sky-500 transition-all text-slate-900 font-bold"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                            <AlignLeft size={14} /> Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief explanation for students..."
                            className="w-full h-32 bg-slate-50 border border-slate-100 rounded-xl p-5 focus:outline-none focus:border-sky-500 transition-all resize-none text-slate-600 font-medium leading-relaxed"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                            <Clock size={14} /> Response Timer (seconds)
                        </label>
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
                </Card>

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
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest px-3 py-1 bg-sky-50 rounded-full border border-sky-100">
                        {words.length} items
                    </span>
                </div>

                <div className="space-y-6">
                    <AnimatePresence initial={false}>
                        {words.map((word, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <Card className="bg-white p-8 flex flex-col gap-8 relative group hover:border-sky-500/20" hover={false}>
                                    {/* Card Header: Index and Actions */}
                                    <div className="flex items-center justify-between w-full pb-4 border-b border-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className="shrink-0 w-12 h-12 aura-gradient-primary rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-sky-200/50">
                                                {i + 1}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Word Record</span>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase">Configuration</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeWord(i)}
                                            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            title="Delete Record"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-start">
                                        {/* Column 1: Visual Value & Image */}
                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center h-6 pl-1">
                                                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em]">Visual Value (Text)</label>
                                                </div>
                                                <input
                                                    value={word.value}
                                                    onChange={(e) => updateWord(i, "value", e.target.value)}
                                                    placeholder="e.g. One"
                                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:outline-none focus:border-sky-500 transition-all font-black text-slate-900"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between h-6 pl-1">
                                                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em]">Optional Image</label>
                                                    {word.imageUrl && (
                                                        <button
                                                            onClick={() => {
                                                                updateWord(i, "imageUrl", "");
                                                                updateWord(i, "tempFile", undefined);
                                                            }}
                                                            className="text-[8px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600 transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="relative">
                                                    {word.imageUrl ? (
                                                        <div className="relative group/img w-full h-32 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                                                            <img src={word.imageUrl} alt="Preview" className="h-full w-full object-contain p-2" />
                                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                <label className="cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                                                                    Change
                                                                    <input
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept="image/*"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) handleImageUpload(i, file);
                                                                        }}
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <label
                                                            onDragOver={(e) => {
                                                                e.preventDefault();
                                                                e.currentTarget.classList.add('border-sky-500', 'bg-sky-50');
                                                            }}
                                                            onDragLeave={(e) => {
                                                                e.preventDefault();
                                                                e.currentTarget.classList.remove('border-sky-500', 'bg-sky-50');
                                                            }}
                                                            onDrop={(e) => {
                                                                e.preventDefault();
                                                                e.currentTarget.classList.remove('border-sky-500', 'bg-sky-50');
                                                                const file = e.dataTransfer.files?.[0];
                                                                if (file) handleImageUpload(i, file);
                                                            }}
                                                            className="w-full h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-sky-400 hover:bg-sky-50 transition-all cursor-pointer group bg-slate-50/30"
                                                        >
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) handleImageUpload(i, file);
                                                                }}
                                                            />
                                                            <>
                                                                <div className="w-8 h-8 rounded-xl bg-white shadow-sm group-hover:shadow-md border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-sky-500 transition-all">
                                                                    <Upload size={16} />
                                                                </div>
                                                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-sky-600">Add Image</span>
                                                            </>
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Column 2: Target Word */}
                                        <div className="space-y-3">
                                            <div className="flex items-center h-6 pl-1">
                                                <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em]">Target Word</label>
                                            </div>
                                            <input
                                                value={word.word}
                                                onChange={(e) => updateWord(i, "word", e.target.value)}
                                                placeholder="e.g. one"
                                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:outline-none focus:border-sky-500 transition-all font-black text-sky-600"
                                            />
                                        </div>

                                        {/* Column 3: Alternatives */}
                                        <div className="space-y-3">
                                            <div className="flex items-center h-6 pl-1">
                                                <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em]">Alternatives</label>
                                            </div>
                                            <input
                                                value={word.alts ? word.alts.join(", ") : ""}
                                                onChange={(e) => {
                                                    const alts = e.target.value.split(",").map(a => a.trim()).filter(a => a);
                                                    updateWord(i, "alts", alts);
                                                }}
                                                placeholder='e.g. 1, to, won'
                                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:outline-none focus:border-sky-500 transition-all text-xs font-bold text-slate-500"
                                            />
                                        </div>
                                    </div>
                                </Card>
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
    );
};
