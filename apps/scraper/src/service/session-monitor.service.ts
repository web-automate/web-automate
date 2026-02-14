import cron from 'node-cron';
import path from 'path';
import { Page } from 'puppeteer-core';
import { SCRAPER_CONFIG } from '../lib/scraper.const';
import { browserService } from './browser.service';

export class SessionMonitorService {
  private isChecking = false;

  public start() {
    console.log('🕒 Session Monitor Scheduler started (Check every 1 hour)');
    cron.schedule('0 * * * *', async () => {
      await this.checkSessionValidity();
    });
  }

  public async validateNow() {
      console.log('[SessionMonitor] Performing manual validation...');
      await this.checkSessionValidity();
  }

  private async checkSessionValidity() {
    if (this.isChecking) return; 
    this.isChecking = true;
    console.log('[SessionMonitor] 🔍 Checking session health...');

    try {
      const page = await browserService.getMainPage();
      
      if (page.url() === 'about:blank') {
          console.warn('[SessionMonitor] Page is blank, skipping check.');
          return;
      }

      const EXPIRED_MODAL_SELECTOR = SCRAPER_CONFIG.EXPIRED_MODAL_SELECTOR;
      const NO_AUTH_LOGIN_MODAL_SELECTOR = SCRAPER_CONFIG.NO_AUTH_LOGIN_MODAL_SELECTOR;

      const isExpired = EXPIRED_MODAL_SELECTOR 
        ? await page.$(EXPIRED_MODAL_SELECTOR).then(res => !!res) 
        : false;
        
      const isNoAuthLogin = NO_AUTH_LOGIN_MODAL_SELECTOR 
        ? await page.$(NO_AUTH_LOGIN_MODAL_SELECTOR).then(res => !!res) 
        : false;

      if (isExpired) {
        console.warn('[SessionMonitor] 🚨 SESSION EXPIRED DETECTED!');
        await this.handleExpiredSession(page);
      } else if (isNoAuthLogin) {
        console.warn('[SessionMonitor] 🚨 NO AUTH LOGIN DETECTED!');
        await this.handleNoAuthLogin(page);
      } else {
        console.log('[SessionMonitor] ✅ Session looks healthy.');
      }

    } catch (error) {
      console.error('[SessionMonitor] Error during check:', error);
    } finally {
      this.isChecking = false;
    }
  }

  private async handleExpiredSession(page: Page) {
    try {
      console.log('[SessionMonitor] 🔄 Refreshing page to restore session...');
      await page.reload({ waitUntil: 'networkidle2' });

      if (SCRAPER_CONFIG.EXPIRED_MODAL_SELECTOR) {
        try {
            await page.waitForSelector(SCRAPER_CONFIG.EXPIRED_MODAL_SELECTOR, { timeout: 60000 });
            const debugPath = path.join(process.cwd(), 'data/error/expired-modal.png');
            await page.screenshot({ path: debugPath });
            console.error('[SessionMonitor] ❌ User is logged out! Manual login required.');
        } catch {
            console.log('[SessionMonitor] ✅ Session restored after refresh.');
        }
      }
    } catch (error) {
      console.error('[SessionMonitor] Failed to handle expired session:', error);
    }
  }

  private async handleNoAuthLogin(page: Page) {
    try {
      console.log('[SessionMonitor] 🔄 Refreshing page to restore session...');
      await page.reload({ waitUntil: 'networkidle2' });

      if (SCRAPER_CONFIG.NO_AUTH_LOGIN_MODAL_SELECTOR) {
        try {
            await page.waitForSelector(SCRAPER_CONFIG.NO_AUTH_LOGIN_MODAL_SELECTOR, { timeout: 60000 });
            const debugPath = path.join(process.cwd(), 'data/error/no-auth-login-modal.png');
            await page.screenshot({ path: debugPath });
            console.error('[SessionMonitor] ❌ Refresh failed. User is still not logged in!');
        } catch {
            console.log('[SessionMonitor] ✅ Session restored after refresh.');
        }
      }
    } catch (error) {
      console.error('[SessionMonitor] Failed to handle no auth login session:', error);
    }
  }
}

export const sessionMonitor = new SessionMonitorService();