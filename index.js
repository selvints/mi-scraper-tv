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
                '--single-process', // Crucial para Render
                '--no-zygote'
            ]
        });

        const page = await browser.newPage();
        
        // BLOQUEO TOTAL de contenido innecesario (Ahorra un 70% de RAM)
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const whitelist = ['document', 'script', 'xhr', 'fetch'];
            if (!whitelist.includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        // Navegar a ProxySite
        await page.goto('https://www.proxysite.com', { waitUntil: 'domcontentloaded' });

        // Esperar e inyectar la URL directamente en el campo
        await page.waitForSelector('input[name="d"]', { timeout: 10000 });
        await page.type('input[name="d"]', 'https://bsite.net/Spgis/tv/index2.html');

        // Clic y esperar navegación
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 })
        ]);

        const finalUrl = page.url();
        await browser.close();

        res.json({ success: true, link: finalUrl });

    } catch (error) {
        if (browser) await browser.close();
        console.error("ERROR:", error.message);
        res.status(500).json({ success: false, error: "El servidor está muy saturado. Intenta de nuevo en 10 segundos." });
    }
});

app.get('/', (req, res) => res.send('Server Online - Usa /get-link'));

app.listen(PORT, () => console.log(`🚀 Puerto: ${PORT}`));
