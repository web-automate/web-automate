import { env } from 'node:process';
import { getRabbitMQ } from '../lib/rabbitmq';
import { DeleteWebsiteService } from '../services/delete-website';

export async function startDeleteWorker() {
  const { channel } = await getRabbitMQ();
  const queueName = env.DELETE_QUEUE_NAME || 'delete_website';
  
  await channel.assertQueue(queueName, { durable: true });
  channel.prefetch(1);

  console.log(`[*] Delete Worker listening: ${queueName}`);

  channel.consume(queueName, async (msg) => {
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