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
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        // OPTIMIZACIÓN: No cargar imágenes ni CSS pesado para ahorrar RAM
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Aumentamos el tiempo de espera a 90 segundos
        await page.setDefaultNavigationTimeout(90000);

        await page.goto('https://www.croxyproxy.com', { waitUntil: 'networkidle2' });
        
        await page.waitForSelector('#url', { visible: true });
        await page.type('#url', 'https://bsite.net/Spgis/tv/index2.html');

        await Promise.all([
            page.click('#requestSubmit'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        const finalUrl = page.url();
        await browser.close();
        
        res.json({ success: true, link: finalUrl });

    } catch (error) {
        console.error("DETALLE DEL ERROR:", error.message);
        if (browser) await browser.close();
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
