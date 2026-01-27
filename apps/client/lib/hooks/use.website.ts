import { Template, Website } from "@repo/database";
import { useQuery } from "@tanstack/react-query";

export type WebsiteWithRelations = Website & {
    template: Template | null;
};

export const useWebsites = () => {
    return useQuery({
        queryKey: ["websites"],
        queryFn: async () => {
            const res = await fetch("/api/websites");
            
            if (!res.ok) {
                throw new Error("Gagal mengambil data website");
            }
            
            return res.json() as Promise<WebsiteWithRelations[]>;
        },
    });
};

export const getWebsiteById = (id: string) => {
    return useQuery({
        queryKey: ["website", id],
        queryFn: async () => {
            const res = await fetch(`/api/websites/${id}`);
            
            if (!res.ok) {
                throw new Error("Gagal mengambil data website");
            }
            
            return res.json() as Promise<WebsiteWithRelations>;
        },
    });
};