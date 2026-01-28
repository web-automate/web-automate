const nginxConfig = (domain: string, publicDir: string) => `
server {
    listen 80;
    server_name ${domain};
    root ${publicDir};
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}`;

export default nginxConfig;