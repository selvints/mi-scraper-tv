const express = require('express');
const puppeteer = require('puppeteer-core');
const app = express();

const PORT = process.env.PORT || 10000;

app.get('/get-link', async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome',
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process',
                '--no-zygote',
                '--window-size=1280,800' // Simulamos un monitor estándar
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // User Agent actualizado
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Bloqueamos SOLO imágenes y fuentes para ahorrar RAM, pero dejamos CSS
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setDefaultNavigationTimeout(60000);

        // 1. Ir a CroxyProxy
        await page.goto('https://www.croxyproxy.com', { waitUntil: 'networkidle2' });
        
        // 2. Esperar a que el input sea visible
        const inputSelector = '#url';
        await page.waitForSelector(inputSelector, { visible: true, timeout: 15000 });

        // 3. Escribir la URL
        await page.type(inputSelector, 'https://bsite.net/Spgis/tv/index2.html', { delay: 30 });

        // 4. Clic en el botón de envío
        const btnSelector = '#requestSubmit';
        await page.waitForSelector(btnSelector, { visible: true });
        
        // Usamos un clic forzado por si hay algo encima
        await page.evaluate((sel) => document.querySelector(sel).click(), btnSelector);

        // 5. Esperar a que cambie la URL (indicando éxito)
        await page.waitForFunction(() => !window.location.href.includes('croxyproxy.com/index') && !window.location.href.endsWith('.com/'), { timeout: 30000 });

        const finalUrl = page.url();
        await browser.close();

        res.json({ success: true, link: finalUrl });

    } catch (error) {
        if (browser) await browser.close();
        console.error("ERROR EN SCRAPER:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => res.send('Server Online'));

app.listen(PORT, () => console.log(`🚀 Puerto: ${PORT}`));
