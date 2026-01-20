const express = require('express');
const puppeteer = require('puppeteer-core'); // Usamos core para ahorrar espacio
const app = express();

const PORT = process.env.PORT || 10000;

app.get('/get-link', async (req, res) => {
    let browser;
    try {
        // Lanzamos el navegador con ajustes para servidores con poca RAM
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

        // 1. Fingir ser un navegador real para evitar bloqueos
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

        // 2. Optimización: No cargar imágenes ni estilos para que Render no explote
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Configurar tiempo de espera largo (90 segundos)
        await page.setDefaultNavigationTimeout(90000);

        // 3. Ir a la web del proxy
        await page.goto('https://www.croxyproxy.com', { waitUntil: 'networkidle2' });
        
        // Esperar 2 segundos para asegurar que carguen los scripts
        await new Promise(r => setTimeout(r, 2000));

        // 4. Escribir la URL letra por letra (delay: 50)
        await page.waitForSelector('#url', { visible: true });
        await page.type('#url', 'https://bsite.net/Spgis/tv/index2.html', { delay: 50 });

        // 5. Clic en el botón
        await page.click('#requestSubmit');
        
        // 6. Esperar a que la URL cambie (que ya no esté en la home de croxyproxy)
        // Esto indica que el proxy está procesando la petición
        await page.waitForFunction(() => !window.location.href.includes('www.croxyproxy.com/index'), { timeout: 40000 });
        
        // Un pequeño respiro final para que cargue el túnel
        await new Promise(r => setTimeout(r, 5000));

        const finalUrl = page.url();
        
        await browser.close();

        // Enviamos la respuesta
        res.json({ 
            success: true, 
            link: finalUrl 
        });

    } catch (error) {
        console.error("DETALLE DEL ERROR:", error.message);
        if (browser) await browser.close();
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Ruta raíz para verificar que el servidor está vivo
app.get('/', (req, res) => {
    res.send('Servidor Scraper funcionando. Usa /get-link para obtener la URL.');
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});
