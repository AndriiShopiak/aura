import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const { data, error } = await supabase
            .from("lessons")
            .select("*, words(*)")
            .order("created_at", { ascending: false });

        if (error) throw error;

        const mappedData = data.map(lesson => ({
            ...lesson,
            responseTimer: lesson.response_timer
        }));

        return NextResponse.json(mappedData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, description, words, responseTimer, adminKey } = body;

        // Basic admin key validation
        if (!adminKey) {
            return NextResponse.json({ error: "Admin key is missing in request body" }, { status: 401 });
        }

        if (adminKey.trim() !== process.env.ADMIN_SECRET_KEY?.trim()) {
            return NextResponse.json({ error: "Invalid admin key" }, { status: 401 });
        }

        // 1. Insert lesson
        const { data: lesson, error: lessonError } = await supabase
            .from("lessons")
            .insert([{ title, description, response_timer: responseTimer, icon: "🎓" }])
            .select()
            .single();

        if (lessonError) throw lessonError;

        // 2. Insert words
        const wordsWithLessonId = words.map((w: any) => ({
            lesson_id: lesson.id,
            value: w.value.toString(),
            word: w.word,
            alts: w.alts || []
        }));

        const { error: wordsError } = await supabase
            .from("words")
            .insert(wordsWithLessonId);

        if (wordsError) throw wordsError;

        return NextResponse.json({ success: true, lessonId: lesson.id });
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
