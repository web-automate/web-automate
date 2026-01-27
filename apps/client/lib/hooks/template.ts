import { Template } from "@repo/database";
import { useQuery } from "@tanstack/react-query";

export const getTemplates = () => {
    return useQuery({
        queryKey: ["templates"],
        queryFn: async () => {
            const res = await fetch("/api/templates");
            
            if (!res.ok) {
                throw new Error("Gagal mengambil data template");
            }
            
            return res.json() as Promise<Template[]>;
        },
    });
};