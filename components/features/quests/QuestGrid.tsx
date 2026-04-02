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
            <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-[76px] bg-slate-100 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (quests.length === 0) {
        return (
            <div className="text-center py-24">
                <p className="text-slate-400 font-medium">No units available yet.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {quests.map((quest, index) => (
                <QuestCard
                    key={quest.id}
                    quest={quest}
                    index={index}
                />
            ))}
        </div>
    );
};
