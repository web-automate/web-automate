import { prisma } from '@repo/database';
import amqp from 'amqplib';
import 'dotenv/config';
import express from 'express';
import fs from 'fs-extra';
import path from 'path';

const app = express();

const PORT = process.env.PORT || 3002;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const ROOT_BUILD_PATH = process.env.ROOT_BUILD_PATH || '/root/hazart/web-builder';
const QUEUE_NAME = 'build_website';

async function buildWebsiteData(websiteId: string) {
  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    include: {
      seo: true,
      template: true,
      articles: {
        include: {
          seo: true,
          author: true
        }
      }
    }
  });

  if (!website) throw new Error(`Website with ID ${websiteId} not found`);

  const dataDir = path.join(ROOT_BUILD_PATH, 'data');
  const contentDir = path.join(ROOT_BUILD_PATH, 'content');
  
  await fs.ensureDir(dataDir);
  await fs.ensureDir(contentDir);

  await fs.writeJson(path.join(dataDir, 'website.json'), website, { spaces: 2 });

  for (const article of website.articles) {
    const fileName = `${article.slug || article.id}.md`;
    
    const frontmatter = {
      title: article.title,
      date: article.publishedAt,
      author: article.author?.name,
      image: article.featuredImage,
      description: article.seo?.metaDescription,
    };

    const content = `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n\n${article.content || ''}`;
    await fs.writeFile(path.join(contentDir, fileName), content);
  }
}

async function initRabbitMQ() {
  try {
    console.log(`[?] Connecting to RabbitMQ at ${RABBITMQ_URL}...`);
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    channel.prefetch(1);
    
    console.log(`[*] Builder listening to queue: ${QUEUE_NAME}`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;
      
      try {
        const { websiteId } = JSON.parse(msg.content.toString());
        console.log(`[!] Received build task for Website: ${websiteId}`);
        
        await buildWebsiteData(websiteId);
        
        console.log(`[v] Build success for: ${websiteId}`);
        channel.ack(msg);
      } catch (err) {
        console.error("[x] Build failed:", err);
        channel.nack(msg, false, false); 
      }
    });

    connection.on("error", (err) => console.error("[!] RabbitMQ Connection Error", err));
    connection.on("close", () => console.log("[!] RabbitMQ Connection Closed. Reconnecting..."));

  } catch (error) {
    console.error("[x] Failed to connect to RabbitMQ:", error);
    setTimeout(initRabbitMQ, 5000);
  }
}

app.listen(PORT, () => {
  console.log(`Builder status server on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  initRabbitMQ();
});