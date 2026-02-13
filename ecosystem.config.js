export const apps = [
    {
        name: "scraper",
        script: "pnpm",
        args: "start",
        cwd: "./apps/scraper",
        env: {
            NODE_ENV: "production",
            HOST: "0.0.0.0",
            PORT: 3001,
            DEBUG_PORT: "9222",
            // Database
            DATABASE_URL: "postgresql://postgres:admin@localhost:5432/web_auto",
            // API & Auth
            API_KEY: "",
            JWT_SECRET: "",
            // Scraper Config
            PROD_HOST: "",
            CDN_BASE_URL: "",
            AI_PROVIDER: "chatgpt",
            CONTENT_DIR: "/var/www/scraper-v2/content/images",
            RATE_LIMIT_WHITELIST: "http://localhost:3000",
            // RabbitMQ
            RABBITMQ_HOST: "localhost",
            RABBITMQ_PORT: "5672",
            RABBITMQ_USER: "guest",
            RABBITMQ_PASSWORD: "guest",
            // Cloudflare R2
            R2_ACCOUNT_ID: "",
            R2_ACCESS_KEY_ID: "",
            R2_SECRET_ACCESS_KEY: "",
            R2_BUCKET_NAME: "",
            R2_REGION: "auto",
            R2_ENDPOINT: "",
            R2_PUBLIC_DOMAIN: ""
        }
    },
    {
        name: "cms-worker",
        script: "pnpm", 
        args: "start",
        cwd: "./apps/builder",
        env: {
            NODE_ENV: "production",
            PORT: 3002,
            // Database
            DATABASE_URL: "postgresql://postgres:admin@localhost:5432/web_auto",
            // RabbitMQ
            RABBITMQ_URL: "amqp://guest:guest@localhost:5672",
            // Builder Config
            ROOT_BUILD_PATH: "/root/hazart/web-automate",
            NEXT_PUBLIC_APP_URL: "http://localhost:3000",
            API_KEY: "",
            ADMIN_EMAIL: "",
            // Cloudflare R2
            R2_ACCOUNT_ID: "",
            R2_ACCESS_KEY_ID: "",
            R2_SECRET_ACCESS_KEY: "",
            R2_ENDPOINT: "",
            R2_BUCKET_NAME: "automate"
        }
    },
    {
        name: "cms-client",
        script: "pnpm",
        args: "start",
        cwd: "./apps/client",
        env: {
            NODE_ENV: "production",
            PORT: 3000,
            // Database
            DATABASE_URL: "postgresql://postgres:admin@localhost:5432/web_auto",
            // Next.js / Better Auth
            NEXT_PUBLIC_APP_URL: "http://localhost:3000",
            BETTER_AUTH_URL: "http://localhost:3000",
            BETTER_AUTH_SECRET: "",
            // Scraper API
            SCRAPER_URL: "http://localhost:3001",
            API_KEY: "",
            // Auth (OAuth)
            GITHUB_CLIENT_ID: "",
            GITHUB_CLIENT_SECRET: "",
            NEXT_PUBLIC_GOOGLE_CLIENT_ID: "",
            GOOGLE_CLIENT_ID: "",
            GOOGLE_CLIENT_SECRET: "",
            // AI
            AI_GATEWAY_API_KEY: "",
            GOOGLE_API_KEY: "",
            // RabbitMQ
            RABBITMQ_HOST: "localhost",
            RABBITMQ_PORT: "5672",
            RABBITMQ_USER: "guest",
            RABBITMQ_PASS: "guest",
            RABBITMQ_QUEUE_NAME: "build_website",
            // Cloudflare R2
            R2_ACCOUNT_ID: "",
            R2_ACCESS_KEY_ID: "",
            R2_SECRET_ACCESS_KEY: "",
            R2_BUCKET_NAME: "automate",
            R2_ENDPOINT: "",
            R2_PUBLIC_DOMAIN: "",
            // Optional
            IP_SERVER: ""
        }
    }
];