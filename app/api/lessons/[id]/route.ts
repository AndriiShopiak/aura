import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: "Invalid ID" },
                { status: 400 }
            );
        }

        const { data: lesson, error: lessonError } = await supabase
            .from("lessons")
            .select("*")
            .eq("id", id)
            .single();

        if (lessonError) throw lessonError;

        const { data: words, error: wordsError } = await supabase
            .from("words")
            .select("*")
            .eq("lesson_id", id)
            .order("created_at", { ascending: true });

        if (wordsError) throw wordsError;

        return NextResponse.json({
            ...lesson,
            responseTimer: lesson.response_timer,
            words
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { title, description, words, responseTimer, adminKey } = body;

        if (!adminKey) {
            return NextResponse.json({ error: "Admin key is missing in request body" }, { status: 401 });
        }

        if (adminKey.trim() !== process.env.ADMIN_SECRET_KEY?.trim()) {
            return NextResponse.json({ error: "Invalid admin key" }, { status: 401 });
        }

        // 1. Update lesson
        const { error: lessonError } = await supabase
            .from("lessons")
            .update({ title, description, response_timer: responseTimer })
            .eq("id", id);

        if (lessonError) throw lessonError;

        // 2. Update words (simpler to delete and re-insert for this scale)
        const { error: deleteWordsError } = await supabase
            .from("words")
            .delete()
            .eq("lesson_id", id);

        if (deleteWordsError) throw deleteWordsError;

        const wordsWithLessonId = words.map((w: any) => ({
            lesson_id: id,
            value: w.value.toString(),
            word: w.word,
            alts: w.alts || []
        }));

        const { error: wordsError } = await supabase
            .from("words")
            .insert(wordsWithLessonId);

        if (wordsError) throw wordsError;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const adminKey = req.nextUrl.searchParams.get("adminKey");

        if (!adminKey) {
            return NextResponse.json({ error: "Admin key is missing in URL" }, { status: 401 });
        }

        if (adminKey.trim() !== process.env.ADMIN_SECRET_KEY?.trim()) {
            return NextResponse.json({ error: "Invalid admin key" }, { status: 401 });
        }

        // Cascade delete should be handled by DB, but if not:
        const { error: wordsError } = await supabase
            .from("words")
            .delete()
            .eq("lesson_id", id);

        if (wordsError) throw wordsError;

        const { error: lessonError, count } = await supabase
            .from("lessons")
            .delete({ count: 'exact' })
            .eq("id", id);

        if (lessonError) throw lessonError;

        if (count === 0) {
            return NextResponse.json({
                error: "Lesson not found or deletion not allowed",
                details: "Database returned 0 affected rows. This is likely an RLS policy issue."
            }, { status: 403 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
