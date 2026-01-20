const express = require('express');
const app = express();

const PORT = process.env.PORT || 10000;

app.get('/proxy-stream', (req, res) => {
    const streamUrl = req.query.url;
    if (!streamUrl) return res.status(400).send("Falta la URL");

    // En lugar de descargar el video, redirigimos al navegador al origen
    // Pero antes, enviamos cabeceras CORS para intentar abrir el túnel
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
    });

    // Redirección Temporal (307 mantiene el método de la petición)
    // Esto hace que el navegador intente conectar directamente al link
    res.redirect(307, streamUrl);
});

app.get('/get-link', (req, res) => {
    const target = "http://tecnotv.club/18ene/phpcode/lista0.php?c=64";
    const proxyUrl = `https://${req.get('host')}/proxy-stream?url=${encodeURIComponent(target)}`;
    res.json({ success: true, link: proxyUrl });
});

app.get('/', (req, res) => res.send('Redirector CORS Activo'));

app.listen(PORT, () => console.log(`🚀 Redirector en puerto ${PORT}`));
