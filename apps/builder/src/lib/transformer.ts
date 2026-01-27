import { Article, ArticleSeo, Author } from "@repo/database";

type ArticleWithRelations = Article & {
  seo: ArticleSeo | null;
  author: Author | null;
};

export const HugoTransformer = {
  toFrontmatter(article: ArticleWithRelations) {
    return {
      title: article.title || article.topic,
      date: article.publishedAt || article.createdAt,
      author: article.author?.name || "Admin",
      image: article.featuredImage,
      description: article.excerpt || article.seo?.metaDescription,
      slug: article.slug,
      categories: [article.category],
      tags: article.keywords,
      meta_title: article.seo?.metaTitle,
      robots: article.seo?.robots,
      canonical: article.seo?.canonicalUrl,
    };
  },

  formatMarkdown(frontmatter: object, content: string | null) {
    return `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n\n${content || ""}`;
  },
};