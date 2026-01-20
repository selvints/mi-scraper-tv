const express = require('express');
const axios = require('axios');
const https = require('https');
const crypto = require('crypto');
const app = express();

const PORT = process.env.PORT || 10000;

// Configuración de seguridad avanzada para imitar a un navegador
const httpsAgent = new https.Agent({ 
    rejectUnauthorized: false,
    // Estos ciphers ayudan a evitar el error SSL alert 80
    ciphers: 'DEFAULT',
    secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
    minVersion: 'TLSv1' // Permite versiones antiguas si el servidor las pide
});

app.get('/proxy-stream', async (req, res) => {
    const streamUrl = req.query.url;
    if (!streamUrl) return res.status(400).send("Falta la URL");

    try {
        const response = await axios({
            method: 'get',
            url: streamUrl,
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            httpsAgent: httpsAgent,
            responseType: 'arraybuffer',
            timeout: 20000
        });

        const contentType = response.headers['content-type'] || '';
        res.set('Access-Control-Allow-Origin', '*');

        // Si es una lista o contenido de texto (PHP que genera M3U8)
        if (contentType.includes('text') || contentType.includes('mpegurl') || streamUrl.includes('php') || streamUrl.includes('m3u8')) {
            let content = response.data.toString('utf8');
            
            // Si el contenido tiene enlaces, intentamos reescribirlos
            if (content.includes('http')) {
                const urlObj = new URL(streamUrl);
                const baseUrl = urlObj.origin + urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/') + 1);
                const proxyBase = `https://${req.get('host')}/proxy-stream?url=`;

                const lines = content.split('\n').map(line => {
                    line = line.trim();
                    if (line.startsWith('#') || line === '') return line;
                    
                    let absoluteUrl;
                    if (line.startsWith('http')) {
                        absoluteUrl = line;
                    } else {
                        absoluteUrl = new URL(line, baseUrl).href;
                    }
                    return proxyBase + encodeURIComponent(absoluteUrl);
                });
                res.set('Content-Type', 'application/vnd.apple.mpegurl');
                return res.send(lines.join('\n'));
            }
        }

        // Si es binario (video .ts)
        res.set('Content-Type', contentType);
        res.send(response.data);

    } catch (error) {
        console.error("ERROR SSL:", error.message);
        res.status(500).send(`Error de Conexión Segura: ${error.message}`);
    }
});

app.get('/', (req, res) => res.send('Proxy SSL Bypass Online'));
app.listen(PORT, () => console.log(`🚀 Puerto: ${PORT}`));
