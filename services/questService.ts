import { supabase } from "@/lib/supabase";
import { Quest } from "@/types";

export const questService = {
    async getQuests(): Promise<Quest[]> {
        const { data, error } = await supabase
            .from("quests")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) throw error;

        return data;
    },

    async getQuestById(id: string): Promise<Quest | null> {
        const { data, error } = await supabase
            .from("quests")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null;
            throw error;
        }

        return data;
    },

    async createQuest(questData: Omit<Quest, "id">): Promise<string> {
        const { title, description, icon } = questData;

        const { data, error } = await supabase
            .from("quests")
            .insert([{ title, description, icon: icon || "🗺️" }])
            .select()
            .single();

        if (error) throw error;

        return data.id;
    },

    async updateQuest(id: string, questData: Omit<Quest, "id">): Promise<void> {
        const { title, description, icon } = questData;

        const { error } = await supabase
            .from("quests")
            .update({ title, description, icon })
            .eq("id", id);

        if (error) throw error;
    },

    async deleteQuest(id: string): Promise<void> {
        const { error } = await supabase
            .from("quests")
            .delete()
            .eq("id", id);

        if (error) throw error;
    }
};
