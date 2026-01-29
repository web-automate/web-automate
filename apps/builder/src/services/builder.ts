import { Author, prisma, StaticPage, StaticPageSeo, Template, Website, WebsiteSeo, WebsiteStatus } from "@repo/database";
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

export interface BuildTypeWebsitePayload {
  websiteId: string;
  mode: 'manual' | 'webhook' | 'auto';
}

export class BuilderService {
  private static getPaths(domain: string) {
    const root = path.resolve(env.ROOT_BUILD_PATH);
    return {
      tempDir: path.join(root, "temp", domain),
      publicDir: path.join(root, "public", domain),
      // Hugo default output folder is 'public' inside the working directory
      hugoOutputDir: path.join(root, "temp", domain, "public"),
      nginxConfigPath: path.join(root, "nginx", "available", `${domain}`),
      nginxEnabledPath: path.join(root, "nginx", "enabled", `${domain}`),
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
          status,
          message,
          details: error ? error.message : undefined
        }),
      });
    } catch (e) {
      console.error("Failed to send webhook notification:", e);
    }
  }

  static async build(websiteId: string, mode: string) {
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
    if (!website.template?.source) throw new Error(`Template for website ${websiteId} has no source`);

    const domain = website.domain || website.id;
    const paths = this.getPaths(domain);

    try {
      // 1. Initializing Structure & Submodules
      await this.notifyWebhook(websiteId, 'BUILDING', 'Cleaning up and cloning repository...');
      await fs.remove(paths.tempDir);
      await execAsync(`git clone --recursive ${website.template.source} "${paths.tempDir}"`);

      // 2. Preparing Data
      await this.notifyWebhook(websiteId, 'BUILDING', 'Preparing content and data files...');
      await this.prepareData(paths.tempDir, website as WebsiteWithRelations);

      // 3. Running PNPM Install (to prepare Tailwind/PostCSS in theme)
      await this.notifyWebhook(websiteId, 'BUILDING', 'Installing dependencies with pnpm...');
      await execAsync(`pnpm install`, { cwd: paths.tempDir });
      await execAsync(`pnpm install`, { cwd: paths.tempDir });
      const initialOutput = await execAsync(`pnpm initial`, {
        cwd: paths.tempDir,
        env: {
          ...process.env,
          GOCACHE: path.join(paths.tempDir, ".gocache"),
        }
      });
      console.log(initialOutput.stdout);

      // 4. Tahap Hugo Build
      await this.notifyWebhook(websiteId, 'BUILDING', 'Running Hugo generation...');
      await this.runHugoBuild(paths.tempDir);

      // 5. Tahap Deploy & Nginx
      await this.notifyWebhook(websiteId, 'BUILDING', 'Deploying and configuring Nginx...');
      await this.deployAndCleanup(paths.hugoOutputDir, paths.publicDir, paths.tempDir);
      await this.setupNginx(domain, paths.publicDir, paths.nginxConfigPath);

      // 6. Tahap SSL Certbot
      if (process.env.NODE_ENV === 'production') {
        await this.notifyWebhook(websiteId, 'BUILDING', 'Securing with SSL Certbot...');
        await this.setupSSL(domain);
      }

      await this.notifyWebhook(websiteId, 'SUCCESS', 'Website built and deployed successfully.');
      console.log(`[${mode.toUpperCase()}] Success: ${domain}`);

    } catch (error) {
      await this.notifyWebhook(websiteId, 'FAILED', 'Build process failed.', error);
      console.error(`[${mode.toUpperCase()}] Failed:`, error);
      // Clean up temp only if it's a critical failure in production
      if (process.env.NODE_ENV === 'production') await fs.remove(paths.tempDir);
      throw error;
    }
  }

  private static async prepareData(targetDir: string, website: WebsiteWithRelations) {
    const dataDir = path.join(targetDir, "data");
    const contentDir = path.join(targetDir, "content");

    await fs.ensureDir(dataDir);
    await fs.ensureDir(contentDir);

    // Save website metadata for Hugo data templates
    await fs.writeJson(path.join(dataDir, "website.json"), website, { spaces: 2 });

    // Generate markdown files for articles
    const tasks = website.articles.map(async (article: ArticleWithRelations) => {
      const fileName = `${article.slug || article.id}.md`;
      const frontmatter = HugoTransformer.toFrontmatter(article);
      const fullContent = HugoTransformer.formatMarkdown(frontmatter, article.content);
      return fs.writeFile(path.join(contentDir, fileName), fullContent);
    });

    await Promise.all(tasks);
  }

  private static async runHugoBuild(workingDir: string) {
    await execAsync(`hugo --gc --minify`, { cwd: workingDir, env: { ...process.env } });
  }

  private static async deployAndCleanup(source: string, destination: string, temp: string) {
    await fs.ensureDir(destination);
    await fs.emptyDir(destination);

    if (await fs.pathExists(source)) {
      await fs.copy(source, destination);
    }

    if (process.env.NODE_ENV === 'production') {
      await fs.remove(temp);
    }
  }

  private static async setupNginx(domain: string, publicDir: string, configPath: string) {
    console.log(`[NGINX] Starting configuration for domain: ${domain}`);
    const config = nginxConfig(domain, publicDir);

    try {
      // 1. Persiapkan folder internal (temp)
      await fs.ensureDir(path.dirname(configPath));
      await fs.writeFile(configPath, config);
      console.log(`[NGINX] Local config file written to: ${configPath}`);

      if (process.platform === 'win32') {
        console.log(`[WINDOWS-TEST] Skipping Linux commands. Nginx config: ${configPath}`);
        return;
      }

      // 2. Copy ke sites-available sistem
      const targetAvailable = `/etc/nginx/sites-available/${path.basename(configPath)}`;
      await execAsync(`sudo cp ${configPath} ${targetAvailable}`);
      console.log(`[NGINX] Config copied to: ${targetAvailable}`);

      // 3. Kelola symlink di sites-enabled sistem
      const systemEnabledPath = `/etc/nginx/sites-enabled/${path.basename(configPath)}`;
      await execAsync(`sudo ln -sf ${targetAvailable} ${systemEnabledPath}`);
      console.log(`[NGINX] Symbolic link created: ${systemEnabledPath} -> ${targetAvailable}`);

      // 4. Opsional: Hapus default config jika mengganggu (Welcome to nginx)
      const defaultEnabled = '/etc/nginx/sites-enabled/default';
      if (fs.existsSync(defaultEnabled)) {
        console.log(`[NGINX] Removing default config to prevent conflict...`);
        await execAsync(`sudo rm ${defaultEnabled}`);
      }

      // 5. Test & Reload
      console.log(`[NGINX] Testing configuration...`);
      const { stdout: testOut } = await execAsync(`sudo nginx -t`);
      console.log(`[NGINX] Test result: ${testOut.trim()}`);

      await execAsync(`sudo systemctl reload nginx`);
      console.log(`[NGINX] Successfully reloaded Nginx for ${domain}`);

    } catch (error: any) {
      console.error(`[NGINX-ERROR] Failed to setup Nginx for ${domain}:`, error.message);
      throw error; // Lempar error agar ditangkap oleh try-catch di fungsi build()
    }
  }

  private static async setupSSL(domain: string) {
    if (process.platform === 'win32') return;

    try {
      const email = env.ADMIN_EMAIL || "admin@" + domain;

      console.log(`[SSL] Requesting certificate for ${domain}...`);

      const { stdout, stderr } = await execAsync(
        `sudo certbot --nginx -d ${domain} --non-interactive --agree-tos -m ${email} --keep-until-expiring`
      );

      console.log(stdout);
      if (stderr) console.warn(`[SSL-WARN] ${stderr}`);

      await execAsync(`sudo systemctl reload nginx`);

    } catch (error: any) {
      console.error(`[SSL-ERROR] Certbot failed for ${domain}:`, error.message);
    }
  }
}