import amqp, { Channel, Connection } from 'amqplib';

let connection: Connection | null = null;
let channel: Channel | null = null;

export async function connectRabbitMQ() {
  if (connection && channel) {
    return { connection, channel };
  }

  try {
    const user = process.env.RABBITMQ_USER || 'guest';
    const pass = process.env.RABBITMQ_PASS || 'guest';
    const host = process.env.RABBITMQ_HOST || 'localhost';
    const port = process.env.RABBITMQ_PORT || '5672';
    
    const RABBITMQ_URL = `amqp://${user}:${pass}@${host}:${port}`;
    connection = await amqp.connect(RABBITMQ_URL) as unknown as amqp.Connection;
    channel = await (connection as any).createChannel() as amqp.ConfirmChannel;
    
    return { connection, channel };
  } catch (error) {
    console.error("RabbitMQ connection error:", error);
    throw error;
  }
}