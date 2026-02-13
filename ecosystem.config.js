export const apps = [
    {
        name: "scraper",
        script: "pnpm",
        args: "start",
        cwd: "./apps/scraper",
        // Mengarah ke file .env milik scraper
        env_file: "./apps/scraper/.env", 
        env: {
            // Variable di sini akan menimpa (overwrite) yang ada di file .env
            // atau bisa digunakan untuk variable global yang pasti
            NODE_ENV: "production",
            PORT: 3001
        }
    },
    {
        name: "cms-worker",
        script: "pnpm", 
        args: "start",
        cwd: "./apps/builder",
        // Mengarah ke file .env milik builder
        env_file: "./apps/builder/.env",
        env: {
            NODE_ENV: "production",
            PORT: 3002
        }
    },
    {
        name: "cms-client",
        script: "pnpm",
        args: "start",
        cwd: "./apps/client",
        // Mengarah ke file .env milik client
        env_file: "./apps/client/.env",
        env: {
            NODE_ENV: "production",
            PORT: 3000
        }
    }
];