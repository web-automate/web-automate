import { prisma } from '@repo/database';
import fs from 'fs-extra';
import path from 'path';
import { env } from '../config/env';

export class BuilderService {
  static async build(websiteId: string) {
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        seo: true,
        template: true,
        articles: { include: { seo: true, author: true } }
      }
    });

    if (!website) throw new Error(`Website ${websiteId} not found`);

    const dataDir = path.join(env.ROOT_BUILD_PATH, 'data');
    const contentDir = path.join(env.ROOT_BUILD_PATH, 'content');

    await fs.ensureDir(dataDir);
    await fs.ensureDir(contentDir);

    await fs.writeJson(path.join(dataDir, 'website.json'), website, { spaces: 2 });

    for (const article of website.articles) {
      const fileName = `${article.slug || article.id}.md`;
      const frontmatter = {
        title: article.title,
        date: article.publishedAt,
        author: article.author?.name,
        description: article.seo?.metaDescription,
      };

      const content = `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n\n${article.content || ''}`;
      await fs.writeFile(path.join(contentDir, fileName), content);
    }
  }
}