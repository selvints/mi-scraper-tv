const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 10000;

app.get('/proxy-stream', async (req, res) => {
    const streamUrl = req.query.url;
    if (!streamUrl) return res.status(400).send("Falta la URL");

    try {
        const response = await axios.get(streamUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            responseType: 'text' // Leemos el m3u8 como texto
        });

        let content = response.data;
        const baseUrl = streamUrl.substring(0, streamUrl.lastIndexOf('/') + 1);
        const proxyBase = `https://${req.get('host')}/proxy-stream?url=`;

        // REESCRITURA: Buscamos cada línea que no sea un comentario (#) y sea un link
        // Convertimos links relativos en absolutos y les ponemos nuestro proxy delante
        const lines = content.split('\n').map(line => {
            if (line.startsWith('#') || line.trim() === '') return line;
            
            let absoluteUrl = line.startsWith('http') ? line : baseUrl + line;
            return proxyBase + encodeURIComponent(absoluteUrl.trim());
        });

        res.set({
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/vnd.apple.mpegurl'
        });

        res.send(lines.join('\n'));

    } catch (error) {
        // Si falla como texto (porque es un fragmento de video .ts), lo enviamos como stream binario
        try {
            const binaryRes = await axios({
                method: 'get',
                url: streamUrl,
                responseType: 'stream'
            });
            res.set('Access-Control-Allow-Origin', '*');
            binaryRes.data.pipe(res);
        } catch (err) {
            res.status(500).send("Error al procesar el stream");
        }
    }
});

app.get('/', (req, res) => res.send('Proxy Inteligente CORS Online'));
app.listen(PORT, () => console.log(`🚀 Proxy en puerto ${PORT}`));
