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
        
        // 1. User Agent muy específico de Chrome moderno
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // 2. Ir a la web
        await page.goto('https://www.croxyproxy.com', { waitUntil: 'networkidle2' });

        // 3. Esperar y escribir la URL (Simulando escritura humana)
        await page.waitForSelector('#url', { visible: true });
        await page.focus('#url');
        await page.type('#url', 'https://bsite.net/Spgis/tv/index2.html', { delay: 100 });

        // 4. En lugar de hacer clic directamente, presionamos la tecla ENTER
        // Esto a veces evita que el sistema de seguridad detecte el clic automático
        await page.keyboard.press('Enter');

        // 5. Esperar a que la URL cambie
        // Si no cambia en 20 segundos, lanzará error
        await page.waitForFunction(() => {
            return window.location.href.includes('proxy.com/_') || window.location.href.includes('php?u=');
        }, { timeout: 20000 });

        const finalUrl = page.url();
        await browser.close();

        res.json({ success: true, link: finalUrl });

    } catch (error) {
        if (browser) await browser.close();
        console.error("ERROR:", error.message);
        res.status(500).json({ success: false, error: "El proxy tardó demasiado o detectó el bot. Intenta de nuevo." });
    }
});

app.get('/', (req, res) => res.send('Server Online'));

app.listen(PORT, () => console.log(`🚀 Puerto: ${PORT}`));
