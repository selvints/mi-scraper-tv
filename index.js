const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 10000;

// 1. Ruta para obtener el enlace procesado
app.get('/get-link', (req, res) => {
    // La URL de tu servidor en Render + la ruta del proxy
    const baseUrl = `https://${req.get('host')}/proxy-stream?url=`;
    
    // Aquí pondrías el m3u8 original (o lo extraes dinámicamente)
    const originalStream = "https://tu-enlace-m3u8-real.com/video.m3u8"; 
    
    res.json({
        success: true,
        link: baseUrl + encodeURIComponent(originalStream)
    });
});

// 2. El "Túnel" que elimina el bloqueo de CORS
app.get('/proxy-stream', async (req, res) => {
    const streamUrl = req.query.url;

    if (!streamUrl) return res.status(400).send("Falta la URL del stream");

    try {
        const response = await axios({
            method: 'get',
            url: streamUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        // INYECTAMOS LOS PERMISOS CORS
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Content-Type': response.headers['content-type'] || 'application/vnd.apple.mpegurl'
        });

        // Reenviamos el video al navegador
        response.data.pipe(res);

    } catch (error) {
        console.error("Error en el túnel:", error.message);
        res.status(500).send("Error al procesar el stream");
    }
});

app.get('/', (req, res) => res.send('Proxy CORS Activo'));

app.listen(PORT, () => console.log(`🚀 Proxy funcionando en puerto ${PORT}`));
