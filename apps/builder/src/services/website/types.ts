import { Article, Author, StaticPage, StaticPageSeo, Template, Website, WebsiteSeo } from "@repo/database";

export interface StaticPageWithRelations extends StaticPage {
  seo: StaticPageSeo | null;
}

export interface WebsiteWithRelations extends Website {
  articles: (Article & { seo: any; author: Author | null })[];
  authors: Author[];
  seo: WebsiteSeo | null;
  staticPages: StaticPageWithRelations[];
  template: Template | null;
}

export interface BuildPaths {
  tempDir: string;
  publicDir: string;
  hugoOutputDir: string;
  nginxConfigPath: string;
  nginxEnabledPath: string;
}