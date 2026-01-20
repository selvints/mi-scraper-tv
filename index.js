const express = require('express');
const puppeteer = require('puppeteer-core');
const app = express();

const PORT = process.env.PORT || 10000;

app.get('/get-link', async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome', // Ruta para Docker
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });

        const page = await browser.newPage();
        
        // 1. Navegar al proxy
        await page.goto('https://www.croxyproxy.com', { waitUntil: 'networkidle2' });
        
        // 2. Escribir la URL
        await page.waitForSelector('#url');
        await page.type('#url', 'https://bsite.net/Spgis/tv/index2.html');
        
        // 3. Click y esperar a que procese
        await Promise.all([
            page.click('#requestSubmit'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        // 4. Obtener la URL final donde aterrizó el proxy
        const finalUrl = page.url();
        
        await browser.close();
        res.json({ success: true, link: finalUrl });

    } catch (error) {
        if (browser) await browser.close();
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});

