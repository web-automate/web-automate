import { Author, BuildTypeWebsitePayload, prisma, StaticPage, StaticPageSeo, Template, Website, WebsiteSeo, WebsiteStatus } from "@repo/database";
import { exec } from "child_process";
import fs from "fs-extra";
import path from "path";
import { promisify } from "util";
import { env } from "../config/env";
import nginxConfig from "../lib/consts/nginx";
import { ArticleWithRelations, HugoTransformer } from "../lib/transformer";

const execAsync = promisify(exec);

export interface WebsiteWithRelations extends Website {
  articles: ArticleWithRelations[];
  authors: Author[];
  seo: WebsiteSeo | null;
  staticPages: StaticPageWithRelations[];
  template: Template | null;
}

export interface StaticPageWithRelations extends StaticPage {
  seo: StaticPageSeo | null;
}

export class BuilderService {
  private static getPaths(domain: string) {
    const root = path.resolve(env.ROOT_BUILD_PATH);
    return {
      tempDir: path.join(root, "temp", domain),
      publicDir: path.join(root, "public", domain),
      hugoOutputDir: path.join(root, "temp", domain, "html"),
      nginxConfigPath: path.join(root, "nginx", "available", `${domain}.conf`),
      nginxEnabledPath: path.join(root, "nginx", "enabled", `${domain}.conf`),
    };
  }

  private static async notifyWebhook(websiteId: string, status: WebsiteStatus, message: string, error?: any) {
    try {
        await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/webhook/builder`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "x-api-key": env.API_KEY || ""
            },
            body: JSON.stringify({
                websiteId,
                status, // 'BUILDING', 'SUCCESS', 'FAILED'
                message,
                details: error ? error.message : undefined
            }),
        });
    } catch (e) {
        console.error("Failed to send webhook notification:", e);
    }
}

  static async build(websiteId: string, mode: BuildTypeWebsitePayload) {
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        seo: true,
        template: true,
        articles: { include: { seo: true, author: true } },
        authors: true,
        staticPages: { include: { seo: true } },
      },
    });

    if (!website) throw new Error(`Website ${websiteId} not found`);

    const domain = website.domain || website.id;
    const paths = this.getPaths(domain);

    try {
        // Mulai Building
        await this.notifyWebhook(websiteId, 'BUILDING', 'Preparing data and directory...');
        
        await fs.remove(paths.tempDir);
        await this.prepareData(paths.tempDir, website as WebsiteWithRelations);
        
        // Tahap Hugo
        await this.notifyWebhook(websiteId, 'BUILDING', 'Running Hugo generation...');
        await fs.writeFile(path.join(paths.tempDir, "hugo.toml"), `title = "${website.name}"\npublishDir = "html"`);
        await this.runHugoBuild(paths.tempDir);

        // Tahap Deploy
        await this.notifyWebhook(websiteId, 'BUILDING', 'Deploying to public directory...');
        await this.deployAndCleanup(paths.hugoOutputDir, paths.publicDir, paths.tempDir);

        // Tahap Nginx
        await this.notifyWebhook(websiteId, 'BUILDING', 'Configuring Nginx...');
        await this.setupNginx(domain, paths.publicDir, paths.nginxConfigPath, paths.nginxEnabledPath);

        // Final Success
        await this.notifyWebhook(websiteId, 'SUCCESS', 'Website built and deployed successfully.');
        console.log(`[${mode.toUpperCase()}] Success: ${domain}`);

    } catch (error) {
        // Error Notification
        await this.notifyWebhook(websiteId, 'FAILED', 'Build process failed.', error);
        console.error(`[${mode.toUpperCase()}] Failed:`, error);
        if (process.env.NODE_ENV === 'production') await fs.remove(paths.tempDir);
        throw error;
    }
  }

  private static async prepareData(targetDir: string, website: WebsiteWithRelations) {
    const dataDir = path.join(targetDir, "data");
    const contentDir = path.join(targetDir, "content");

    await fs.ensureDir(dataDir);
    await fs.ensureDir(contentDir);

    await fs.writeJson(path.join(dataDir, "website.json"), website, { spaces: 2 });

    const tasks = website.articles.map(async (article: ArticleWithRelations) => {
      const fileName = `${article.slug || article.id}.md`;
      const frontmatter = HugoTransformer.toFrontmatter(article);
      const fullContent = HugoTransformer.formatMarkdown(frontmatter, article.content);
      return fs.writeFile(path.join(contentDir, fileName), fullContent);
    });

    await Promise.all(tasks);
  }

  private static async runHugoBuild(workingDir: string) {
    await execAsync(`hugo -s "${workingDir}" -d html`);
  }

  private static async deployAndCleanup(source: string, destination: string, temp: string) {
    await fs.ensureDir(destination);
    await fs.emptyDir(destination);
    if (await fs.pathExists(source)) {
      await fs.copy(source, destination);
    }
    if (process.env.NODE_ENV === 'production') await fs.remove(temp);
  }

  private static async setupNginx(domain: string, publicDir: string, configPath: string, enabledPath: string) {
    const config = nginxConfig(domain, publicDir);

    await fs.ensureDir(path.dirname(configPath));
    await fs.ensureDir(path.dirname(enabledPath));

    await fs.writeFile(configPath, config);
    
    if (process.platform === 'win32') {
      console.log(`[WINDOWS-TEST] Nginx config generated at: ${configPath}`);
      return;
    }

    await execAsync(`sudo cp ${configPath} /etc/nginx/sites-available/`);
    if (!fs.existsSync(enabledPath)) {
      await execAsync(`sudo ln -s ${configPath} ${enabledPath}`);
    }
    await execAsync(`sudo nginx -t && sudo systemctl reload nginx`);
  }
}