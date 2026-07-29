import puppeteer from "puppeteer-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

export async function launch() {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "kq-"));
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    userDataDir,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--hide-scrollbars",
      "--disable-features=IsolateOrigins,site-per-process",
      // Cookiebot fuera: en sesión viva el banner cambia el render
      '--host-resolver-rules=MAP consent.cookiebot.com 127.0.0.1,MAP consentcdn.cookiebot.com 127.0.0.1,MAP *.cookiebot.com 127.0.0.1,MAP consent.cookiebot.eu 127.0.0.1',
    ],
  });
  return { browser, userDataDir };
}

/** Abre una página con viewport dado. mobile=true → device metrics 390x844 por CDP. */
export async function openPage(browser, url, { width, height, mobile = false, dsf = 1 } = {}) {
  const page = await browser.newPage();
  const client = await page.createCDPSession();
  if (mobile) {
    // `page.setViewport` ES `Emulation.setDeviceMetricsOverride` por dentro,
    // pero además puppeteer lo recuerda al capturar: llamando al CDP a pelo,
    // `page.screenshot()` captura la ventana real (800×600) en vez del
    // viewport emulado. Con setViewport la captura sale a 390 de verdad.
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: dsf,
      isMobile: true,
      hasTouch: true,
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36"
    );
  } else {
    await page.setViewport({ width, height, deviceScaleFactor: dsf });
  }
  await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });
  return { page, client };
}

/** Divi recalcula alturas por JS tras el load: pase de scroll + settle + lazy→eager. */
export async function settle(page) {
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((i) => {
      i.loading = "eager";
      if (i.dataset.src && !i.src) i.src = i.dataset.src;
    });
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 600));
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 400));
  });
  await new Promise((r) => setTimeout(r, 800));
}

export function w(file, data) {
  fs.writeFileSync(file, typeof data === "string" ? data : JSON.stringify(data, null, 2));
  console.log("→", file);
}
