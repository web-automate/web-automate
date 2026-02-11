import { BuildTypeWebsitePayload } from '@repo/database';
import { queueName } from '@repo/types';
import { BuildPayload } from 'src/lib/types/website';
import { BuilderService } from 'src/services/website/builder';
import { getRabbitMQ } from '../lib/rabbitmq';

export async function startInitWebsiteWorker() {
  const { channel } = await getRabbitMQ();
  
  await channel.assertQueue(queueName.init, { durable: true });
  channel.prefetch(1);

  console.log(`[*] Worker listening: ${queueName.init}`);

  channel.consume(queueName.init, async (msg) => {
    if (!msg) return;

    try {
      const payload: BuildPayload = JSON.parse(msg.content.toString());
      const { websiteId, mode } = payload;

      if (mode !== BuildTypeWebsitePayload.INIT_WEBSITE) {
        console.error(`[x] Invalid mode: ${mode}`);
        channel.nack(msg, false, false);
        return;
      }

      console.log(`[!] Processing ${mode.toUpperCase()}: ${websiteId}`);
      
      await BuilderService.build(websiteId, mode);
      
      channel.ack(msg);
      console.log(`[v] Successfully ${mode}ed: ${websiteId}`);
    } catch (err) {
      console.error("[x] Worker Error:", err);
      
      channel.nack(msg, false, false); 
    }
  });
}