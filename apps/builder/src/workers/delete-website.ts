import { queueName } from '@repo/types';
import { getRabbitMQ } from '../lib/rabbitmq';
import { DeleteWebsiteService } from '../services/delete-website';

export async function startDeleteWebsiteWorker() {
  const { channel } = await getRabbitMQ();
  const que = queueName.delete || 'delete_website';
  
  await channel.assertQueue(que, { durable: true });
  channel.prefetch(1);

  console.log(`[*] Delete Worker listening: ${que}`);

  channel.consume(que, async (msg) => {
    if (!msg) return;

    try {
      const { websiteId } = JSON.parse(msg.content.toString());

      console.log(`[!] Processing DELETE for Website ID: ${websiteId}`);
      
      await DeleteWebsiteService.delete(websiteId);
      
      channel.ack(msg);
      console.log(`[v] Successfully deleted website: ${websiteId}`);
    } catch (err) {
      console.error("[x] Delete Worker Error:", err);
      channel.nack(msg, false, false); 
    }
  });
}