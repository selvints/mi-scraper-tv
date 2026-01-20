const express = require('express');
const axios = require('axios');
const https = require('https');
const app = express();

const PORT = process.env.PORT || 10000;

// Agente para ignorar problemas de certificados SSL antiguos
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

app.get('/proxy-stream', async (req, res) => {
    const streamUrl = req.query.url;
    if (!streamUrl) return res.status(400).send("Falta la URL");

    try {
        const response = await axios({
            method: 'get',
            url: streamUrl,
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Encoding': 'identity',
                'Connection': 'keep-alive'
            },
            httpsAgent: httpsAgent,
            responseType: 'arraybuffer',
            timeout: 15000 // Aumentamos a 15 segundos
        });

        const contentType = response.headers['content-type'] || '';
        res.set('Access-Control-Allow-Origin', '*');

        // Detectar si es una lista de reproducción (m3u8)
        if (contentType.includes('mpegurl') || contentType.includes('application/x-mpegURL') || streamUrl.includes('m3u8')) {
            let content = response.data.toString('utf8');
            
            // Lógica para reconstruir rutas relativas
            const urlObj = new URL(streamUrl);
            const baseUrl = urlObj.origin + urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/') + 1);
            const proxyBase = `https://${req.get('host')}/proxy-stream?url=`;

            const lines = content.split('\n').map(line => {
                line = line.trim();
                if (line.startsWith('#') || line === '') return line;
                
                let absoluteUrl;
                if (line.startsWith('http')) {
                    absoluteUrl = line;
                } else if (line.startsWith('/')) {
                    absoluteUrl = urlObj.origin + line;
                } else {
                    absoluteUrl = baseUrl + line;
                }
                
                return proxyBase + encodeURIComponent(absoluteUrl);
            });

            res.set('Content-Type', 'application/vnd.apple.mpegurl');
            return res.send(lines.join('\n'));
        } 

        // Si es un segmento de video (.ts)
        res.set('Content-Type', contentType);
        res.send(response.data);

    } catch (error) {
        console.error("DEBUG LOG:", error.message);
        // Si el error es 403 o 404, mostramos el detalle exacto
        res.status(500).send(`Error: ${error.message} - URL: ${streamUrl}`);
    }
});

app.get('/', (req, res) => res.send('Proxy Espejo Online'));
app.listen(PORT, () => console.log(`🚀 Puerto: ${PORT}`));
