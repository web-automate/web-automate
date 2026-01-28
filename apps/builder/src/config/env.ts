import 'dotenv/config';

export const env = {
  PORT: process.env.PORT || 3002,
  DATABASE_URL: process.env.DATABASE_URL,
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  NODE_ENV: process.env.NODE_ENV || 'development',
  ROOT_BUILD_PATH: process.env.ROOT_BUILD_PATH || '/root/hazart/web-automate',
  QUEUE_NAME: 'build_website',
  DELETE_QUEUE_NAME: 'delete_website',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  API_KEY: process.env.API_KEY,
};