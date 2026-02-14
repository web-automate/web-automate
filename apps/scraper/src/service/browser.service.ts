import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { env } from 'process';
import puppeteer, { Page, Permission } from 'puppeteer-core';
import { SessionManager } from '../config/session/manager';
import { SCRAPER_CONFIG } from '../lib/scraper.const';

const CHROME_PATH = process.platform === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : '/usr/bin/google-chrome';

const USER_DATA_DIR = path.join(process.cwd(), 'chrome_data_prod');
export const TEMP_DOWNLOAD_DIR = path.join(process.cwd(), 'temp_downloads');
export const DEBUG_PORT = Number(env.DEBUG_PORT) || 9222;

export class BrowserService {
  private browserProcess: ChildProcess | null = null;
  public sessionManager: SessionManager = new SessionManager();

  private fixPreferences() {
    const preferencesPath = path.join(USER_DATA_DIR, 'Default', 'Preferences');
    if (fs.existsSync(preferencesPath)) {
      try {
        const content = fs.readFileSync(preferencesPath, 'utf-8');
        const json = JSON.parse(content);
        if (json.profile && json.profile.exit_type !== 'Normal') {
          json.profile.exit_type = 'Normal';
          if (json.profile.exited_cleanly !== undefined) {
            json.profile.exited_cleanly = true;
          }
          fs.writeFileSync(preferencesPath, JSON.stringify(json, null, 2));
        }
      } catch (error) {
        console.error('Failed to fix Chrome preferences:', error);
      }
    }
  }

  private ensureDownloadDir() {
    if (!fs.existsSync(TEMP_DOWNLOAD_DIR)) {
      fs.mkdirSync(TEMP_DOWNLOAD_DIR, { recursive: true });
    }
  }

  public async getMainPage(): Promise<Page> {
    const browser = await puppeteer.connect({
      browserURL: `http://127.0.0.1:${DEBUG_PORT}`,
      defaultViewport: null,
    });

    const pages = await browser.pages();
    const mainPage = pages.length > 0 ? pages[0] : await browser.newPage();

    await mainPage.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      (window as any).chrome = { runtime: {} };
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
          : originalQuery(parameters);
    });

    const client = await mainPage.createCDPSession();
    this.ensureDownloadDir();

    if (SCRAPER_CONFIG.WEB_URL) {
      try {
        const context = browser.defaultBrowserContext();
        const origin = new URL(SCRAPER_CONFIG.WEB_URL).origin;
        const permissions: Permission[] = ['clipboard-read', 'clipboard-write'];
        await context.overridePermissions(origin, permissions);
      } catch (e) {
        console.warn('Failed to set permissions:', e);
      }
    }

    try {
      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: TEMP_DOWNLOAD_DIR,
      });
      console.log(`✅ Download path ready: ${TEMP_DOWNLOAD_DIR}`);
    } catch (error) {
      console.error('❌ Failed to set download behavior:', error);
    }

    return mainPage;
  }

  public async launch() {
    if (this.browserProcess) return;

    this.fixPreferences();
    this.ensureDownloadDir();

    const args = [
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--no-first-run',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--no-default-browser-check',
      `--user-data-dir=${USER_DATA_DIR}`,
      '--window-size=1280,1024',
      '--disable-session-crashed-bubble',
      '--disable-infobars',
      '--disable-notifications',
      '--disable-blink-features=AutomationControlled',
      '--ignore-certificate-errors',
      '--use-gl=swiftshader', 
      '--disable-dev-shm-usage',
      '--disable-gpu', 
      '--lang=en-US,en;q=0.9',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    ];

    console.log('[BrowserService] Spawning Chrome process...');

    if (process.platform === 'win32') {
      this.browserProcess = spawn(CHROME_PATH, args, { detached: true });
    } else {
      this.browserProcess = spawn('nohup', [
        'xvfb-run',
        '-a',
        '--server-args=-screen 0 1280x1024x24',
        CHROME_PATH,
        ...args
      ], {
        detached: true,
        stdio: 'ignore' 
      });
      this.browserProcess.unref();
    }

    let connected = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
        if (response.ok) {
          console.log("✅ Chrome is ready and listening!");
          connected = true;
          break;
        }
      } catch (e) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (!connected) {
      throw new Error(`Chrome failed to start on port ${DEBUG_PORT}`);
    }
  }

  public async initSession(sessionName: string) {
    console.log(`[BrowserService] Initializing session: ${sessionName}`);
    const page = await this.getMainPage();

    try {
      if (SCRAPER_CONFIG.WEB_URL) {
        const targetUrl = new URL(SCRAPER_CONFIG.WEB_URL);
        const domainOrigin = targetUrl.origin;
        
        console.log(`[BrowserService] Setting domain context at ${domainOrigin}...`);
        try {
            await page.goto(domainOrigin, { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (e) {
            console.log("Context navigation timeout (ignoring)...");
        }

        console.log('[BrowserService] Injecting storage & cookies...');
        await this.sessionManager.importSession(page, sessionName);
        
        await new Promise(r => setTimeout(r, 3000)); 
        
        console.log(`[BrowserService] Navigating to target: ${SCRAPER_CONFIG.WEB_URL}`);
        await page.goto(SCRAPER_CONFIG.WEB_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        
        const debugPath = path.join(process.cwd(), 'debug_login_status.png');
        await page.screenshot({ path: debugPath });
        console.log(`✅ Session injected. Screenshot saved to: ${debugPath}`);
      }
    } catch (error) {
      console.error('❌ Failed to init session:', error);
      await page.screenshot({ path: path.join(process.cwd(), `session_error.png`) });
    }
  }

  public kill() {
    if (this.browserProcess && this.browserProcess.pid) {
      console.log('Stopping browser process group...');
      try {
        process.kill(-this.browserProcess.pid); 
        this.browserProcess = null;
      } catch (e) {
          console.error("Error killing process", e);
      }
    }
  }
}

export const browserService = new BrowserService();