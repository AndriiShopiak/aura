"use client";

import React from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2, Loader2, Map as MapIcon } from "lucide-react";
import { Quest } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface QuestDashboardProps {
    quests: Quest[];
    isLoading: boolean;
    onEdit: (quest: Quest) => void;
    onDelete: (id: string) => void;
    onCreateNew: () => void;
}

export const QuestDashboard: React.FC<QuestDashboardProps> = ({
    quests,
    isLoading,
    onEdit,
    onDelete,
    onCreateNew,
}) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                <Loader2 className="animate-spin" size={40} />
                <span className="font-bold uppercase tracking-widest text-xs">Loading quests...</span>
            </div>
        );
    }

    if (quests.length === 0) {
        return (
            <div className="text-center py-24 bg-white rounded-4xl aura-card border-white/50 border-dashed border-2">
                <p className="text-slate-400 font-bold mb-8">No quests found. Create your first quest to start adding lessons.</p>
                <Button onClick={onCreateNew}>
                    Create First Quest
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quests.map((quest) => (
                <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="bg-white p-8 group h-full flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-slate-50 group-hover:aura-gradient-primary rounded-2xl flex items-center justify-center text-2xl transition-all shadow-inner group-hover:text-white">
                                {quest.icon || "🗺️"}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEdit(quest)}
                                    className="p-2 hover:bg-sky-50 text-sky-600 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => onDelete(quest.id)}
                                    className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">{quest.title}</h3>
                        <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-medium leading-relaxed grow">
                            {quest.description}
                        </p>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};
