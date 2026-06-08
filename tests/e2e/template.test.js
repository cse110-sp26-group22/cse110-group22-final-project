import { exec } from 'child_process';
import puppeteer from 'puppeteer'; // Clean, standard, out-of-the-box import!

describe('Replace With Your Feature Name E2E Test', () => {
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
    
    await page.goto('http://127.0.0.1:4173/src/final/html/index.html', {
      waitUntil: 'networkidle0',
    });
  }, 30000); 

  afterAll(async () => {
    if (browser) await browser.close();
    if (serverProcess) serverProcess.kill('SIGKILL');
  });

  it('should interact with the page correctly', async () => {
    const bodyExists = await page.$('body');
    expect(bodyExists).not.toBeNull();
  });
});