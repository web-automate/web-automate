const nginxConfig = (domain: string, publicDir: string) => `
server {
    listen 80;
    server_name ${domain};
    root ${publicDir};
    index index.html;

    if (-f $document_root/.maintenance) {
        return 503;
    }

    error_page 503 @maintenance;

    location @maintenance {
        default_type text/html;
        rewrite ^(.*)$ /maintenance.html break;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}`;

export default nginxConfig;