import express, { Request, Response } from 'express';
import Redis from 'ioredis';
import cron from 'node-cron';
import Parser from 'rss-parser';

import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3003;

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6377', 10);
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '604800', 10);
const ACTIVE_GEOS_KEY = 'gtrends:registered_geos';

const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});

const parser = new Parser({
    customFields: {
        item: [
            ['ht:approx_traffic', 'traffic'],
            ['ht:picture', 'picture'],
            ['ht:news_item', 'newsItem']
        ]
    }
});

const getCacheKey = (geo: string) => `gtrends:daily:${geo.toLowerCase()}`;

async function fetchAndCacheTrends(geo: string) {
    const upperGeo = geo.toUpperCase();
    console.log(`[${new Date().toISOString()}] Fetching data for GEO: ${upperGeo}...`);

    try {
        const feedUrl = `https://trends.google.com/trending/rss?geo=${upperGeo}`;
        
        const feed = await parser.parseURL(feedUrl);

        const formattedData = feed.items.map(item => {
            const newsItem = item['newsItem'];
            return {
                title: item.title,
                traffic: item.traffic,
                pubDate: item.pubDate,
                link: item.link,
                picture: item.picture,
                news_source: newsItem ? newsItem['ht:news_item_title'] : null,
                news_url: newsItem ? newsItem['ht:news_item_url'] : null
            };
        });

        const cacheKey = getCacheKey(geo);

        const pipeline = redis.pipeline();
        
        pipeline.set(cacheKey, JSON.stringify(formattedData), 'EX', CACHE_TTL);
        
        pipeline.sadd(ACTIVE_GEOS_KEY, upperGeo);

        await pipeline.exec();
        
        console.log(`[${new Date().toISOString()}] Sukses update cache ${upperGeo} (${formattedData.length} items)`);
        return formattedData;

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Gagal fetch data ${upperGeo}:`, error instanceof Error ? error.message : error);
        throw error;
    }
}

cron.schedule('0 3 * * *', async () => {
    console.log('--- Running Scheduled Job: Updating ALL Active Geos ---');
    
    try {
        let activeGeos = await redis.smembers(ACTIVE_GEOS_KEY);

        if (activeGeos.length === 0) {
            console.log('No active geos found. Defaulting to ID.');
            activeGeos = ['ID'];
        }

        console.log(`Active Geos to update: ${activeGeos.join(', ')}`);

        for (const geo of activeGeos) {
            try {
                await fetchAndCacheTrends(geo);
                await new Promise(r => setTimeout(r, 2000)); 
            } catch (err) {
                console.error(`Skipping update for ${geo} due to error.`);
            }
        }

        console.log('--- Scheduled Job Finished ---');

    } catch (error) {
        console.error('Critical Cron Error:', error);
    }

}, {
    timezone: "Asia/Jakarta"
});

app.get('/', async (req: Request, res: Response) => {
    const geoQuery = req.query.geo as string;
    const geo = (geoQuery || 'ID').toUpperCase(); 

    const cacheKey = getCacheKey(geo);

    try {
        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            console.log(`Serving ${geo} from Redis Cache`);
            const data = JSON.parse(cachedData);
            
            return res.json({
                success: true,
                geo: geo,
                source: 'redis',
                updated_at: new Date().toISOString(), 
                count: data.length,
                data: data
            });
        }

        console.log(`Cache Miss for ${geo}. Fetching fresh data...`);
        const freshData = await fetchAndCacheTrends(geo);

        res.json({
            success: true,
            geo: geo,
            source: 'live_fetch',
            count: freshData.length,
            data: freshData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            geo: geo,
            message: 'Failed to fetch data',
            error: error instanceof Error ? error.message : error
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    redis.sadd(ACTIVE_GEOS_KEY, 'ID'); 
});