import amqp, { Channel, Connection } from 'amqplib';
import { env } from '../config/env';

let connection: Connection | null = null;
let channel: Channel | null = null;

export async function getRabbitMQ() {
  if (connection && channel) return { connection, channel };

  try {
    connection = await amqp.connect(env.RABBITMQ_URL) as unknown as amqp.Connection;
    channel = await (connection as any).createChannel() as amqp.ConfirmChannel;
    return { connection, channel };
  } catch (error) {
    console.error("RabbitMQ Connection Error:", error);
    throw error;
  }
}