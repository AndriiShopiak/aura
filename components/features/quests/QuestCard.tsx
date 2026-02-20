"use client";

import React from "react";
import Link from "next/link";
import { Quest } from "@/types";
import { Card } from "@/components/ui/Card";

interface QuestCardProps {
    quest: Quest;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest }) => {

    return (
        <Link href={`/map?questId=${quest.id}`} className="group">
            <Card
                whileHover={{ y: -6 }}
                className="p-0 h-full flex flex-col items-start bg-amber-400 shadow-xl rounded-[2.5rem]"
                gradient
            >

                <div className="p-8 pt-6 w-full flex flex-col grow">
                    <div className="flex items-center gap-3 mb-4">
                        {quest.icon || "🗺️"}
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors truncate">
                            {quest.title}
                        </h3>
                    </div>

                    <p className="text-slate-500 text-sm leading-relaxed mb-8 grow font-medium group-hover:text-slate-700">
                        {quest.description}
                    </p>

                    <div className="w-full flex items-center justify-between pt-6 border-t border-slate-100 group-hover:border-primary/20">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary transition-colors">
                            Explore Quest
                        </span>
                    </div>
                </div>
            </Card>
        </Link>
    );
};
