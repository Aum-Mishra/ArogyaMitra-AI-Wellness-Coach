# Deployment & Production Guide

Complete guide for deploying ArogyaMitra to production environments.

---

## 🚀 Production Deployment

### Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                Production Environment                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┐         ┌──────────────────────┐   │
│  │  React Frontend │◄────────│ Nginx/Vercel        │   │
│  │  (Built SPA)    │         │ CDN & Static Files  │   │
│  └────────┬────────┘         └──────────────────────┘   │
│           │ (HTTPS)                                      │
│           │                                              │
│  ┌────────▼────────────────────────────────────────────┐ │
│  │  FastAPI Backend (Gunicorn/Uvicorn)                │ │
│  │  - Load balanced across 2+ instances               │ │
│  │  - Running behind Nginx reverse proxy              │ │
│  │  - Health check endpoints                          │ │
│  └────────┬─────────────────────────────────────────┬─│
│           │                                          │ │
│  ┌────────▼──────────────────┐  ┌────────────────────┘ │
│  │ PostgreSQL Database       │  │                       │
│  │ - Production instance     │  │ External Services:  │
│  │ - Automated backups       │  │ - Groq API          │
│  │ - Read replicas           │  │ - Email service     │
│  └───────────────────────────┘  │ - Logging           │
│                                  │ - Monitoring        │
│                                  └─────────────────────│
│                                                         │
└──────────────────────────────────────────────────────────┘
```

---

## 🐳 Docker Deployment

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY app/ ./app/
COPY README_SETUP.md .env.example ./

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run with gunicorn in production
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "-k", "uvicorn.workers.UvicornWorker", "app.main:app"]
```

### Frontend Dockerfile

```dockerfile
# UI Health/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: arogyamitra
      POSTGRES_USER: arogyauser
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U arogyauser"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://arogyauser:${DB_PASSWORD}@postgres:5432/arogyamitra
      GROQ_API_KEY: ${GROQ_API_KEY}
      SECRET_KEY: ${SECRET_KEY}
      DEBUG: "False"
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend:/app

  frontend:
    build: ./UI\ Health
    environment:
      VITE_API_URL: http://backend:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

---

## ☁️ Cloud Deployment Options

### Option 1: AWS EC2 + RDS

```bash
# 1. Create EC2 instance (Ubuntu 22.04, t3.medium)
# 2. Install dependencies
sudo apt-get update
sudo apt-get install -y python3 python3-pip postgresql-client nginx

# 3. Clone project
git clone <repository>
cd backend

# 4. Setup environment
cp .env.example .env
# Edit .env with RDS endpoint

# 5. Install Python packages
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 6. Start with supervisor
sudo apt-get install supervisor

# /etc/supervisor/conf.d/arogyamitra.conf
[program:arogyamitra]
directory=/home/ubuntu/arogyamitra/backend
command=/home/ubuntu/arogyamitra/backend/venv/bin/gunicorn \
    -w 4 -b 127.0.0.1:8000 -k uvicorn.workers.UvicornWorker app.main:app
autostart=true
autorestart=true

