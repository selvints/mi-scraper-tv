FROM ghcr.io/puppeteer/puppeteer:21.5.0

USER root
WORKDIR /usr/src/app

# Copiamos archivos
COPY package*.json ./

# Instalación optimizada para poca memoria
RUN npm install --omit=dev --no-audit --no-fund

COPY . .

# Permisos para el usuario interno
RUN chown -R pptruser:pptruser /usr/src/app
USER pptruser

CMD [ "node", "index.js" ]
