import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const { data, error } = await supabase
            .from("quests")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, description, icon, adminKey } = body;

        if (!adminKey) {
            return NextResponse.json({ error: "Admin key is missing" }, { status: 401 });
        }

        if (adminKey.trim() !== process.env.ADMIN_SECRET_KEY?.trim()) {
            return NextResponse.json({ error: "Invalid admin key" }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("quests")
            .insert([{ title, description, icon: icon || "🗺️" }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, quest: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
