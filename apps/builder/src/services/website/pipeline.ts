import { WebsiteStatus } from "@repo/database";
import { env } from "../../config/env";

export class PipelineService {
  static async notify(websiteId: string, status: WebsiteStatus, message: string, error?: any) {
    console.log(`[${status}] ${websiteId}: ${message}`);
    
    try {
      const response = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/webhook/builder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.API_KEY || ""
        },
        body: JSON.stringify({
          websiteId,
          status,
          message,
          details: error ? error.message : undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook responded with ${response.status}`);
      }
    } catch (e) {
      console.error("Critical: Failed to send webhook notification:", e);
    }
  }

  static async runStep(
    websiteId: string, 
    stepName: string, 
    action: () => Promise<any>
  ) {
    await this.notify(websiteId, 'BUILDING', stepName);
    try {
      return await action();
    } catch (error) {
      await this.notify(websiteId, 'FAILED', `Failed during: ${stepName}`, error);
      throw error;
    }
  }
}