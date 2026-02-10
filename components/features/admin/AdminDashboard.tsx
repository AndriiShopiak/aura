"use client";

import React from "react";
import { motion } from "framer-motion";
import { Edit2, Copy, Trash2, Clock, Loader2 } from "lucide-react";
import { Lesson } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface AdminDashboardProps {
    lessons: Lesson[];
    isLoading: boolean;
    onEdit: (lesson: Lesson) => void;
    onDuplicate: (lesson: Lesson) => void;
    onDelete: (id: string) => void;
    onCreateNew: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    lessons,
    isLoading,
    onEdit,
    onDuplicate,
    onDelete,
    onCreateNew,
}) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                <Loader2 className="animate-spin" size={40} />
                <span className="font-bold uppercase tracking-widest text-xs">Loading lessons...</span>
            </div>
        );
    }

    if (lessons.length === 0) {
        return (
            <div className="text-center py-24 bg-white rounded-4xl aura-card border-white/50 border-dashed border-2">
                <p className="text-slate-400 font-bold mb-8">No lessons found. Start by creating your first one!</p>
                <Button onClick={onCreateNew}>
                    Create First Lesson
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
                <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="bg-white p-8 group h-full flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-slate-50 group-hover:aura-gradient-primary rounded-2xl flex items-center justify-center text-2xl transition-all shadow-inner group-hover:text-white">
                                {lesson.icon || "🎓"}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEdit(lesson)}
                                    className="p-2 hover:bg-sky-50 text-sky-600 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => onDuplicate(lesson)}
                                    className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                    title="Duplicate"
                                >
                                    <Copy size={18} />
                                </button>
                                <button
                                    onClick={() => onDelete(lesson.id)}
                                    className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">{lesson.title}</h3>
                        <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-medium leading-relaxed grow">
                            {lesson.description}
                        </p>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Clock size={12} />
                                {lesson.responseTimer || 6}s Timer
                            </div>
                            <div className="text-[10px] font-black text-sky-400 uppercase tracking-widest px-2 py-1 bg-sky-50 rounded-md">
                                {lesson.words?.length || 0} Words
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};
