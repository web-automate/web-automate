import { z } from "zod";

const createWebsiteSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  domain: z.string().min(3, "Domain must be at least 3 characters"),
  templateId: z.string().min(1, "Template is required"),
});

export default createWebsiteSchema;