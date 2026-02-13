"use client";

import React from "react";
import { Sparkles, Type, AlignLeft, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface QuestEditorProps {
    title: string;
    description: string;
    icon: string;
    setTitle: (val: string) => void;
    setDescription: (val: string) => void;
    setIcon: (val: string) => void;
}

export const QuestEditor: React.FC<QuestEditorProps> = ({
    title,
    description,
    icon,
    setTitle,
    setDescription,
    setIcon,
}) => {
    return (
        <div className="max-w-2xl mx-auto">
            <Card className="bg-white p-8 space-y-8" hover={false}>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400" /> Quest Settings
                </h2>

                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                        <Type size={14} /> Quest Title
                    </label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Basic Grammar"
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
                        placeholder="What will students learn in this quest?"
                        className="w-full h-32 bg-slate-50 border border-slate-100 rounded-xl p-5 focus:outline-none focus:border-sky-500 transition-all resize-none text-slate-600 font-medium leading-relaxed"
                    />
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                        <MapIcon size={14} /> Quest Icon (Emoji)
                    </label>
                    <input
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        placeholder="🗺️"
                        className="w-24 h-14 bg-slate-50 border border-slate-100 rounded-xl px-5 focus:outline-none focus:border-sky-500 transition-all text-slate-900 font-bold text-center text-2xl"
                    />
                </div>
            </Card>
        </div>
    );
};
