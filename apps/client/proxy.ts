import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    const origin = request.headers.get("origin");
    const apiKey = request.headers.get("x-api-key");
    const userAgent = request.headers.get("user-agent");
    const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!session) {
        return NextResponse.redirect(new URL("/auth", request.url));
    }

    if (origin && origin !== allowedOrigin && apiKey !== process.env.API_KEY && userAgent?.includes("Mozilla")) {
        return new NextResponse(null, {
            status: 403,
            statusText: "Forbidden",
            headers: {
                "Content-Type": "text/plain",
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard",
        "/settings",
        "/websites",
        "/websites/:path*",
        "/website/:path*",
        "/api/websites/:path*",
        "/api/templates/:path*",
        "/api/articles/:path*"
    ],
};