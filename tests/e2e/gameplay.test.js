import { exec } from 'child_process';
import puppeteer from 'puppeteer';

const APP_URL =
  'http://127.0.0.1:4173/cse110-group22-final-project/src/final/html/index.html';

describe('Gameplay E2E Test', () => {
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

  // Reload to a fresh main menu before each test so they stay independent.
  beforeEach(async () => {
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  });

  /**
   * Clicks a language button and waits until a real question has loaded
   * (the prompt is no longer the "Loading question..." placeholder).
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

  it(
    'loads a question after selecting a language',
    async () => {
      await startGame('python');

      const prompt = await page.$eval('.prompt-display-text', (el) => el.textContent.trim());
      const answer = await page.$eval('.ghost-text-visible', (el) => el.textContent);

      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).not.toBe('Loading question...');
      expect(answer.length).toBeGreaterThan(0);
    },
    30000
  );

  it(
    'advances the game when the player types a correct answer',
    async () => {
      await startGame('python');

      const before = await page.evaluate(() => ({
        score: document.querySelector('.stats-display-score')?.textContent ?? '',
        prompt: document.querySelector('.prompt-display-text')?.textContent ?? '',
      }));
      const answer = await page.$eval('.ghost-text-visible', (el) => el.textContent);

      await page.focus('.code-input');
      await page.type('.code-input', answer);

      // A completed correct answer should update the score or load the next question.
      await page.waitForFunction(
        (b) => {
          const score = document.querySelector('.stats-display-score')?.textContent ?? '';
          const prompt = document.querySelector('.prompt-display-text')?.textContent ?? '';
          return score !== b.score || prompt !== b.prompt;
        },
        { timeout: 10000 },
        before
      );

      const after = await page.evaluate(() => ({
        score: document.querySelector('.stats-display-score')?.textContent ?? '',
        prompt: document.querySelector('.prompt-display-text')?.textContent ?? '',
      }));

      expect(after.score !== before.score || after.prompt !== before.prompt).toBe(true);
    },
    30000
  );
});