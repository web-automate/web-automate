import express from 'express';
import { env } from './src/config/env';
import { startBuildWorker } from './src/workers/build';

const app = express();

app.listen(env.PORT, () => {
  console.log(`Builder status server on port ${env.PORT}`);
  console.log(`Mode: ${env.NODE_ENV}`);
  
  startBuildWorker().catch(err => {
    console.error("Failed to start worker:", err);
    process.exit(1);
  });
});