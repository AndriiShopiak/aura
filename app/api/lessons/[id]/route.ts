import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

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

        return NextResponse.json({ ...lesson, words });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
