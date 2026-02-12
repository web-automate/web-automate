import fs from 'fs';
import os from 'os';
import path from 'path';
import { env } from '../config/env';
import { SCRAPER_CONFIG } from '../lib/scraper.const';
import { browserService } from '../service/browser.service';

function getChromePath() {
  const platform = os.platform();
  
  if (platform === 'win32') {
    const paths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe')
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  } else if (platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  } else if (platform === 'linux') {
    const paths = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  }
  
  throw new Error('Chrome executable not found');
}

async function prepareSession() {
  console.log('--- MEMULAI SESI PERSIAPAN ---');
  console.log(`Mode: ${env.AI_PROVIDER.toUpperCase()}`);
  console.log(`Target URL: ${SCRAPER_CONFIG.WEB_URL}`);
  
  let browser;
  
  try {
    const executablePath = getChromePath();
    console.log(`Menggunakan Chrome: ${executablePath}`);

    await browserService.launch();

    const page = await browserService.getMainPage();

    console.log('Membuka halaman login...');
    await page.goto(SCRAPER_CONFIG.WEB_URL, { waitUntil: 'networkidle2' });

    console.log('Silakan login manual di browser yang terbuka...');
    console.log('Script akan mendeteksi otomatis jika kotak input chat sudah muncul.');

    try {
      await page.waitForSelector(SCRAPER_CONFIG.PROMPT_INPUT_SELECTOR, { 
        timeout: 0, 
        visible: true 
      });
      
      console.log('✅ Login terdeteksi! (Input box ditemukan)');
    } catch (e) {
      console.error('Gagal mendeteksi login:', e);
      process.exit(1);
    }

    console.log('Menunggu sinkronisasi cookie ...');
    await page.waitForSelector(SCRAPER_CONFIG.NEW_CHAT_BTN_SELECTOR, {
       visible: true,
       timeout: 60000 
    });
    
    console.log('✅ UI Sinkron (New Chat Button Ready). Mengambil sesi...');

    await new Promise(r => setTimeout(r, 2000));

    const sessionName = `session-${env.AI_PROVIDER}`;
    await browserService.sessionManager.exportSession(page, sessionName);
    
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  } finally {
    if (browser) {
      await browserService.kill();
    }
    process.exit(0);
  }
}

prepareSession();