const express = require('express');
const axios = require('axios');
const qs = require('qs'); // Para formatear los datos del formulario
const app = express();

const PORT = process.env.PORT || 10000;

app.get('/get-link', async (req, res) => {
    try {
        // Configuramos la URL y el servidor de proxy que queremos usar (us-1, eu-1, etc.)
        const data = qs.stringify({
            'd': 'https://bsite.net/Spgis/tv/index2.html',
            'server-option': 'us1' 
        });

        const config = {
            method: 'post',
            url: 'https://www.proxysite.com/includes/add_server.php',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            data: data,
            maxRedirects: 0, // Evitamos que siga la redirección para capturar la URL
            validateStatus: function (status) {
                return status >= 200 && status < 400; // Aceptamos el código 302 de redirección
            }
        };

        const response = await axios(config);

        // El link final suele venir en el encabezado 'location'
        const finalLink = response.headers.location;

        if (finalLink) {
            res.json({
                success: true,
                link: finalLink
            });
        } else {
            throw new Error("No se pudo obtener la redirección del proxy");
        }

    } catch (error) {
        console.error("ERROR:", error.message);
        res.status(500).json({
            success: false,
            error: "Error ligero: " + error.message
        });
    }
});

app.get('/', (req, res) => res.send('Servidor Ligero Online'));

app.listen(PORT, () => console.log(`🚀 Corriendo en puerto ${PORT}`));
