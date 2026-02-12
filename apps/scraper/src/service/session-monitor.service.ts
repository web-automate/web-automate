import cron from 'node-cron';
import { browserService } from './browser.service';
import { SCRAPER_CONFIG } from '../lib/scraper.const';
import { Page } from 'puppeteer-core';

export class SessionMonitorService {
  private isChecking = false;

  public start() {
    console.log('🕒 Session Monitor Scheduler started (Check every 1 hour)');
    
    cron.schedule('0 * * * *', async () => {
      await this.checkSessionValidity();
    });
  }

  private async checkSessionValidity() {
    if (this.isChecking) return; 
    this.isChecking = true;
    console.log('[SessionMonitor] 🔍 Checking session health...');

    try {
      const page = await browserService.getMainPage();
      
      const EXPIRED_MODAL_SELECTOR = SCRAPER_CONFIG.EXPIRED_MODAL_SELECTOR;

      const isExpired = await page.$(EXPIRED_MODAL_SELECTOR) !== null;

      if (isExpired) {
        console.warn('[SessionMonitor] 🚨 SESSION EXPIRED DETECTED!');
        await this.handleExpiredSession(page);
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
        const expiredModal = await page.$(SCRAPER_CONFIG.EXPIRED_MODAL_SELECTOR);
        if (expiredModal) {
            console.error('[SessionMonitor] ❌ User is logged out! Manual login required.');
        }
      }
      
    } catch (error) {
      console.error('[SessionMonitor] Failed to handle expired session:', error);
    }
  }
}

export const sessionMonitor = new SessionMonitorService();