import { supabase } from "@/lib/supabase";
import { Lesson, Word } from "@/types";

export const lessonService = {
    async getLessons(questId?: string): Promise<Lesson[]> {
        let query = supabase
            .from("lessons")
            .select("*, words(*)")
            .order("created_at", { ascending: true });

        if (questId) {
            query = query.eq("quest_id", questId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data.map((lesson: any) => ({
            ...lesson,
            responseTimer: lesson.response_timer,
            words: lesson.words || [],
        }));
    },

    async getLessonById(id: string): Promise<Lesson | null> {
        const { data: lesson, error: lessonError } = await supabase
            .from("lessons")
            .select("*")
            .eq("id", id)
            .single();

        if (lessonError) {
            if (lessonError.code === "PGRST116") return null;
            throw lessonError;
        }

        const { data: words, error: wordsError } = await supabase
            .from("words")
            .select("*")
            .eq("lesson_id", id)
            .order("created_at", { ascending: true });

        if (wordsError) throw wordsError;

        return {
            ...lesson,
            responseTimer: lesson.response_timer,
            words: words || [],
        };
    },

    async createLesson(lessonData: Omit<Lesson, "id">): Promise<string> {
        const { title, description, responseTimer, words, quest_id } = lessonData;

        const { data: lesson, error: lessonError } = await supabase
            .from("lessons")
            .insert([{
                title,
                description,
                response_timer: responseTimer,
                icon: "🎓",
                quest_id
            }])
            .select()
            .single();

        if (lessonError) throw lessonError;

        const wordsWithLessonId = words.map((w) => ({
            lesson_id: lesson.id,
            value: w.value.toString(),
            word: w.word,
            alts: w.alts || [],
        }));

        const { error: wordsError } = await supabase
            .from("words")
            .insert(wordsWithLessonId);

        if (wordsError) throw wordsError;

        return lesson.id;
    },

    async updateLesson(id: string, lessonData: Omit<Lesson, "id">): Promise<void> {
        const { title, description, responseTimer, words, quest_id } = lessonData;

        const { error: lessonError } = await supabase
            .from("lessons")
            .update({
                title,
                description,
                response_timer: responseTimer,
                quest_id
            })
            .eq("id", id);

        if (lessonError) throw lessonError;

        // Simpler to delete and re-insert words
        const { error: deleteWordsError } = await supabase
            .from("words")
            .delete()
            .eq("lesson_id", id);

        if (deleteWordsError) throw deleteWordsError;

        const wordsWithLessonId = words.map((w) => ({
            lesson_id: id,
            value: w.value.toString(),
            word: w.word,
            alts: w.alts || [],
        }));

        const { error: wordsError } = await supabase
            .from("words")
            .insert(wordsWithLessonId);

        if (wordsError) throw wordsError;
    },

    async deleteLesson(id: string): Promise<void> {
        // Cascade delete should be handled by DB, but manual cleanup is safer if not configured
        await supabase.from("words").delete().eq("lesson_id", id);

        const { error, count } = await supabase
            .from("lessons")
            .delete({ count: "exact" })
            .eq("id", id);

        if (error) throw error;
        if (count === 0) throw new Error("Lesson not found");
    },
};
