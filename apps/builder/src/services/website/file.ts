import { GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs-extra";
import path from "path";
import { env } from "src/config/env";
import { s3Client } from "src/lib/s3SDK";
import { HugoTransformer } from "../../lib/transformer";
import { WebsiteWithRelations } from "./types";

export class FileService {
  static async prepareDirectoryStructure(targetDir: string) {
    const dataDir = path.join(targetDir, "data");
    const contentDir = path.join(targetDir, "content");
    await fs.ensureDir(dataDir);
    await fs.ensureDir(contentDir);
    return { dataDir, contentDir };
  }

  static async writeWebsiteData(dataDir: string, website: WebsiteWithRelations) {
    return fs.writeJson(path.join(dataDir, "website.json"), website, { spaces: 2 });
  }

  static async writeArticles(contentDir: string, articles: WebsiteWithRelations['articles']) {
    const tasks = articles.map(async (article) => {
      const fileName = `${article.slug || article.id}.md`;
      const category = article.category?.toLowerCase();
      const subCategory = article.subCategory?.toLowerCase();
      const frontmatter = HugoTransformer.toFrontmatter(article);
      const fullContent = HugoTransformer.formatMarkdown(frontmatter, article.content);

      let targetDir = contentDir;

      if (category) {
        targetDir = path.join(contentDir, category);
        if (subCategory) {
          targetDir = path.join(targetDir, subCategory);
        }
      }

      await fs.mkdir(targetDir, { recursive: true });

      return fs.writeFile(path.join(targetDir, fileName), fullContent);
    });
    return Promise.all(tasks);
  }

  static async downloadFromR2(targetDir: string, fileName: string, bucketKey: string) {
    const staticDir = path.join(targetDir, "static");
    await fs.ensureDir(staticDir);

    const filePath = path.join(staticDir, fileName);

    const response = await s3Client.send(new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME!,
      Key: bucketKey,
    }));

    if (response.Body) {
      fs.createWriteStream(filePath).end(await response.Body.transformToByteArray());
    }

    console.log(`[FILE] Downloaded ${fileName} to static folder`);
  }

  static async transferBuildOutput(source: string, destination: string) {
    await fs.ensureDir(destination);
    await fs.emptyDir(destination);
    if (await fs.pathExists(source)) {
      await fs.copy(source, destination);
    }
  }

  static async writeMaintenanceFile(targetDir: string) {
    console.log(`[FILE] Writing maintenance file to ${targetDir}`);
    const maintenanceFilePath = path.join(targetDir, ".maintenance");
    await fs.writeFile(maintenanceFilePath, "");
  }

  static async cleanup(path: string) {
    await fs.remove(path);
  }
}