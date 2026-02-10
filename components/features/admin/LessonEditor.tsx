"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Type, AlignLeft, Clock, Info, LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { Word } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface LessonEditorProps {
    title: string;
    description: string;
    responseTimer: number;
    words: Word[];
    setTitle: (val: string) => void;
    setDescription: (val: string) => void;
    setResponseTimer: (val: number) => void;
    addWord: () => void;
    removeWord: (idx: number) => void;
    updateWord: (idx: number, field: keyof Word, val: any) => void;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({
    title,
    description,
    responseTimer,
    words,
    setTitle,
    setDescription,
    setResponseTimer,
    addWord,
    removeWord,
    updateWord,
}) => {
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
                                <Card className="bg-white p-8 flex flex-col md:flex-row gap-8 items-start md:items-center relative group hover:border-sky-500/20" hover={false}>
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
                                        <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] pl-1">Alternatives</label>
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
