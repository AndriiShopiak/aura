"use client";

import React from "react";
import { useParams } from "next/navigation";
import Trainer from "@/components/Trainer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Lesson } from "@/types";

export default function TrainPage() {
    const { id } = useParams();
    const [lesson, setLesson] = React.useState<Lesson | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchLesson = async () => {
            try {
                const res = await fetch(`/api/lessons/${id}`);
                const data = await res.json();
                setLesson(data);
            } catch (err) {
                console.error("Failed to fetch lesson:", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchLesson();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-50">
                <div className="w-24 h-24 bg-indigo-100 animate-pulse rounded-3xl mb-8" />
                <div className="h-8 w-48 bg-neutral-200 animate-pulse rounded-lg" />
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-50">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">Lesson not found</h2>
                <Link href="/" className="text-indigo-600 font-bold hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
            <Trainer
                lessonId={id as string}
                title={lesson.title}
                words={lesson.words}
                responseTimer={lesson.responseTimer || 6}
                onComplete={(score) => {
                    console.log(`Finished ${lesson.title} with score ${score}`);
                }}
            />
        </div>
    );
}
