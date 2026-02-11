import fs from "fs-extra";
import path from "path";
import { env } from "../../config/env";
import nginxConfig from "../../lib/consts/nginx";
import { ShellService } from "./shell";

export class InfraService {
  static async setupNginx(domain: string, publicDir: string, configPath: string) {
    const config = nginxConfig(domain, publicDir);
    await fs.ensureDir(path.dirname(configPath));
    await fs.writeFile(configPath, config);

    if (process.platform === 'win32') return;

    const targetAvailable = `/etc/nginx/sites-available/${path.basename(configPath)}`;
    const systemEnabledPath = `/etc/nginx/sites-enabled/${path.basename(configPath)}`;

    await ShellService.runSudo(`cp ${configPath} ${targetAvailable}`);
    await ShellService.runSudo(`ln -sf ${targetAvailable} ${systemEnabledPath}`);
    
    await ShellService.runSudo(`nginx -t`);
    await ShellService.runSudo(`systemctl reload nginx`);
  }

  static async reloadNginx() {
    if (process.platform === 'win32') return;
    try {
      await ShellService.runSudo(`systemctl reload nginx`);
    } catch (error) {
      console.error('Error reloading nginx:', error);
    }
  }

  static async setupSSL(domain: string) {
    if (process.platform === 'win32') return;
    const email = env.ADMIN_EMAIL || `admin@${domain}`;
    await ShellService.runSudo(`certbot --nginx -d ${domain} --non-interactive --agree-tos -m ${email} --keep-until-expiring`);
    await ShellService.runSudo(`systemctl reload nginx`);
  }
}