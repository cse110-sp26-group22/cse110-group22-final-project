const fs = require("fs");
const http = require("http");
const path = require("path");
const puppeteer = require("puppeteer");

const rootDir = path.resolve(__dirname, "..");
const finalDir = path.join(rootDir, "src", "final");
const finalHtmlPath = path.join(rootDir, "src", "final", "html", "index.html");

jest.setTimeout(60000);

class TestHTMLElement {
  constructor(tagName, attributes = {}) {
    this.tagName = tagName.toUpperCase();
    this.id = attributes.id || "";
    this.children = [];
    this.parentElement = null;
    this.value = "";
    this.src = "";
    this._textContent = "";
    this.listeners = {};
    this.classList = createClassList(attributes.class || "");
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  addEventListener(type, handler) {
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push(handler);
  }

  dispatchEvent(event) {
    const handlers = this.listeners[event.type] || [];
    handlers.forEach((handler) => handler(event));
  }

  querySelector(selector) {
    return findElement(this, selector);
  }

  querySelectorAll(selector) {
    return findElements(this, selector);
  }

  set textContent(value) {
    this._textContent = String(value);
  }

  get textContent() {
    const childText = this.children.map((child) => child.textContent).join("");
    return `${this._textContent}${childText}`;
  }
}

class TestHTMLInputElement extends TestHTMLElement {}

function createClassList(initialClassName) {
  const classes = new Set(initialClassName.split(/\s+/).filter(Boolean));

  return {
    add: (...classNames) => classNames.forEach((className) => classes.add(className)),
    contains: (className) => classes.has(className),
    toString: () => Array.from(classes).join(" "),
  };
}

function createElement(tagName, attributes = {}) {
  if (tagName.toLowerCase() === "input") {
    return new TestHTMLInputElement(tagName, attributes);
  }

  return new TestHTMLElement(tagName, attributes);
}

function parseAttributes(rawAttributes) {
  const attributes = {};
  const attrPattern = /([a-zA-Z-]+)="([^"]*)"/g;
  let match;

  while ((match = attrPattern.exec(rawAttributes)) !== null) {
    attributes[match[1]] = match[2];
  }

  return attributes;
}

function createDocumentFromHtml(html) {
  const root = createElement("document");
  const stack = [root];
  const tokenPattern = /<\/?([a-zA-Z0-9-]+)([^>]*)>|([^<]+)/g;
  const selfClosingTags = new Set(["meta", "link", "input"]);
  let match;

  while ((match = tokenPattern.exec(html)) !== null) {
    const [token, tagName, rawAttributes, text] = match;

    if (text) {
      const normalizedText = text.replace(/\s+/g, " ").trim();
      if (normalizedText) {
        stack[stack.length - 1].textContent += normalizedText;
      }
      continue;
    }

    if (token.startsWith("</")) {
      stack.pop();
      continue;
    }

    if (tagName.toLowerCase() === "script") {
      continue;
    }

    const element = createElement(tagName, parseAttributes(rawAttributes));
    stack[stack.length - 1].appendChild(element);

    if (!selfClosingTags.has(tagName.toLowerCase()) && !token.endsWith("/>")) {
      stack.push(element);
    }
  }

  return {
    createElement: (tagName) => createElement(tagName),
    querySelector: (selector) => findElement(root, selector),
    querySelectorAll: (selector) => findElements(root, selector),
  };
}

function findElement(root, selector) {
  return findElements(root, selector)[0] || null;
}

function findElements(root, selector) {
  const matches = [];

  function walk(element) {
    if (matchesSelector(element, selector)) {
      matches.push(element);
    }

    element.children.forEach(walk);
  }

  walk(root);
  return matches;
}

function matchesSelector(element, selector) {
  if (selector.startsWith("#")) {
    return element.id === selector.slice(1);
  }

  if (selector.startsWith(".")) {
    return element.classList.contains(selector.slice(1));
  }

  return element.tagName.toLowerCase() === selector.toLowerCase();
}

function loadFinalUI() {
  jest.resetModules();

  const html = fs.readFileSync(finalHtmlPath, "utf8");
  const document = createDocumentFromHtml(html);

  global.document = document;
  global.HTMLElement = TestHTMLElement;
  global.HTMLInputElement = TestHTMLInputElement;

  const GameUI = require("../src/final/js/ui/components/GameUI.js").default;
  const gameUI = new GameUI(document.querySelector("#game-ui"));

  return { document, gameUI };
}

function getContentType(filePath) {
  const extension = path.extname(filePath);

  if (extension === ".html") return "text/html";
  if (extension === ".js") return "text/javascript";
  if (extension === ".css") return "text/css";
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";

  return "application/octet-stream";
}

function startStaticServer(rootPath) {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://localhost");
    const requestedPath = path.normalize(decodeURIComponent(requestUrl.pathname));
    const filePath = path.join(rootPath, requestedPath);

    if (!filePath.startsWith(rootPath)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, { "Content-Type": getContentType(filePath) });
      response.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((closeResolve) => server.close(closeResolve)),
      });
    });
  });
}

