import { defineConfig } from '@hey-api/openapi-ts';
import "dotenv/config";

export default defineConfig({
  input: `${process.env.SCRAPER_URL}/api/docs.json`,
  output: 'lib/types/api',
  client: 'fetch',
});