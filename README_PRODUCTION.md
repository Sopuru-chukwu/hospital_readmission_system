# DiaPredict.AI – Production Deployment & Operations Manual

This guide provides step-by-step instructions for deploying **DiaPredict.AI** into production environments, including hospital servers, private cloud instances (AWS, GCP, Azure), or local hospital Docker infrastructure.

---

## 🏗️ Production Architecture Overview

The system runs as a multi-container Docker stack orchestrated via Docker Compose:

1. **Frontend**: Nginx web server serving compiled React 19 assets with Gzip compression, SPA fallback routing, and security headers.
2. **Backend**: FastAPI app running on Gunicorn WSGI server with multiple Uvicorn workers and security headers middleware.
3. **Database**: PostgreSQL 16 container with persistent volumes and healthchecks.
4. **ML Inference Engine**: Soft-Voting Ensemble model (`HistGradientBoostingClassifier` + `RandomForestClassifier`) loaded into memory for real-time inference (ROC-AUC: 0.9110).

---

## 🚀 Step-by-Step Deployment Instructions

### 1. Prerequisites
Ensure the target deployment server has the following installed:
- **Docker Engine** (v24.0+)
- **Docker Compose** (v2.20+)
- Minimum Server Specs: **2 vCPU, 4GB RAM, 20GB SSD**

### 2. Clone & Environment Configuration
```bash
# Clone project repo
git clone https://github.com/your-org/hospital_readmission_system.git
cd hospital_readmission_system

# Copy production environment template
cp .env.production.example .env
```

Edit `.env` and set secure credentials:
```bash
SECRET_KEY=$(openssl rand -hex 32)
POSTGRES_PASSWORD=YourStrongDatabasePassword123!
```

### 3. Build & Launch Docker Stack
```bash
docker compose up -d --build
```

### 4. Verify System Health
Check container logs and health statuses:
```bash
docker compose ps
docker compose logs -f backend
```

Access the application in your browser:
- **Web App**: `http://<your-server-ip>`
- **API Health**: `http://<your-server-ip>/api/v1/health`
- **Swagger Docs**: `http://<your-server-ip>:8000/docs`

---

## 🛡️ NDPR & HIPAA Compliance Checklist

- [x] **JWT Token Authentication**: Secure password hashing with bcrypt + JWT token expiration.
- [x] **HTTP Security Headers**: HSTS, CSP, X-Frame-Options (`DENY`), and X-Content-Type-Options (`nosniff`).
- [x] **Non-Root Docker Containers**: Backend runs under unprivileged `appuser` (UID 1000).
- [x] **Persistent DB Storage**: Database records saved safely in named Docker volume `postgres_data`.
- [x] **CORS Lockdown**: Restrict API calls to explicit hospital domain origins in `.env`.

---

## 🔄 Backup & Recovery Procedures

### Database Backup (PostgreSQL Dump)
```bash
docker exec -t diapredict_postgres pg_dump -U postgres hospital_readmission > backup_$(date +%F).sql
```

### Database Restore
```bash
cat backup_YYYY-MM-DD.sql | docker exec -i diapredict_postgres psql -U postgres -d hospital_readmission
```
