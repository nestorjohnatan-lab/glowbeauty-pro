# Guía de Despliegue en VPS (Ubuntu / Debian) para GlowBeauty Pro

Esta guía te permitirá desplegar la aplicación en tu propio servidor VPS (DigitalOcean, Hetzner, Linode, AWS Lightsail, Contabo, etc.) con tu propio dominio y certificado SSL gratuito (HTTPS).

---

## 1. Requisitos Previos en tu VPS

Conéctate a tu VPS por SSH:
```bash
ssh root@tu-ip-o-servidor
```

Actualiza los paquetes e instala Node.js (v20 o superior), Nginx y Certbot:
```bash
# Actualizar el sistema
apt update && apt upgrade -y

# Instalar Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs nginx certbot python3-certbot-nginx git

# Instalar PM2 para mantener la app corriendo 24/7
npm install -g pm2
```

---

## 2. Clonar / Subir el Proyecto

Puedes subir el código mediante Git o usando `rsync` / `scp`:
```bash
mkdir -p /var/www/glowbeauty
cd /var/www/glowbeauty

# Si usas Git:
# git clone <tu-repositorio> .

# O copiarlo directamente desde tu máquina local hacia el VPS:
# rsync -avz --exclude 'node_modules' --exclude '.git' ./ root@tu-ip:/var/www/glowbeauty/
```

---

## 3. Configurar el Entorno y Compilar

```bash
cd /var/www/glowbeauty

# Instalar dependencias de producción
npm install

# Configurar variables de entorno
cp .env.example .env
nano .env
```

En `.env`, asegúrate de definir un `JWT_SECRET` seguro:
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=tu_clave_secreta_super_segura_aqui_generada_al_azar
GEMINI_API_KEY=tu_gemini_api_key_opcional
```

Compila la aplicación:
```bash
npm run build
```

---

## 4. Iniciar con PM2 (Servicio Continuo)

Inicia la aplicación con PM2 para que reinicie automáticamente ante reinicios del VPS:
```bash
pm2 start dist/server.cjs --name "glowbeauty"
pm2 save
pm2 startup
# Ejecuta el comando que PM2 te imprima en pantalla
```

Comprueba que la app está respondiendo:
```bash
curl http://localhost:3000/api/health
```

---

## 5. Configurar Nginx con tu Dominio

Crea la configuración de Nginx reemplazando `tudominio.com` por tu dominio o subdominio real:
```bash
nano /etc/nginx/sites-available/glowbeauty
```

Pega lo siguiente:
```nginx
server {
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 15M;
}
```

Habilita el sitio y reinicia Nginx:
```bash
ln -s /etc/nginx/sites-available/glowbeauty /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 6. Activar Certificado SSL Gratuito (HTTPS) con Certbot

Asegúrate de que los registros DNS (tipo A) de `tudominio.com` apunten a la IP pública de tu VPS. Luego ejecuta:
```bash
certbot --nginx -d tudominio.com -d www.tudominio.com
```
Certbot configurará automáticamente la renovación periódica y el cifrado HTTPS.

---

## 7. Acceso y Personalización del Profesional

1. Abre en tu navegador `https://tudominio.com`. Verás el **Portal Público de Reservas** con catálogo, horarios disponibles y enlaces de WhatsApp listos.
2. Para acceder al panel de administración, haz clic en el botón superior **"Modo Administrador"** o ingresa tus credenciales:
   * **Email inicial:** `admin@glowbeauty.pro`
   * **Contraseña inicial:** `admin123*`
3. En la pestaña **Perfil & Difusión**, puedes:
   * Modificar nombre del salón, fotos de portada y avatar.
   * Cambiar los datos de cobro de seña (PIX o transferencias bancarias locales).
   * Modificar el email y contraseña de acceso desde el panel.

