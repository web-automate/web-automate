import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { env } from 'process';
import puppeteer, { Browser, Page } from 'puppeteer-core';
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
  private browserInstance: Browser | null = null;
  private activePage: Page | null = null; // Menyimpan referensi page utama
  
  public sessionManager: SessionManager = new SessionManager();

  // --- HELPER FUNCTIONS ---

  private ensureUserDataDir() {
    if (!fs.existsSync(USER_DATA_DIR)) {
      console.log(`[BrowserService] Creating user data dir: ${USER_DATA_DIR}`);
      try {
        fs.mkdirSync(USER_DATA_DIR, { recursive: true });
      } catch (error) {
        console.error(`[BrowserService] ❌ Failed to create user data dir:`, error);
        throw error;
      }
    }
  }

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

  // --- CORE FUNCTIONS ---

  /**
   * Mendapatkan page yang sudah aktif. 
   * Tidak melakukan koneksi ulang jika tidak diperlukan.
   */
  public async getMainPage(): Promise<Page> {
    if (this.activePage && !this.activePage.isClosed()) {
      return this.activePage;
    }
    throw new Error("Browser belum di-launch atau Page tertutup. Panggil .launch() terlebih dahulu.");
  }

  /**
   * Full Setup: Spawn -> Connect -> Setup Page -> Permission -> Session -> Navigation
   */
  public async launch(sessionName: string) {
    if (this.browserProcess) {
      console.log('[BrowserService] Browser process already running.');
      return;
    }

    // 1. Preparation
    this.ensureUserDataDir();
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
      '--enable-features=Clipboard',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    ];

    // 2. Spawn Process
    console.log('[BrowserService] Spawning Chrome process...');
    if (process.platform === 'win32') {
      this.browserProcess = spawn(CHROME_PATH, args, { detached: true });
    } else {
      this.browserProcess = spawn('nohup', [
        'xvfb-run', '-a', '--server-args=-screen 0 1280x1024x24',
        CHROME_PATH, ...args
      ], { detached: true, stdio: 'ignore' });
      this.browserProcess.unref();
    }

    // 3. Wait for Port
    let connected = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
        if (response.ok) {
          console.log("✅ Chrome port is open!");
          connected = true;
          break;
        }
      } catch (e) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    if (!connected) throw new Error(`Chrome failed to start on port ${DEBUG_PORT}`);

    // 4. Connect Puppeteer
    console.log('[BrowserService] Connecting Puppeteer...');
    this.browserInstance = await puppeteer.connect({
      browserURL: `http://127.0.0.1:${DEBUG_PORT}`,
      defaultViewport: null,
    });

    // 5. Setup Single Tab Policy
    const pages = await this.browserInstance.pages();
    this.activePage = pages.length > 0 ? pages[0] : await this.browserInstance.newPage();
    
    // Tutup tab lain jika ada sisa dari sesi sebelumnya
    if (pages.length > 1) {
      console.log(`[BrowserService] Closing ${pages.length - 1} extra tabs...`);
      for (let i = 1; i < pages.length; i++) {
        await pages[i].close();
      }
    }

    // 6. Setup Page Environment (Permissions & Download)
    await this.setupPageEnvironment(this.activePage);

    // 7. Inject Session & Navigate
    await this.performLoginSequence(this.activePage, sessionName);
  }

  private async setupPageEnvironment(page: Page) {
    const client = await page.createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: TEMP_DOWNLOAD_DIR,
    });

    // Permissions
    if (SCRAPER_CONFIG.WEB_URL) {
      const origin = new URL(SCRAPER_CONFIG.WEB_URL).origin;
      const context = this.browserInstance!.defaultBrowserContext();
      console.log(`[BrowserService] Granting permissions to ${origin}...`);
      await context.setPermission(origin, {
        permission: {
          name: 'clipboard-read',
        },
        state: 'granted',
      });
      await context.setPermission(origin, {
        permission: {
          name: 'clipboard-write',
        },
        state: 'granted',
      });
    }

    // Stealth Tweaks
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      (window as any).chrome = { runtime: {} };
    });
  }

  private async performLoginSequence(page: Page, sessionName: string) {
    if (!SCRAPER_CONFIG.WEB_URL) return;

    const targetUrl = new URL(SCRAPER_CONFIG.WEB_URL);
    const domainOrigin = targetUrl.origin;

    try {
      // a. Dummy navigation for domain context
      console.log(`[BrowserService] Setting domain context at ${domainOrigin}...`);
      try {
        await page.goto(domainOrigin, { waitUntil: 'domcontentloaded', timeout: 15000 });
      } catch (e) { console.log("Context init timeout (ignoring)..."); }

      // b. Inject Cookies/Storage
      console.log('[BrowserService] Injecting storage & cookies...');
      await this.sessionManager.importSession(page, sessionName);
      await new Promise(r => setTimeout(r, 2000));

      // c. Real Navigation
      console.log(`[BrowserService] 🚀 Navigating to: ${SCRAPER_CONFIG.WEB_URL}`);
      await page.goto(SCRAPER_CONFIG.WEB_URL, { waitUntil: 'networkidle2', timeout: 60000 });

      // d. Screenshot Debug
      const debugPath = path.join(process.cwd(), 'debug_login_status.png');
      await page.screenshot({ path: debugPath });
      console.log(`✅ Session Ready. Screenshot: ${debugPath}`);

    } catch (error) {
      console.error('❌ Login Sequence Failed:', error);
      throw error;
    }
  }

  public kill() {
    if (this.browserProcess && this.browserProcess.pid) {
      console.log('Stopping browser process group...');
      try {
        process.kill(-this.browserProcess.pid);
        this.browserProcess = null;
        this.browserInstance = null;
        this.activePage = null;
      } catch (e) {
        console.error("Error killing process", e);
      }
    }
  }
}

export const browserService = new BrowserService();