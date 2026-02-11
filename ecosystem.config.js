export const apps = [
    {
        name: "cms-client",
        script: "pnpm",
        args: "start",
        cwd: "./apps/client",
        env: {
            NODE_ENV: "production",
            PORT: 3000
        }
    },
    {
        name: "scraper",
        script: "pnpm",
        args: "start",
        cwd: "./apps/scraper",
        env: {
            NODE_ENV: "production",
            PORT: 3002
        }
    },
    {
        name: "cms-worker",
        script: "pnpm", 
        args: "start",
        cwd: "./apps/builder",
        env: {
            NODE_ENV: "production",
            PORT: 3001
        }
    }
];