# 7. Nginx configuration
# /etc/nginx/sites-available/arogyamitra
upstream apiserver {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name api.arogyamitra.com;

    location / {
        proxy_pass http://apiserver;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/arogyamitra /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### Option 2: Heroku

```bash
# 1. Create Heroku app
heroku create arogyamitra

# 2. Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# 3. Set environment variables
heroku config:set GROQ_API_KEY=your_key
heroku config:set SECRET_KEY=your_secret

# 4. Create Procfile
# Procfile
web: gunicorn -w 4 -b 0.0.0.0:$PORT -k uvicorn.workers.UvicornWorker app.main:app

# 5. Deploy
git push heroku main

# 6. Run migrations (if needed)
heroku run python -m alembic upgrade head
```

### Option 3: Railway

```bash
# 1. Connect GitHub repository
# 2. Add PostgreSQL plugin
# 3. Set environment variables in dashboard
# 4. Deploy - automatic on push
```

### Option 4: DigitalOcean App Platform

```yaml
# app.yaml
services:
  - name: api
    github:
      repo: your-repo
      branch: main
    build_command: pip install -r requirements.txt
    run_command: gunicorn -w 4 -b 0.0.0.0:8080 -k uvicorn.workers.UvicornWorker app.main:app
    http_port: 8080
    envs:
      - key: DATABASE_URL
        scope: RUN_AND_BUILD_TIME
        value: ${db.connection_string}
  
  - name: web
    github:
      repo: your-repo
      branch: main
      source_dir: "UI Health"
    build_command: npm install && npm run build
    run_command: npm install -g serve && serve -s dist -l 3000
    http_port: 3000

databases:
  - name: db
    engine: PG
    version: "15"
```

---

## 🔧 Production Configuration

### Backend Production Settings

```python
# app/config.py (Production)
import os

class ProductionSettings:
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    # JWT
    SECRET_KEY = os.getenv("SECRET_KEY")  # Long random string
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60
    
    # CORS - restricted origins
    ALLOWED_ORIGINS = [
        "https://arogyamitra.com",
        "https://www.arogyamitra.com",
        "https://app.arogyamitra.com"
    ]
    
    # API
    API_HOST = "0.0.0.0"
    API_PORT = 8000
    DEBUG = False
    
    # Groq
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
```

### Gunicorn Configuration

```bash
# gunicorn_config.py
import multiprocessing

bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/arogyamitra
upstream backend {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
    keepalive 32;
}

server {
    listen 80;
    server_name arogyamitra.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name arogyamitra.com www.arogyamitra.com;

    ssl_certificate /etc/letsencrypt/live/arogyamitra.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/arogyamitra.com/privkey.pem;

    client_max_body_size 10M;

    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Frontend
    location / {
        root /var/www/arogyamitra;
        try_files $uri /index.html;
    }
}
```

---

## 📊 Monitoring & Logging

### Application Monitoring with New Relic

```python
# app/main.py
import newrelic.agent

newrelic.agent.initialize('newrelic.ini')

from fastapi import FastAPI
app = FastAPI()
app = newrelic.agent.wsgi_application()(app)
```

### Logging Configuration

```python
# app/logging_config.py
import logging
import logging.handlers

# Create logger
logger = logging.getLogger("arogyamitra")
logger.setLevel(logging.INFO)

# File handler (rotates daily)
handler = logging.handlers.TimedRotatingFileHandler(
    'logs/app.log',
    when="midnight",
    interval=1
)

# Formatter
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
handler.setFormatter(formatter)

logger.addHandler(handler)
```

### Database Monitoring

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('arogyamitra'));

-- Check slow queries
SET log_min_duration_statement = 1000;

-- Monitor connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'arogyamitra';
```

---

## 🔐 Security in Production

### Environment Variables
```bash
# Never commit .env to git
# Store securely in:
# - Environment variable management (AWS Secrets Manager)
# - Cloud platform settings
# - Secret management service (HashiCorp Vault)

# For GitHub Actions:
secrets:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
  SECRET_KEY: ${{ secrets.SECRET_KEY }}
```

### HTTPS/SSL

```bash
# Use Let's Encrypt for free SSL
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d arogyamitra.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Database Security

```sql
-- Create read-only user for app
CREATE USER app_user WITH PASSWORD 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- Limit connections
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET max_prepared_transactions = 25;
```

### API Rate Limiting

```python
# app/middleware/rate_limit.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/auth/login")
@limiter.limit("5/minute")
def login(request: Request, credentials: UserLogin):
    ...
```

---

## 🧪 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificate obtained
- [ ] CORS origins updated
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Team access configured
- [ ] Documentation updated

---

## 📈 Scaling Strategy

### Phase 1: Initial Launch
- Single backend instance
- Managed PostgreSQL
- Basic monitoring

### Phase 2: Growth
- Load balancer + 2-3 backend instances
- Database read replicas
- CDN for frontend
- Redis cache layer

### Phase 3: Scale
- Kubernetes orchestration
- Microservices architecture
- Advanced caching
- Dedicated AI inference server

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
      - name: Run tests
        run: |
          pytest backend/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
        run: |
          ssh -i $DEPLOY_KEY user@server "cd /app && git pull && ./deploy.sh"
```

---

## 📞 Support & Maintenance

### Daily Tasks
- Monitor application logs
- Check system resources
- Verify backups completed

### Weekly Tasks
- Review error rates
- Analyze performance metrics
- Check security updates

### Monthly Tasks
- Database optimization
- Capacity planning
- Security audit
- Team training

---

**Production deployment is ready! 🚀**
