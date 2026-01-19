# 1. Usamos una imagen de Node que ya incluya herramientas de Chrome
FROM ghcr.io/puppeteer/puppeteer:21.5.0

# 2. Directorio de trabajo
WORKDIR /usr/src/app

# 3. Copiamos el package.json para instalar dependencias
COPY package*.json ./
RUN npm install

# 4. Copiamos el resto del código de tu proyecto
COPY . .

# 5. Puerto que usa Render (por defecto 10000)
ENV PORT=10000
EXPOSE 10000

# 6. Comando para arrancar la app
CMD [ "node", "index.js" ]
