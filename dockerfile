# Usamos la imagen oficial que ya trae Chrome y Node listos
FROM ghcr.io/puppeteer/puppeteer:21.5.0

# Cambiamos a usuario root para evitar problemas de permisos durante el build
USER root

WORKDIR /usr/src/app

# Copiamos solo los archivos de dependencias primero (mejor para la caché)
COPY package*.json ./

# Instalamos SIN descargar Chromium (porque ya viene en la imagen)
RUN npm install --only=production

# Copiamos el resto del código
COPY . .

# Ajustamos permisos para que el usuario de puppeteer pueda ejecutar el código
RUN chown -R pptruser:pptruser /usr/src/app

# Volvemos al usuario seguro
USER pptruser

CMD [ "node", "index.js" ]

