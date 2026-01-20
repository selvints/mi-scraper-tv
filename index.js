const express = require('express');
const axios = require('axios');
const qs = require('qs');
const app = express();

const PORT = process.env.PORT || 10000;

app.get('/get-link', async (req, res) => {
    try {
        const data = qs.stringify({
            'd': 'https://bsite.net/Spgis/tv/index2.html',
            'server-option': 'us1' 
        });

        const config = {
            method: 'post',
            url: 'https://www.proxysite.com/includes/add_server.php',
            headers: { 
                'authority': 'www.proxysite.com',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'cache-control': 'max-age=0',
                'content-type': 'application/x-www-form-urlencoded',
                'origin': 'https://www.proxysite.com',
                'referer': 'https://www.proxysite.com/',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                // Simulamos una cookie de sesión inicial
                'cookie': 'PS_SESSID=session_placeholder; __cf_bm=placeholder'
            },
            data: data,
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400
        };

        const response = await axios(config);
        const finalLink = response.headers.location;

        if (finalLink) {
            // Si el link es relativo, le pegamos la base
            const fullLink = finalLink.startsWith('http') ? finalLink : `https://www.proxysite.com${finalLink}`;
            res.json({ success: true, link: fullLink });
        } else {
            res.status(404).json({ success: false, error: "No se capturó la redirección. Intenta de nuevo." });
        }

    } catch (error) {
        console.error("ERROR 403:", error.message);
        res.status(error.response?.status || 500).json({ 
            success: false, 
            error: "El proxy bloqueó la conexión (403). Estamos trabajando en saltar el bloqueo." 
        });
    }
});

app.get('/', (req, res) => res.send('Servidor Ligero Activo'));

app.listen(PORT, () => console.log(`🚀 Puerto: ${PORT}`));
