# Job Board Portal — Free Deployment Guide

Complete step-by-step guide to deploy the full-stack Django + React application for free.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   Render          │────▶│   Neon          │
│   (React/Vite)  │     │   (Django)        │     │   (PostgreSQL)  │
│   Free tier     │     │   Free tier       │     │   Free tier     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌──────────────────┐
                        │   Cloudinary      │
                        │   (Media files)   │
                        │   Free tier       │
                        └──────────────────┘
```

---

## Step 1: Database — Neon (PostgreSQL)

1. Go to [neon.tech](https://neon.tech) and sign up (GitHub/Google)
2. Click **Create Project**
3. Name it `jobboard`, leave region as default (US East)
4. Copy the **Connection string** (Pooled mode, looks like):
   ```
   postgresql://neondb_owner:password@ep-xxx-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
5. This is your `DATABASE_URL` — save it for Step 3

---

## Step 2: Media Storage — Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) and sign up
2. From the Dashboard, copy these 3 values:
   - **Cloud Name** (e.g., `dxxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (click "Reveal" to see)
3. Save all three for Step 3

---

## Step 3: Email — Resend (free 3,000 emails/month)

1. Go to [resend.com](https://resend.com) and sign up
2. Go to **API Keys** → Create a key
3. Copy the key (starts with `re_`)
4. Verify your domain (optional but recommended for production)

---

## Step 4: Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Application type: **Web application**
6. Add these **Authorized redirect URIs**:
   ```
   https://your-backend.onrender.com/api/v1/auth/google/
   http://localhost:8000/api/v1/auth/google/  (for local testing)
   ```
7. Copy the **Client ID**

---

## Step 5: Deploy Backend — Render

### Option A: One-Click Deploy (using render.yaml)

1. Push your entire project to GitHub
2. Go to [render.com](https://render.com) → **New +** → **Blueprint**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` and creates the service

### Option B: Manual Deploy (recommended for control)

1. Push your entire project to GitHub
2. Go to [render.com](https://render.com) → **New +** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `jobboard-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements/base.txt -r requirements/production.txt
     ```
   - **Start Command**:
     ```bash
     python manage.py collectstatic --noinput && python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
     ```
   - **Plan**: Free

5. Add **Environment Variables**:

| Variable | Value |
|----------|-------|
| `DJANGO_SETTINGS_MODULE` | `config.settings.production` |
| `DJANGO_SECRET_KEY` | Click "Generate" |
| `DATABASE_URL` | Your Neon connection string from Step 1 |
| `ALLOWED_HOSTS` | `your-backend.onrender.com` (Render will fill in) |
| `FRONTEND_URL` | Your Vercel URL (from Step 6) |
| `GOOGLE_CLIENT_ID` | From Step 4 |
| `RESEND_API_KEY` | From Step 3 |
| `RESEND_FROM_EMAIL` | `noreply@yourdomain.com` |
| `RESEND_FROM_NAME` | `JobBoard` |
| `CLOUDINARY_CLOUD_NAME` | From Step 2 |
| `CLOUDINARY_API_KEY` | From Step 2 |
| `CLOUDINARY_API_SECRET` | From Step 2 |
| `CORS_ALLOWED_ORIGINS` | Your Vercel URL (from Step 6) |
| `REDIS_URL` | Upstash Redis URL (see below) |
| `CELERY_BROKER_URL` | Upstash Redis URL + `/1` |
| `CHANNEL_LAYERS_REDIS_URL` | Upstash Redis URL + `/2` |

6. Click **Create Web Service**

---

## Step 5b: Redis — Upstash (free 10,000 commands/day)

Render's free tier doesn't include Redis. Use Upstash:

1. Go to [upstash.com](https://upstash.com) and sign up
2. Click **Create Database**
3. Name it `jobboard-redis`, region: same as Render
4. Copy the connection URL (looks like `redis://default:password@xxx.upstash.io:6379`)
5. Add to Render env vars as `REDIS_URL`
6. For `CELERY_BROKER_URL`, append `/1`
7. For `CHANNEL_LAYERS_REDIS_URL`, append `/2`

> **Note:** On the free tier, Redis sleeps after inactivity. If you don't need real-time notifications or background tasks, you can skip Redis by using `locmem` cache and synchronous Celery (`CELERY_TASK_ALWAYS_EAGER = True`).

---

## Step 6: Deploy Frontend — Vercel

1. Push your entire project to GitHub (separate repo or same monorepo)
2. Go to [vercel.com](https://vercel.com) and sign up (GitHub)
3. Click **Add New... → Project**
4. Import your GitHub repo
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add **Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | From Step 4 |
| `VITE_WS_ENABLED` | `false` (WS not supported on Render free tier) |
| `VITE_SITE_URL` | `https://your-frontend.vercel.app` |
| `VITE_EMAILJS_SERVICE_ID` | Your EmailJS service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | Your EmailJS template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | Your EmailJS public key |

7. Click **Deploy**
8. Copy your deployment URL (e.g., `https://jobboard-portal.vercel.app`)
9. Add this URL to Render's `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` env vars

---

## Step 7: Create Superuser

After the backend deploys:

1. Go to your Render dashboard → **Shell** tab
2. Run:
   ```bash
   python manage.py createsuperuser
   ```
3. Enter email, username, and password

---

## Step 8: Verify Deployment

| Check | URL | Expected |
|-------|-----|----------|
| Backend health | `https://your-backend.onrender.com/api/v1/health/` | `{"status": "ok"}` |
| Admin panel | `https://your-backend.onrender.com/admin/` | Django admin login |
| Frontend | `https://your-frontend.vercel.app` | Job board homepage |
| API docs | `https://your-backend.onrender.com/api/v1/schema/swagger-ui/` | Swagger UI |

---

## Important Notes

### Free Tier Limitations

| Service | Limitation | Workaround |
|---------|-----------|------------|
| **Render** | Spins down after 15min inactivity | First request takes 30-50s |
| **Neon** | Compute scales to zero | First query after idle takes 2-3s |
| **Vercel** | 100GB bandwidth/month | Sufficient for hobby projects |
| **Cloudinary** | 25GB storage, 25GB bandwidth/month | Generous for resumes/avatars |
| **Upstash Redis** | 10,000 commands/day | Sufficient for low traffic |
| **Resend** | 3,000 emails/month | Sufficient for low traffic |

### WebSocket Limitation

Render's free tier does **not** support WebSockets. Real-time notifications will fall back to polling. Set `VITE_WS_ENABLED=false` on the frontend.

### Celery Workers

Celery workers require a paid plan on Render. For the free tier, background tasks will not run automatically. The app will still work — email notifications and job expiry will be delayed until manually triggered.

---

## Troubleshooting

### "DATABASE_URL is not set"
Make sure the `DATABASE_URL` env var is set in Render's dashboard. Copy it from Neon.

### "CORS error" on frontend
1. Add your Vercel URL to `CORS_ALLOWED_ORIGINS` in Render
2. Add your Vercel URL to `CSRF_TRUSTED_ORIGINS` in Render
3. Redeploy the backend

### "Media upload fails"
Check Cloudinary credentials in Render env vars. Test with:
```python
python manage.py shell
>>> import cloudinary
>>> cloudinary.config().cloud_name
'your_cloud_name'
```

### "Static files 404"
Run `python manage.py collectstatic --noinput` in Render's shell. WhiteNoise should serve them automatically.

---

## Optional: Custom Domain

### Backend (Render)
1. Go to Settings → **Custom Domains**
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update DNS with the CNAME Record shown by Render

### Frontend (Vercel)
1. Go to Settings → **Domains**
2. Add your domain (e.g., `yourdomain.com`)
3. Follow Vercel's DNS instructions

### Update CORS
After adding custom domains, update:
- `ALLOWED_HOSTS` in Render
- `CORS_ALLOWED_ORIGINS` in Render
- `CSRF_TRUSTED_ORIGINS` in Render
- `VITE_API_URL` in Vercel
