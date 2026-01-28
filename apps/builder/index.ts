import express from 'express';
import { env } from './src/config/env';
import { startBuildWorker } from './src/workers/build';
import { startDeleteWorker } from './src/workers/delete-website';

const app = express();

app.listen(env.PORT, () => {
  console.log(`Builder status server on port ${env.PORT}`);
  console.log(`Mode: ${env.NODE_ENV}`);
  
  startBuildWorker().catch(err => {
    console.error("Failed to start worker:", err);
    process.exit(1);
  });
  startDeleteWorker().catch(err => {
    console.error("Failed to start delete worker:", err);
    process.exit(1);
  });
});