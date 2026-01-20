export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Obtenemos la URL que queremos "tunelizar"
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response("Falta el parámetro ?url=", { status: 400 });
    }

    // Cabeceras que imitan a un navegador Chrome real
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'es-ES,es;q=0.9',
      'Referer': new URL(targetUrl).origin,
      'Origin': new URL(targetUrl).origin
    };

    try {
      const response = await fetch(targetUrl, { headers });
      
      // Creamos una nueva respuesta para inyectar los permisos CORS
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", "*");
      newHeaders.set("Access-Control-Allow-Methods", "GET, OPTIONS");
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } catch (e) {
      return new Response("Error al conectar con el origen: " + e.message, { status: 500 });
    }
  }
};
