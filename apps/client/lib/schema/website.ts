import { z } from "zod";

const BuildType = {
    INIT_WEBSITE: "INIT_WEBSITE",
    BUILD_WEBSITE: "BUILD_WEBSITE",
}

const createWebsiteSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  domain: z.string().min(3, "Domain must be at least 3 characters"),
  templateId: z.string().min(1, "Template is required"),
  language: z.enum(["id", "en"]).default("id"),
  type: z.enum(BuildType).default(BuildType.INIT_WEBSITE),
});

export type CreateWebsiteInput = z.infer<typeof createWebsiteSchema>;

export default createWebsiteSchema;