export const apps = [
    {
        name: "cms-client",
        script: "npm",
        args: "start",
        cwd: "./apps/client",
        env: {
            NODE_ENV: "production",
            PORT: 3000
        }
    },
    {
        name: "cms-worker",
        script: "dist/index.js", 
        cwd: "./apps/builder",
        env: {
            NODE_ENV: "production"
        }
    }
];