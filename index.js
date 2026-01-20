const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 10000;

app.get('/proxy-stream', async (req, res) => {
    const streamUrl = req.query.url;
    if (!streamUrl) return res.status(400).send("Falta la URL");

    try {
        const response = await axios({
            method: 'get',
            url: streamUrl,
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': new URL(streamUrl).origin
            },
            responseType: 'arraybuffer' // Bajamos los datos en crudo para decidir qué hacer
        });

        const contentType = response.headers['content-type'] || '';
        
        // Configuramos cabeceras CORS básicas para todos
        res.set('Access-Control-Allow-Origin', '*');

        // CASO A: Es una lista de reproducción (Texto M3U8)
        if (contentType.includes('mpegurl') || contentType.includes('application/x-mpegURL') || streamUrl.includes('m3u8')) {
            let content = response.data.toString('utf8');
            const baseUrl = streamUrl.substring(0, streamUrl.lastIndexOf('/') + 1);
            const proxyBase = `https://${req.get('host')}/proxy-stream?url=`;

            // Reescritura de líneas
            const lines = content.split('\n').map(line => {
                line = line.trim();
                if (line.startsWith('#') || line === '') return line;
                
                // Convertir link relativo a absoluto
                let absoluteUrl;
                try {
                    absoluteUrl = new URL(line, baseUrl).href;
                } catch (e) {
                    absoluteUrl = baseUrl + line;
                }
                
                return proxyBase + encodeURIComponent(absoluteUrl);
            });

            res.set('Content-Type', 'application/vnd.apple.mpegurl');
            return res.send(lines.join('\n'));
        } 

        // CASO B: Es un fragmento de video (.ts) u otro binario
        res.set('Content-Type', contentType);
        res.send(response.data);

    } catch (error) {
        console.error("Error detallado:", error.message);
        res.status(500).send("Error al procesar el stream: " + error.message);
    }
});

app.get('/', (req, res) => res.send('Proxy CORS HLS v3 Online'));
app.listen(PORT, () => console.log(`🚀 Proxy activo en puerto ${PORT}`));
