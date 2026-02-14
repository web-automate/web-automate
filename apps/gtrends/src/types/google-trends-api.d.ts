import { HttpsProxyAgent } from "https-proxy-agent";

declare module 'google-trends-api' {
    export interface TrendsOptions {
        keyword?: string | string[];
        startTime?: Date;
        endTime?: Date;
        geo?: string | string[];
        hl?: string;
        timezone?: number;
        category?: string;
        property?: string;
        agent?: HttpsProxyAgent<string>;
    }

    export function interestOverTime(options: TrendsOptions): Promise<string>;
    export function interestByRegion(options: TrendsOptions): Promise<string>;
    export function relatedQueries(options: TrendsOptions): Promise<string>;
    export function relatedTopics(options: TrendsOptions): Promise<string>;
    export function dailyTrends(options: TrendsOptions): Promise<string>;
    export function realTimeTrends(options: TrendsOptions): Promise<string>;
}