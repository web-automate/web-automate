import { Article, ArticleSeo, Author } from "@repo/database";

type ArticleWithRelations = Article & {
  seo: ArticleSeo | null;
  author: Author | null;
};

export const HugoTransformer = {
  toFrontmatter(article: ArticleWithRelations) {
    return {
      id: article.id,
      title: article.title || article.topic,
      date: article.publishedAt || article.createdAt,
      authorId: article.author?.id || "123",
      featuredImage: article.featuredImage,
      description: article.excerpt,
      slug: article.slug,
      categories: [article.category],
      subcategories: article.subCategory,
      tags: article.keywords,
      seo: {
        keywords: article.keywords,
        metaTitle: article.seo?.metaTitle,
        metaDescription: article.seo?.metaDescription,
        author: article.seo?.author,
        language: article.seo?.language,
        robots: article.seo?.robots,
        canonicalUrl: article.seo?.canonicalUrl,
        ogTitle: article.seo?.ogTitle,
        ogDescription: article.seo?.ogDescription,
        ogImage: article.seo?.ogImage,
        ogUrl: article.seo?.ogUrl,
        ogSiteName: article.seo?.ogSiteName,
        ogType: article.seo?.ogType,
        ogPublishedTime: article.seo?.ogPublishedTime,
        ogAuthor: article.seo?.ogAuthor,
        twitterCard: article.seo?.twitterCard,
        twitterTitle: article.seo?.twitterTitle,
        twitterDescription: article.seo?.twitterDescription,
        twitterImage: article.seo?.twitterImage,
        twitterCreator: article.seo?.twitterCreator,
        twitterUrl: article.seo?.twitterUrl,
        structuredData: article.seo?.structuredData,
      }
    }
  },

  formatMarkdown(frontmatter: object, content: string | null) {
    return `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n\n${content || ""}`;
  },
};