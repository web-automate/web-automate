import type { BuildTypeWebsitePayload } from "@repo/database";

export interface BuildPayload {
  websiteId: string;
  mode: BuildTypeWebsitePayload;
}