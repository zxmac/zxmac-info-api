import { Router } from 'express';
import puppeteer from 'puppeteer';
import { Tool } from '../controllers';

export const router = Router();

router.post('/form/json/:keys/', (req: any, res: any) => {
  const data = Tool.formToJson(req.body || '', req.params.keys);
  res.json(data);
});

router.post('/puppeteer/pdfbuffer', async (req: any, res: any) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // await page.goto(req.body.url);
  await page.goto(req.body.url, {
    waitUntil: 'networkidle0', // Ensures dynamic content has time to load
    timeout: 60000 // Optional: increase timeout if page load is slow
  });
  await page.emulateMediaType('screen');

  const pdfBuffer = await page.pdf({ format: 'A4' });

  res.send(pdfBuffer);

  await browser.close();
});