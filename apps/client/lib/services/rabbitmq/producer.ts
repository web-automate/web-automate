import { connectRabbitMQ } from "@/lib/helpers/rabbitmq";

export const RabbitMQService = {
  async sendToQueue(queue: string = "build_website", message: any) {
    try {
      const { channel } = await connectRabbitMQ();

      await channel.assertQueue(queue, { durable: true });
      
      const status = channel.sendToQueue(
        queue, 
        Buffer.from(JSON.stringify(message)), 
        { persistent: true }
      );

      return status;
    } catch (error) {
      console.error("Error in RabbitMQ Service:", error);
      throw new Error("Could not send message to RabbitMQ");
    }
  }
};