import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get("q");

    if (!query || query.trim().length === 0) {
        return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
        return NextResponse.json({ error: "Unsplash key not configured" }, { status: 500 });
    }

    try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=9&orientation=squarish`;
        const res = await fetch(url, {
            headers: { Authorization: `Client-ID ${accessKey}` },
        });

        if (!res.ok) {
            const isRateLimit =
                res.status === 403 &&
                res.headers.get("X-Ratelimit-Remaining") === "0";

            if (isRateLimit || res.status === 429) {
                return NextResponse.json(
                    { error: "Rate limit exceeded", errorCode: "RATE_LIMIT" },
                    { status: 429 }
                );
            }

            return NextResponse.json({ error: "Unsplash API error" }, { status: res.status });
        }

        const data = await res.json();

        const photos = data.results.map((photo: any) => ({
            id: photo.id,
            thumbUrl: photo.urls.small,
            fullUrl: photo.urls.regular,
            altDescription: photo.alt_description ?? query,
            authorName: photo.user.name,
            authorLink: photo.user.links.html,
        }));

        return NextResponse.json({ photos });
    } catch {
        return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
    }
}
