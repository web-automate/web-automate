import { Author, prisma, StaticPage, StaticPageSeo, Template, Website, WebsiteSeo } from "@repo/database";
import { exec } from "child_process";
import fs from "fs-extra";
import path from "path";
import { promisify } from "util";
import { env } from "../config/env";
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
    return {
      tempDir: path.join(env.ROOT_BUILD_PATH, "temp", domain),
      publicDir: path.join(env.ROOT_BUILD_PATH, "public", domain),
      hugoOutputDir: path.join(env.ROOT_BUILD_PATH, "temp", domain, "html"),
    };
  }

  static async build(websiteId: string, mode: "build" | "update") {
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
      await this.prepareData(paths.tempDir, website as WebsiteWithRelations);

      await this.runHugoBuild(paths.tempDir);

      await this.deployAndCleanup(paths.hugoOutputDir, paths.publicDir, paths.tempDir);

      console.log(`[${mode.toUpperCase()}] Success: ${domain}`);
    } catch (error) {
      console.error(`[${mode.toUpperCase()}] Failed:`, error);
      await fs.remove(paths.tempDir);
      throw error;
    }
  }

  private static async prepareData(targetDir: string, website: WebsiteWithRelations) {
    const dataDir = path.join(targetDir, "data");
    const contentDir = path.join(targetDir, "content");

    await fs.ensureDir(dataDir);
    await fs.ensureDir(contentDir);

    await fs.writeJson(path.join(dataDir, "website.json"), website);

    const tasks = website.articles.map(async (article: ArticleWithRelations) => {
      const fileName = `${article.slug || article.id}.md`;
      const frontmatter = HugoTransformer.toFrontmatter(article);
      const fullContent = HugoTransformer.formatMarkdown(frontmatter, article.content);
      return fs.writeFile(path.join(contentDir, fileName), fullContent);
    });

    await Promise.all(tasks);
  }

  private static async runHugoBuild(workingDir: string) {
    await execAsync(`hugo -s ${workingDir} -d html`);
  }

  private static async deployAndCleanup(source: string, destination: string, temp: string) {
    await fs.emptyDir(destination);
    
    await fs.copy(source, destination);

    await fs.remove(temp);
  }
}