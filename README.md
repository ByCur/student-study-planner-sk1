# TaskNotes Cloud — Final Exam Project

## 1. Description of the application

TaskNotes Cloud is a small web application for saving tasks and study notes.  
The user can create, list, mark as completed and delete notes. Each note has a title, description and priority.

The application is useful for students who want to organize work for seminars, exams or small projects.

## 2. Cloud and architecture used

The proposed public cloud is **Render**.

The application has three main components:

1. **Frontend container**  
   - React + Vite application.
   - Served by Nginx.
   - Public HTTPS URL.

2. **Backend container**  
   - Node.js + Express REST API.
   - Provides endpoints under `/api/notes`.
   - Has a `/health` endpoint for health checks.
   - Logs HTTP access requests with Morgan.

3. **PostgreSQL database**  
   - Managed Render Postgres database.
   - Stores persistent notes data.
   - Data remains available after backend restart or redeploy.

Communication:

- Browser → Frontend over HTTPS.
- Frontend → Backend API over HTTPS.
- Backend → PostgreSQL using the `DATABASE_URL` environment variable.

## 3. Docker / cloud objects

Local objects:

- `frontend` service
- `backend` service
- `db` service
- `postgres_data` persistent volume

Cloud objects in `render.yaml`:

- `tasknotes-frontend`: Docker web service
- `tasknotes-backend`: Docker web service
- `tasknotes-db`: Render Postgres database

## 4. Uploaded files and their content

- `render.yaml` — Infrastructure as Code configuration for Render.
- `docker-compose.yml` — local three-container version for testing.
- `prepare-app.sh` — prepares and tests the application locally; also gives deployment instructions.
- `remove-app.sh` — removes local containers and local persistent volume.
- `backend/Dockerfile` — builds the backend container.
- `backend/src/server.js` — Express backend API and database initialization.
- `backend/src/backup.js` — exports notes to a JSON backup.
- `frontend/Dockerfile` — builds React frontend and serves it through Nginx.
- `frontend/src/main.jsx` — React user interface.
- `frontend/src/styles.css` — visual styling.
- `scripts/backup-local.sh` — local PostgreSQL backup script.
- `scripts/logs-local.sh` — local backend log viewer.

## 5. Configuration

The application is configurable using environment variables:

Backend:

- `DATABASE_URL` — PostgreSQL connection string.
- `CORS_ORIGIN` — allowed frontend origins.
- `PORT` — backend port.
- `NODE_ENV` — production/development mode.

Frontend:

- `VITE_API_URL` — public URL of the backend API.

Secrets are not stored in Git. The database connection string is injected by Render from the managed database.

## 6. How to run locally

Requirements:

- Docker
- Docker Compose
- Git
- Bash terminal

Run:

```bash
chmod +x prepare-app.sh remove-app.sh scripts/*.sh
./prepare-app.sh
```

Open:

- Frontend: `http://localhost:8080`
- Backend health: `http://localhost:10000/health`

## 7. How to deploy to the public cloud

1. Upload the `sk1` directory to Git.
2. Make sure `render.yaml` is in the repository root or configure the correct Blueprint path.
3. Create a Render Blueprint from `render.yaml`.
4. Render will create:
   - frontend service
   - backend service
   - PostgreSQL database
5. After the backend is deployed, copy the backend public URL.
6. Set the frontend environment variable:

```text
VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com
```

7. Redeploy the frontend.
8. Open the frontend HTTPS URL in the browser.

## 8. How to use the application

1. Open the public frontend URL in a browser.
2. Write a title and details.
3. Select priority.
4. Click **Add note**.
5. Mark notes as completed or delete them.

## 9. Backup instructions

Local backup:

```bash
./scripts/backup-local.sh
```

This creates a SQL dump in the `backups/` directory.

Backend JSON export:

```bash
cd backend
DATABASE_URL="your_database_url" npm run backup
```

Cloud backup:

- Use Render Postgres backup/export options, or connect with `pg_dump` using the external database URL.
- Example:

```bash
pg_dump "$DATABASE_URL" > tasknotes-cloud-backup.sql
```

## 10. Access logs from the internet

Local logs:

```bash
./scripts/logs-local.sh
```

Cloud logs:

- Open the backend service logs in Render, or use the Render CLI if configured.
- The backend uses Morgan with `combined` format, so it logs IP, method, URL, status code, response time and user agent.

## 11. Conditions for scripts

`prepare-app.sh` can be run when:

- Docker is installed.
- Docker Compose is available.
- Ports `8080`, `10000` and `5432` are free.
- The user is in the project root directory.

`remove-app.sh` can be run when:

- Docker is installed.
- The local containers were created with Docker Compose.

## 12. Cost analysis for one year

Assumption:

- 1000 users per day.
- Database/file size: 50 GB.
- Small educational application.
- Two small web services and one PostgreSQL database.

Example Render estimate:

- Frontend web service: Free or Starter. For production estimate, Starter: 7 USD/month.
- Backend web service: Starter: 7 USD/month.
- PostgreSQL Basic-256mb: 6 USD/month.
- PostgreSQL storage: 50 GB × 0.30 USD/GB/month = 15 USD/month.
- Total monthly estimate: 7 + 7 + 6 + 15 = 35 USD/month.
- Total yearly estimate: 35 × 12 = 420 USD/year.

This is an approximate educational estimate. Real cost depends on traffic, bandwidth, region, scaling and selected plans.

## 13. External resources and generative AI use

External resources used:

- Render documentation for Blueprints, Docker web services, environment variables, HTTPS and PostgreSQL.
- Docker documentation for Dockerfiles and Docker Compose.
- PostgreSQL documentation for database concepts and backup using `pg_dump`.

Generative AI use:

- ChatGPT was used to help design the structure of the project, generate example configuration files, improve documentation and prepare defense explanations.
- The final implementation was reviewed and adapted for this exam project.

## 14. Defense summary

Short explanation:

> My project is TaskNotes Cloud, a web application for students to save tasks and study notes. It has a React frontend, a Node.js backend and a PostgreSQL database. The deployment is defined in configuration files, mainly `render.yaml` and Dockerfiles. The app is publicly accessible using HTTPS, stores data persistently in PostgreSQL, restarts automatically in the cloud, and can be backed up with `pg_dump`.

Important points to mention:

- Three components: frontend, backend, database.
- HTTPS certificate is provided by Render.
- Secrets are environment variables, not committed to Git.
- Database is persistent.
- Backend health check is `/health`.
- Logs can be viewed in Render.
- Backup can be done with `pg_dump`.
- Local testing is possible with Docker Compose.
