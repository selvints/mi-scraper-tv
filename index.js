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
                '--no-zygote'
            ]
        });

        const page = await browser.newPage();
        
        // Fingir ser un usuario real
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Ir a ProxySite
        await page.goto('https://www.proxysite.com', { waitUntil: 'networkidle2' });

        // Esperar al input de la URL
        await page.waitForSelector('input[name="d"]', { visible: true });
        
        // Escribir la URL
        await page.type('input[name="d"]', 'https://bsite.net/Spgis/tv/index2.html', { delay: 50 });

        // Hacer clic en el botón "GO"
        await page.click('button[type="submit"]');

        // Esperar a que la página cargue el contenido procesado
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

        const finalUrl = page.url();
        await browser.close();

        res.json({ 
            success: true, 
            link: finalUrl 
        });

    } catch (error) {
        if (browser) await browser.close();
        console.error("ERROR:", error.message);
        res.status(500).json({ 
            success: false, 
            error: "Error al obtener el link: " + error.message 
        });
    }
});

app.get('/', (req, res) => res.send('Server Online - Usa /get-link'));

app.listen(PORT, () => console.log(`🚀 Puerto: ${PORT}`));
