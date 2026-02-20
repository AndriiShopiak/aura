"use client";

import React from "react";
import { Quest } from "@/types";
import { QuestCard } from "./QuestCard";

interface QuestGridProps {
    quests: Quest[];
    isLoading: boolean;
}

export const QuestGrid: React.FC<QuestGridProps> = ({ quests, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-72 aura-card animate-pulse" />
                ))}
            </div>
        );
    }

    if (quests.length === 0) {
        return (
            <div className="text-center py-24 aura-card">
                <p className="text-slate-600 font-bold text-lg mb-6">No quests available yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quests.map((quest, index) => (
                <QuestCard
                    key={quest.id}
                    quest={quest}
                />
            ))}
        </div>
    );
};
