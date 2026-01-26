import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const adminKey = req.nextUrl.searchParams.get("adminKey");

    if (!adminKey) {
        return NextResponse.json({ error: "Key missing" }, { status: 401 });
    }

    if (adminKey.trim() !== process.env.ADMIN_SECRET_KEY?.trim()) {
        return NextResponse.json({ error: "Invalid key" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
}
