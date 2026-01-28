import { BuildTypeWebsitePayload } from '@repo/database';
import { env } from '../config/env';
import { getRabbitMQ } from '../lib/rabbitmq';
import { BuilderService } from '../services/builder';

export interface BuildPayload {
  websiteId: string;
  mode: BuildTypeWebsitePayload;
}

export async function startBuildWorker() {
  const { channel } = await getRabbitMQ();
  
  await channel.assertQueue(env.QUEUE_NAME, { durable: true });
  channel.prefetch(1);

  console.log(`[*] Worker listening: ${env.QUEUE_NAME}`);

  channel.consume(env.QUEUE_NAME, async (msg) => {
    if (!msg) return;

    try {
      const payload: BuildPayload = JSON.parse(msg.content.toString());
      const { websiteId, mode } = payload;

      const validMode = mode === BuildTypeWebsitePayload.INIT_WEBSITE ? BuildTypeWebsitePayload.INIT_WEBSITE : BuildTypeWebsitePayload.BUILD_WEBSITE;

      console.log(`[!] Processing ${validMode.toUpperCase()}: ${websiteId}`);
      
      await BuilderService.build(websiteId, validMode);
      
      channel.ack(msg);
      console.log(`[v] Successfully ${validMode}ed: ${websiteId}`);
    } catch (err) {
      console.error("[x] Worker Error:", err);
      
      channel.nack(msg, false, false); 
    }
  });
}