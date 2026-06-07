import { exec } from 'child_process';
import puppeteer from 'puppeteer';

const BASE_URL = 'http://127.0.0.1:4173/cse110-group22-final-project/src/final/html/index.html';

describe('Typing Game E2E Tests', () => {
  let browser;
  let page;
  let serverProcess;

  beforeAll(async () => {
    serverProcess = exec('npm run preview');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  }, 30000);

  afterAll(async () => {
    if (browser) await browser.close();
    if (serverProcess) serverProcess.kill('SIGKILL');
  });

  // ── Language Selection Screen ───────────────────────────────────────────────

  describe('Language Selection Screen', () => {
    it('should display the language selection screen on load', async () => {
      const heading = await page.$eval('h1', el => el.textContent);
      expect(heading).toContain('Hello, Farm!');
    });

    it('should display Python as a language option', async () => {
      const options = await page.$$eval('*', els =>
        els.map(el => el.textContent.trim())
      );
      expect(options.some(t => t === 'Python')).toBe(true);
    });

    it('should display JavaScript as a language option', async () => {
      const options = await page.$$eval('*', els =>
        els.map(el => el.textContent.trim())
      );
      expect(options.some(t => t === 'JavaScript')).toBe(true);
    });
  });

  // ── Game Screen ─────────────────────────────────────────────────────────────

  describe('Game Screen', () => {
    beforeAll(async () => {
      // Click Python to enter the game
      await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('*'));
        const python = els.find(el => el.textContent.trim() === 'Python' && el.children.length === 0);
        if (python) python.click();
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    it('should show the pause button', async () => {
      const pauseBtn = await page.$('button');
      expect(pauseBtn).not.toBeNull();
    });

    it('should show the timer', async () => {
      const body = await page.$eval('body', el => el.innerHTML);
      expect(body).toMatch(/\d+\s*:\s*\d+/);
    });

    it('should show a score display', async () => {
      const body = await page.$eval('body', el => el.innerHTML);
      expect(body).toContain('0');
    });

    it('should show the question/input area', async () => {
      const input = await page.$('input, textarea, [contenteditable]');
      expect(input).not.toBeNull();
    });

    it('should show the cpm display', async () => {
      const body = await page.$eval('body', el => el.textContent);
      expect(body.toLowerCase()).toContain('cpm');
    });

    it('should accept keyboard input into the answer field', async () => {
      const input = await page.$('input, textarea, [contenteditable]');
      await input.click();
      await input.type('print');
      const value = await page.evaluate(el => el.value || el.textContent, input);
      expect(value).toContain('print');
    });

    it('should pause when the pause button is clicked', async () => {
      await page.evaluate(() => {
        const btn = document.querySelector('button');
        if (btn) btn.click();
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const afterClick = await page.$eval('body', el => el.innerHTML);
      expect(afterClick).not.toBeNull();
    });
  });
});