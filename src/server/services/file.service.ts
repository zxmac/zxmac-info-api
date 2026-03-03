import puppeteer, { PaperFormat } from "puppeteer";

async function generatePdfBuffer(url: string, opt?: { token?: string, format?: PaperFormat }) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  if (opt?.token) {
    await page.setExtraHTTPHeaders({
      'Authorization': 'Bearer ' + opt.token
    });
  }

  // await page.goto(req.body.url);
  await page.goto(url, {
    waitUntil: 'networkidle0', // Ensures dynamic content has time to load
    timeout: 60000 // Optional: increase timeout if page load is slow
  });
  await page.emulateMediaType('screen');

  const pdfBuffer = await page.pdf({ format: opt?.format || 'A4' });

  await browser.close();

  return pdfBuffer;
}

export default {
  generatePdfBuffer
};