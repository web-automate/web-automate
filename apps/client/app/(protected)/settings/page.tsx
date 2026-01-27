import { apiServer } from "@/lib/hooks/server.api";
import { AiConfiguration } from "@repo/database";
import SettingsPageClient from "./page.client";

const SettingsPage = async () => {
    let aiData: AiConfiguration[] = [];
      try {
        aiData = await apiServer.GET(`/api/settings/ai`);
      } catch (error) {
        console.error("Failed to fetch AI configuration", error);
      }

      console.log("AI Configurations:", aiData);

    return (
        <SettingsPageClient aiConfig={aiData ? aiData : undefined} />    
    );
}

export default SettingsPage;