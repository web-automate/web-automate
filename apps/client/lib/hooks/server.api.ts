import { headers } from "next/headers";
import { fetcher } from "../utils/api";

export const apiServer = {
  GET: async <T>(endpoint: string, customHeaders: Record<string, string> = {}): Promise<T> => {
    const headersList = await headers();
    const cookie = headersList.get("cookie") || "";

    const requestHeaders = {
      ...customHeaders,
      Cookie: cookie, 
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

    return fetcher(url, {
      headers: {
        ...requestHeaders,
        "Cache-Control": "no-store",
      },
    });
  },
};