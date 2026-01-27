import { prisma } from "@repo/database";
import fs from "fs-extra";
import path from "path";
import { env } from "../config/env";
import { HugoTransformer } from "../lib/transformer";

export class BuilderService {
  static async build(websiteId: string) {
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        seo: true,
        template: true,
        articles: {
          include: { seo: true, author: true },
        },
      },
    });

    if (!website) throw new Error(`Website ${websiteId} not found`);

    const websitePath = path.join(env.ROOT_BUILD_PATH, website.domain || website.id);
    const dataDir = path.join(websitePath, "data");
    const contentDir = path.join(websitePath, "content");

    await fs.ensureDir(dataDir);
    await fs.ensureDir(contentDir);

    await fs.writeJson(path.join(dataDir, "website.json"), website, { spaces: 2 });

    const tasks = website.articles.map(async (article) => {
      const fileName = `${article.slug || article.id}.md`;
      const filePath = path.join(contentDir, fileName);

      const frontmatter = HugoTransformer.toFrontmatter(article as any);
      const fullContent = HugoTransformer.formatMarkdown(frontmatter, article.content);

      return fs.writeFile(filePath, fullContent);
    });

    await Promise.all(tasks);
  }
}