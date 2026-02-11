import { BuildTypeWebsitePayload, prisma, WebsiteStatus } from "@repo/database";
import path from "path";
import { env } from "../../config/env";
import { FileService } from "./file";
import { InfraService } from "./infra";
import { PipelineService } from "./pipeline";
import { ShellService } from "./shell";
import { BuildPaths, WebsiteWithRelations } from "./types";

export class BuilderService {
    private static getPaths(domain: string): BuildPaths {
        const root = path.resolve(env.ROOT_BUILD_PATH);
        return {
            tempDir: path.join(root, "temp", domain),
            publicDir: path.join(root, "public", domain),
            hugoOutputDir: path.join(root, "temp", domain, "public"),
            nginxConfigPath: path.join(root, "nginx", "available", domain),
            nginxEnabledPath: path.join(root, "nginx", "enabled", domain),
        };
    }

    private static async getWebsiteData(websiteId: string): Promise<WebsiteWithRelations> {
        const website = await prisma.website.findUnique({
            where: { id: websiteId },
            include: {
                seo: true,
                template: true,
                authors: true,
                articles: { include: { seo: true, author: true } },
                staticPages: { include: { seo: true } },
            },
        });

        if (!website) throw new Error(`Website ${websiteId} not found`);
        if (!website.template?.source) throw new Error(`Template source for ${websiteId} is missing`);

        return website as WebsiteWithRelations;
    }

    static async build(websiteId: string, mode: BuildTypeWebsitePayload) {
        const website = await this.getWebsiteData(websiteId);
        const domain = website.domain || website.id;
        const paths = this.getPaths(domain);

        try {
            await PipelineService.runStep(websiteId, 'Initializing Structure', async () => {
                await FileService.cleanup(paths.tempDir);
                try {
                    await ShellService.cloneRepo(website.template!.source!, paths.tempDir);
                } catch (error) {
                    console.error(`Failed to clone repository for ${websiteId}: ${error}`);
                    await FileService.cleanup(paths.tempDir);
                    await PipelineService.notify(
                        websiteId,
                        'FAILED',
                        `Failed to clone repository for ${websiteId}: ${error}`
                    );
                    throw new Error(`Failed to clone repository for ${websiteId}`);
                }
            });

            await PipelineService.runStep(websiteId, 'Preparing Data', async () => {
                const { dataDir, contentDir } = await FileService.prepareDirectoryStructure(paths.tempDir);
                await FileService.writeWebsiteData(dataDir, website);
                await FileService.writeArticles(contentDir, website.articles);
                if (website.favicon) {
                    const bucketKey = `${env.NODE_ENV}/websites/${websiteId}/static/favicon.ico`;
                    await FileService.downloadFromR2(paths.tempDir, 'favicon.ico', bucketKey);
                }
                if (website.logoRectangle) {
                    const bucketKey = `${env.NODE_ENV}/websites/${websiteId}/static/logoRectangle.webp`;
                    await FileService.downloadFromR2(paths.tempDir, 'logoRectangle.webp', bucketKey);
                }
                if (website.logoSquare) {
                    const bucketKey = `${env.NODE_ENV}/websites/${websiteId}/static/logoSquare.webp`;
                    await FileService.downloadFromR2(paths.tempDir, 'logoSquare.webp', bucketKey);
                }
            });

            await PipelineService.runStep(websiteId, 'Environment Setup', async () => {
                await ShellService.installDeps(paths.tempDir);
            });

            await PipelineService.runStep(websiteId, 'Hugo Generation', async () => {
                await ShellService.runHugo(paths.tempDir);
            });

            await PipelineService.runStep(websiteId, 'Deployment & Nginx', async () => {
                await FileService.transferBuildOutput(paths.hugoOutputDir, paths.publicDir);
                if (website.status === WebsiteStatus.MAINTENANCE) {
                    await FileService.writeMaintenanceFile(paths.publicDir);
                }
                if (mode === BuildTypeWebsitePayload.INIT_WEBSITE) {
                    await InfraService.setupNginx(domain, paths.publicDir, paths.nginxConfigPath);
                }
            });

            if (process.env.NODE_ENV === 'production' && mode === BuildTypeWebsitePayload.INIT_WEBSITE) {
                await PipelineService.runStep(websiteId, 'SSL Configuration', async () => {
                    await InfraService.setupSSL(domain);
                });

            }

            await FileService.cleanup(paths.tempDir);

            await PipelineService.notify(
                websiteId,
                website.status === WebsiteStatus.MAINTENANCE ? 'MAINTENANCE' : 'SUCCESS',
                `Website ${domain} built successfully via ${mode}.`
            );

            console.log(`[BUILD-DONE] ${domain} is now live.`);

        } catch (error) {
            console.error(`[BUILD-ERROR] ${domain} failed:`, error);

            if (process.env.NODE_ENV === 'production') {
                await FileService.cleanup(paths.tempDir);
            }

            throw error;
        }
    }
}