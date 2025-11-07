# MedApp Platform

MedApp delivers a Damumed-inspired digital healthcare experience for Kazakhstan. Doctors and patients get dedicated accounts, secure appointment workflows, educational video streaming, and AI-assisted symptom triage. The stack spans Go (Gin + GORM + PostgreSQL) for the API, React + Mantine for the web portal, an Expo/React Native mobile app, and a FastAPI microservice for ML predictions.

## Highlights

- **Doctor & patient portals** – role-based dashboards, profile onboarding, appointment scheduling, and condition tracking.
- **Video library** – authenticated creators upload medical videos; the public landing page showcases featured content.
- **AI triage** – FastAPI service scores symptom submissions; backend exposes `/api/ml/symptoms` for web and mobile clients.
- **Unified auth** – JWT-secured login/register flows, profile hydration, and `Authorization` middleware in Go.
- **Production-ready infra** – Dockerized services, Postgres migrations via GORM auto-migrate, ML client integration, and Expo config for mobile.

## Project Structure

```text
backend/            Go API (Gin, GORM, JWT, PostgreSQL)
frontend/           React + Vite + Mantine web client
mobile/             Expo / React Native mobile app
ml_service/         FastAPI microservice for symptom scoring
docker-compose.yml  Local orchestration (Postgres, backend, frontend, ML service)
```

## Backend (Go)

- `internal/models` – domain models (users, profiles, videos, appointments).
- `internal/api` – route modules for auth, appointments, videos, ML proxy, doctors list, etc.
- `internal/auth` – password hashing, JWT generation, auth service.
- `internal/db` – Postgres connection pooling + auto migrations.
- `internal/mlclient` – lightweight HTTP client talking to FastAPI service.

### Environment

| Variable        | Default          | Description                  |
|-----------------|------------------|------------------------------|
| `DB_HOST`       | `localhost`      | PostgreSQL host              |
| `DB_USER`       | `postgres`       | PostgreSQL user              |
| `DB_PASSWORD`   | `password`       | PostgreSQL password          |
| `DB_NAME`       | `medapp`         | PostgreSQL database          |
| `DB_PORT`       | `5432`           | PostgreSQL port              |
| `JWT_SECRET`    | _required_       | JWT signing secret           |
| `JWT_EXPIRES_IN`| `24h`            | Access token TTL             |
| `ML_SERVICE_URL`| `http://ml_service:8000` | FastAPI service URL |

Run locally:

```bash
cd backend
go run ./cmd/server
```

## Frontend (React + Mantine)

- Modern landing page with hero, feature highlights, testimonials, and video gallery.
- Auth pages, doctor & patient dashboards, appointment management, AI symptom checker.
- React Query for data fetching, Axios with JWT interceptors, Mantine design system.

Local dev:

```bash
cd frontend
npm install
npm run dev
```

Configure environment variables via `VITE_API_URL` (defaults to `http://localhost:8080/api`) and `VITE_UPLOAD_URL` (`http://localhost:8080`).

## Mobile App (Expo / React Native)

- Shared auth with backend (JWT + AsyncStorage persistence).
- Bottom tab navigations for doctor and patient personas.
- Video playback (expo-av), appointment helpers, doctor directory.
- React Native Paper theme for a polished UI.

Usage:

```bash
cd mobile
npm install
npm start
```

Adjust backend endpoints with `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_UPLOAD_URL` for real deployments.

## ML Service (FastAPI)

- `/predict/` route computes a logistic risk score from fever/cough/headache features.
- Easily extendable to load persisted scikit-learn / PyTorch models.

Run:

```bash
cd ml_service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Docker Compose

Spin everything locally (API, frontend, ML, Postgres):

```bash
docker-compose up --build
```

The mobile app typically runs outside Compose (Expo CLI) but a `mobile/Dockerfile` is included for containerized workflows.

## Next Steps

- Extend appointment APIs for prescriptions & chat.
- Harden validations and add automated tests.
- Integrate push notifications for mobile check-ins.
- Add CI/CD (GitHub Actions) and infrastructure as code for cloud deployment.

MedApp is ready to evolve into a national-grade telemedicine hub—customize the modules to match clinic needs, regulations, and future AI capabilities.