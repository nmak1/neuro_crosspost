# 🚀 Инструкции по деплою

Проект собран и готов к деплою! Выберите платформу:

---

## 1️⃣ Vercel (рекомендуется)

### Автоматический деплой через GitHub:
1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Импортируйте репозиторий `nmak1/neuro-crosspost`
4. Vercel автоматически определит Vite и задеплоит

### Через CLI:
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 2️⃣ Netlify

### Автоматический деплой через GitHub:
1. Перейдите на [netlify.com](https://netlify.com)
2. Нажмите "Add new site" → "Import an existing project"
3. Выберите репозиторий `nmak1/neuro-crosspost`
4. Build settings уже настроены в `netlify.toml`

### Через CLI:
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

---

## 3️⃣ GitHub Pages

### Добавьте в `vite.config.js`:
```javascript
export default defineConfig({
  // ... существующий код
  base: '/neuro-crosspost/', // имя репозитория
});
```

### Задеплойте:
```bash
npm install -D gh-pages
```

Добавьте в `package.json`:
```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

```bash
npm run build
npm run deploy
```

---

## 4️⃣ Собственный сервер (VPS)

### Через SSH + Nginx:
```bash
# На локальной машине
npm run build
scp -r dist/* user@your-server.com:/var/www/neuro-crosspost/

# На сервере
sudo nano /etc/nginx/sites-available/neuro-crosspost
```

### Nginx конфигурация:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/neuro-crosspost;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/neuro-crosspost /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5️⃣ Cloudflare Pages

1. Перейдите на [pages.cloudflare.com](https://pages.cloudflare.com)
2. "Create a project" → "Connect to Git"
3. Выберите репозиторий
4. Build settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output: `dist`

---

## ✅ После деплоя

Ваша админ-панель будет доступна по URL, который предоставит платформа.

Для продакшена рекомендуется:
- Настроить HTTPS (большинство платформ делают это автоматически)
- Добавить домен (опционально)
- Настроить переменные окружения для API ключей (если подключите бэкенд)

---

## 🔧 Локальный превью

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

---

## 📦 Структура сборки

```
dist/
├── index.html          (3.22 kB)
├── assets/
│   ├── index-*.css     (34.05 kB)
│   └── index-*.js      (321.76 kB)
```

Общий размер: ~358 kB (gzip: ~105 kB)
