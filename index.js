const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/get-link', async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // Ir al proxy
        await page.goto('https://www.croxyproxy.com', { waitUntil: 'networkidle2' });
        
        // Meter la URL
        await page.type('#url', 'https://bsite.net/Spgis/tv/index2.html');
        
        // Click y esperar carga
        await Promise.all([
            page.click('#requestSubmit'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        // Retornar la URL final donde está el video
        const finalUrl = page.url();
        await browser.close();
        
        res.json({ success: true, link: finalUrl });
    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor listo en puerto ${PORT}`));