describe("final game end-to-end UI flow", () => {
  afterEach(() => {
    delete global.document;
    delete global.HTMLElement;
    delete global.HTMLInputElement;
  });

  test("renders a final question, tracks typed input, and grows a plant for a correct Enter submission", () => {
    const { document, gameUI } = loadFinalUI();
    const prompt = document.querySelector(".prompt-display-text");
    const input = document.querySelector(".code-input");
    const invisibleGhost = document.querySelector(".ghost-text-invisible");
    const visibleGhost = document.querySelector(".ghost-text-visible");
    const plantGroup = document.querySelector(".plant-display-group");

    gameUI.sendQuestion(
      "Print \"Hello, World!\" in Python",
      "print(\"Hello, World!\")"
    );

    expect(prompt.textContent).toBe("Print \"Hello, World!\" in Python");
    expect(invisibleGhost.textContent).toBe("");
    expect(visibleGhost.textContent).toBe("print(\"Hello, World!\")");

    input.value = "print";
    input.dispatchEvent({ type: "input" });
    expect(invisibleGhost.textContent).toBe("print");
    expect(visibleGhost.textContent).toBe("(\"Hello, World!\")");

    input.value = "not the answer";
    input.dispatchEvent({ type: "keydown", key: "Enter" });
    expect(plantGroup.children).toHaveLength(0);

    input.value = "print(\"Hello, World!\")";
    input.dispatchEvent({ type: "keydown", key: "Enter" });

    expect(plantGroup.children).toHaveLength(1);
    expect(plantGroup.children[0].classList.contains("plant-display")).toBe(true);
    expect(plantGroup.children[0].children[0].tagName).toBe("IMG");
    expect(plantGroup.children[0].children[0].src).toBe("../assets/images/plant/plant-small.png");
  });
});

describe("final game Puppeteer end-to-end flow", () => {
  let browser;
  let server;

  beforeAll(async () => {
    server = await startStaticServer(finalDir);
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 30000,
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }

    if (server) {
      await server.close();
    }
  });

  test("runs the final page in a real browser and grows a plant after a correct answer", async () => {
    const page = await browser.newPage();

    await page.goto(`${server.baseUrl}/html/index.html`, { waitUntil: "networkidle0" });

    await expect(page.$eval(".prompt-display-text", (element) => element.textContent))
      .resolves.toBe("Print \"Hello, World!\" in Python");
    await expect(page.$eval(".ghost-text-visible", (element) => element.textContent))
      .resolves.toBe("print(\"Hello, World!\")");

    await page.type(".code-input", "print");
    await expect(page.$eval(".ghost-text-invisible", (element) => element.textContent))
      .resolves.toBe("print");
    await expect(page.$eval(".ghost-text-visible", (element) => element.textContent))
      .resolves.toBe("(\"Hello, World!\")");

    await page.keyboard.press("Enter");
    await expect(page.$$eval(".plant-display", (plants) => plants.length)).resolves.toBe(0);

    await page.$eval(".code-input", (input) => {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.type(".code-input", "print(\"Hello, World!\")");
    await page.keyboard.press("Enter");

    await page.waitForSelector(".plant-display img");
    await expect(page.$$eval(".plant-display", (plants) => plants.length)).resolves.toBe(1);
    await expect(page.$eval(".plant-display img", (image) => image.getAttribute("src")))
      .resolves.toBe("../assets/images/plant/plant-small.png");

    await page.close();
  });

  test("simulates a simple game session with wrong and correct submissions", async () => {
    const page = await browser.newPage();

    await page.goto(`${server.baseUrl}/html/index.html`, { waitUntil: "networkidle0" });

    await page.click(".code-input");
    await page.type(".code-input", "print('wrong')");
    await page.keyboard.press("Enter");
    await expect(page.$$eval(".plant-display", (plants) => plants.length)).resolves.toBe(0);

    await page.$eval(".code-input", (input) => {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    await page.type(".code-input", "print(\"Hello, World!\")");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".plant-display img");
    await expect(page.$$eval(".plant-display", (plants) => plants.length)).resolves.toBe(1);

    await page.keyboard.press("Enter");
    await expect(page.$$eval(".plant-display", (plants) => plants.length)).resolves.toBe(2);

    await expect(page.$eval(".prompt-display-text", (element) => element.textContent))
      .resolves.toBe("Print \"Hello, World!\" in Python");
    await expect(page.$eval(".ghost-text-invisible", (element) => element.textContent))
      .resolves.toBe("print(\"Hello, World!\")");
    await expect(page.$eval(".ghost-text-visible", (element) => element.textContent))
      .resolves.toBe("");

    await page.close();
  });

  test("renders the final game shell and stylesheet-backed farm scene in a real browser", async () => {
    const page = await browser.newPage();

    await page.goto(`${server.baseUrl}/html/index.html`, { waitUntil: "networkidle0" });

    await expect(page.$eval(".site-title", (element) => element.textContent))
      .resolves.toBe("Python Typing Game");
    await expect(page.$eval(".rules-box h3", (element) => element.textContent))
      .resolves.toBe("How to play!");
    await expect(page.$eval("#progress", (element) => element.textContent))
      .resolves.toBe("0 / 30");

    const gameUiMetrics = await page.$eval(".game-ui", (element) => {
      const styles = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return {
        backgroundImage: styles.backgroundImage,
        display: styles.display,
        height: rect.height,
        width: rect.width,
      };
    });

    expect(gameUiMetrics.display).toBe("grid");
    expect(gameUiMetrics.backgroundImage).toContain("game-backdrop.jpg");
    expect(gameUiMetrics.width).toBeGreaterThan(0);
    expect(gameUiMetrics.height).toBeGreaterThan(0);

    await page.close();
  });
});
