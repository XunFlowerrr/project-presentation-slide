import { createServer } from 'vite';
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function exportPdf() {
  console.log('Starting Vite dev server...');
  const server = await createServer({
    configFile: path.resolve(__dirname, 'vite.config.ts'),
    server: {
      port: 5173,
      host: true,
    },
  });
  await server.listen();
  server.printUrls();

  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('Navigating to http://localhost:5173/?print ...');
  await page.goto('http://localhost:5173/?print', { waitUntil: 'networkidle0', timeout: 60000 });
  
  console.log('Waiting 10 seconds for Three.js canvases, models, and fonts to fully render...');
  await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log('Seeking video elements to first frame for PDF preview...');
  await page.evaluate(() => {
    document.querySelectorAll('video').forEach(v => {
      v.pause();
      v.currentTime = 0.1;
    });
  });
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log('Exporting presentation slides to presentation.pdf...');
  await page.pdf({
    path: 'presentation.pdf',
    width: 1920,
    height: 1080,
    printBackground: true,
  });

  console.log('Closing browser and server...');
  await browser.close();
  await server.close();
  console.log('Successfully exported presentation slides to presentation.pdf!');
}

exportPdf().catch(err => {
  console.error('Error exporting PDF:', err);
  process.exit(1);
});
