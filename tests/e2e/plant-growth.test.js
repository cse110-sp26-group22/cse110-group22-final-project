import { exec } from 'child_process';
import puppeteer from 'puppeteer';

const APP_URL =
  'http://127.0.0.1:4173/cse110-group22-final-project/src/final/html/index.html';

describe('Plant Growth E2E Test', () => {
  let browser;
  let page;
  let serverProcess;

  beforeAll(async () => {
    serverProcess = exec('npm run preview');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  }, 30000);

  afterAll(async () => {
    if (browser) await browser.close();
    if (serverProcess) serverProcess.kill('SIGKILL');
  });

  beforeEach(async () => {
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  });

  /**
   * Clicks a language button and waits until a real question has loaded.
   * @param {string} language - 'python' or 'javascript'
   */
  async function startGame(language) {
    const selector = `.main-menu-btn[data-language="${language}"]`;
    await page.waitForSelector(selector);
    await page.click(selector);
    await page.waitForFunction(
      () => {
        const el = document.querySelector('.prompt-display-text');
        const text = el ? el.textContent.trim() : '';
        return text.length > 0 && text !== 'Loading question...';
      },
      { timeout: 15000 }
    );
  }

  /**
   * Reads the current answer (ghost text), types it, and waits for the game
   * to advance to the next question.
   */
  async function answerCurrentQuestion() {
    const prevPrompt = await page.$eval('.prompt-display-text', (el) => el.textContent);
    const answer = await page.$eval('.ghost-text-visible', (el) => el.textContent);

    await page.focus('.code-input');
    await page.type('.code-input', answer);

    await page.waitForFunction(
      (prev) => {
        const el = document.querySelector('.prompt-display-text');
        return el && el.textContent !== prev;
      },
      { timeout: 10000 },
      prevPrompt
    );
  }

  it(
    'grows the plant after three correct answers',
    async () => {
      await startGame('python');

      const plantBefore = await page.$eval('.plant-display-group', (el) => el.outerHTML);

      // The engine grows the plant on every 3rd question answered in time.
      for (let i = 0; i < 3; i++) {
        await answerCurrentQuestion();
      }

      await page.waitForFunction(
        (before) => {
          const el = document.querySelector('.plant-display-group');
          return el && el.outerHTML !== before;
        },
        { timeout: 10000 },
        plantBefore
      );

      const plantAfter = await page.$eval('.plant-display-group', (el) => el.outerHTML);
      expect(plantAfter).not.toBe(plantBefore);
    },
    30000
  );
});