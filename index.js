const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 10000;

app.get('/proxy-stream', async (req, res) => {
    const streamUrl = req.query.url;
    if (!streamUrl) return res.status(400).send("Falta la URL");

    try {
        // Usamos el servicio allorigins para saltar el bloqueo SSL/CORS
        // Esto descarga el contenido por nosotros y nos lo entrega limpio
        const bridgeUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(streamUrl)}`;

        const response = await axios({
            method: 'get',
            url: bridgeUrl,
            responseType: 'arraybuffer',
            timeout: 15000
        });

        res.set('Access-Control-Allow-Origin', '*');
        const contentType = response.headers['content-type'] || '';

        // Si es una lista m3u8 o texto de PHP
        if (streamUrl.includes('m3u8') || streamUrl.includes('php')) {
            let content = response.data.toString('utf8');
            
            // Si el servidor nos devuelve una lista, reescribimos los links
            if (content.includes('#EXTM3U')) {
                const urlObj = new URL(streamUrl);
                const baseUrl = urlObj.origin + urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/') + 1);
                const proxyBase = `https://${req.get('host')}/proxy-stream?url=`;

                const lines = content.split('\n').map(line => {
                    line = line.trim();
                    if (line.startsWith('#') || line === '') return line;
                    
                    let absoluteUrl = line.startsWith('http') ? line : new URL(line, baseUrl).href;
                    return proxyBase + encodeURIComponent(absoluteUrl);
                });

                res.set('Content-Type', 'application/vnd.apple.mpegurl');
                return res.send(lines.join('\n'));
            }
        }

        // Si es video binario
        res.set('Content-Type', contentType || 'video/mp2t');
        res.send(response.data);

    } catch (error) {
        console.error("Error con puente:", error.message);
        res.status(500).send(`Error: No se pudo saltar la protección del servidor original.`);
    }
});

app.get('/', (req, res) => res.send('Proxy Bridge Online'));
app.listen(PORT, () => console.log(`🚀 Puerto: ${PORT}`));

