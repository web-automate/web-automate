import express from 'express';
import { startBuildWebsiteWorker } from 'src/workers/build-website';
import { startDeleteWebsiteWorker } from 'src/workers/delete-website';
import { startInitWebsiteWorker } from 'src/workers/init-website';
import { env } from './src/config/env';

const app = express();

app.listen(env.PORT, () => {
  console.log(`Builder status server on port ${env.PORT}`);
  console.log(`Mode: ${env.NODE_ENV}`);
  
  startInitWebsiteWorker().catch(err => {
    console.error("Failed to start init worker:", err);
    process.exit(1);
  });
  startBuildWebsiteWorker().catch(err => {
    console.error("Failed to start build worker:", err);
    process.exit(1);
  });
  startDeleteWebsiteWorker().catch(err => {
    console.error("Failed to start delete worker:", err);
    process.exit(1);
  });
});