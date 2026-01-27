import { env } from '../config/env';
import { getRabbitMQ } from '../lib/rabbitmq';
import { BuilderService } from '../services/builder';

export async function startBuildWorker() {
  const { channel } = await getRabbitMQ();
  
  await channel.assertQueue(env.QUEUE_NAME, { durable: true });
  channel.prefetch(1);

  console.log(`[*] Worker listening: ${env.QUEUE_NAME}`);

  channel.consume(env.QUEUE_NAME, async (msg) => {
    if (!msg) return;

    try {
      const { websiteId } = JSON.parse(msg.content.toString());
      console.log(`[!] Processing build: ${websiteId}`);
      
      await BuilderService.build(websiteId);
      
      channel.ack(msg);
      console.log(`[v] Done: ${websiteId}`);
    } catch (err) {
      console.error("[x] Worker Error:", err);
      channel.nack(msg, false, false);
    }
  });
}