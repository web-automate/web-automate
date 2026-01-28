import { prisma } from "@repo/database";
import { exec } from "child_process";
import fs from "fs-extra";
import path from "path";
import { promisify } from "util";
import { env } from "../config/env";

const execAsync = promisify(exec);

export class DeleteWebsiteService {
  private static getPaths(domain: string) {
    const root = path.resolve(env.ROOT_BUILD_PATH);
    return {
      publicDir: path.join(root, "public", domain),
      nginxConfigPath: path.join(root, "nginx", "available", `${domain}.conf`),
      nginxEnabledPath: path.join(root, "nginx", "enabled", `${domain}.conf`),
      systemNginxAvailable: `/etc/nginx/sites-available/${domain}.conf`,
      systemNginxEnabled: `/etc/nginx/sites-enabled/${domain}.conf`,
    };
  }

  private static async notifyWebhook(websiteId: string, success: boolean, message: string, error?: any) {
    try {
      await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/webhook/delete-website`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": env.API_KEY || ""
        },
        body: JSON.stringify({
          websiteId,
          success,
          message,
          details: error ? error.message : undefined
        }),
      });
    } catch (e) {
      console.error("[DELETE-WEBHOOK-ERROR]", e);
    }
  }

  static async delete(websiteId: string) {
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!website) return;

    const domain = website.domain;
    const paths = this.getPaths(domain);

    try {
      if (await fs.pathExists(paths.publicDir)) {
        await fs.remove(paths.publicDir);
      }

      await this.cleanupNginx(domain, paths);

      // Jika sampai sini tanpa throw, berarti sukses
      await this.notifyWebhook(websiteId, true, `Successfully cleaned up files and Nginx for ${domain}`);

    } catch (error) {
      console.error(`[DELETE] Error for ${domain}:`, error);
      await this.notifyWebhook(websiteId, false, `Failed to cleanup files for ${domain}`, error);
      throw error;
    }
  }

  private static async cleanupNginx(domain: string, paths: any) {
    if (await fs.pathExists(paths.nginxConfigPath)) await fs.remove(paths.nginxConfigPath);
    if (await fs.pathExists(paths.nginxEnabledPath)) await fs.remove(paths.nginxEnabledPath);

    if (process.platform === 'win32') return;

    await execAsync(`sudo rm -f ${paths.systemNginxEnabled}`);
    await execAsync(`sudo rm -f ${paths.systemNginxAvailable}`);
    await execAsync(`sudo nginx -t && sudo systemctl reload nginx`);
  }
}