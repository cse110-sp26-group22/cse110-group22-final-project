import { exec } from 'child_process';
import puppeteer from 'puppeteer';

describe('Main Menu E2E Test', () => {
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

    await page.goto(
      'http://127.0.0.1:4173/cse110-group22-final-project/src/final/html/index.html',
      { waitUntil: 'networkidle0' }
    );
  }, 30000);

  afterAll(async () => {
    if (browser) await browser.close();
    if (serverProcess) serverProcess.kill('SIGKILL');
  });

  it('shows the main menu heading', async () => {
    const heading = await page.$eval('#main-menu h1', (el) => el.textContent.trim());
    expect(heading).toBe('Hello, Farm!');
  });

  it('shows both language buttons', async () => {
    const languages = await page.$$eval('#main-menu .main-menu-btn', (btns) =>
      btns.map((b) => b.dataset.language)
    );
    expect(languages).toEqual(expect.arrayContaining(['python', 'javascript']));
    expect(languages).toHaveLength(2);
  });
});