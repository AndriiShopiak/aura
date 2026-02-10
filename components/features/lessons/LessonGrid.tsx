"use client";

import React from "react";
import { Lesson, UserProgress } from "@/types";
import { LessonCard } from "./LessonCard";

interface LessonGridProps {
    lessons: Lesson[];
    progress: UserProgress | null;
    isLoading: boolean;
}

export const LessonGrid: React.FC<LessonGridProps> = ({ lessons, progress, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-72 aura-card animate-pulse" />
                ))}
            </div>
        );
    }

    if (lessons.length === 0) {
        return (
            <div className="text-center py-24 aura-card bg-white/50 backdrop-blur-sm border-dashed border-sky-200">
                <p className="text-slate-400 font-bold text-lg mb-6">No lessons published yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lessons.map((lesson, index) => (
                <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    progress={progress?.lessons[lesson.id]}
                    index={index}
                />
            ))}
        </div>
    );
};
