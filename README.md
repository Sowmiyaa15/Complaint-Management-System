# Complaint Management System (CMS) — Full-Stack Enterprise Platform

A production-grade, enterprise Full-Stack Municipal Grievance Redressal and Complaint Management System designed and built according to the complete Software Requirements Specification (SRS).

---

## 🏗 System Architecture

```
React (Vite + Tailwind CSS + Chart.js + Lucide)  [Port 3000 / 5173]
                    │ (Axios REST + JWT Bearer Auth)
                    ▼
Spring Boot 3.2.5 REST API (Java 17)             [Port 8080]
  ├── Spring Security + JJWT 0.12.5 (Stateless Authentication & RBAC)
  ├── Spring Data JPA / Hibernate (Relational ORM & Aggregation Queries)
  ├── Global Exception Handler (RFC 7807 Compliant JSON Errors)
  └── SpringDoc OpenAPI 3.0 / Swagger UI
                    │
                    ▼
MySQL 8.0 Database                               [Port 3306 / 3307]
  ├── users (Admins, Employees, Citizens with BCrypt hashing)
  ├── complaints (Full lifecycle states: PENDING → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED)
  ├── complaint_updates (Public status audit trail and private staff notes)
  ├── attachments (Multipart file metadata and secure file storage)
  └── notifications (In-app notifications and unread badge counters)
```

---

## 🔑 Demo User Accounts

| Role | Name | Email | Password | Allowed Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | System Admin | `admin@example.com` | `Admin@123` | Full system control, assign officers, manage all users, edit/delete complaints, analytics & CSV export |
| **EMPLOYEE** | Officer Sarah Jenkins | `emp1@example.com` | `Employee@123` | Process assigned queue, update lifecycle status, write public comments and private internal staff notes |
| **EMPLOYEE** | Officer David Ross | `emp2@example.com` | `Employee@123` | Process assigned queue, update lifecycle status, internal notes |
| **CITIZEN** | Alice Johnson | `citizen1@example.com` | `Citizen@123` | File complaints with file attachments, monitor status stepper, review public progress |
| **CITIZEN** | Mark Vance | `citizen2@example.com` | `Citizen@123` | File complaints, track grievances |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Java**: OpenJDK 17 or higher (`java -version`)
- **Maven**: 3.8+ (`mvn -version`)
- **Node.js**: Node 18+ and npm (`node -v`, `npm -v`)
- **MySQL**: 8.0 Server running on `localhost:3306` (or `3307`)

### 1. Database Initialization
1. Ensure your local MySQL server is running.
2. The database schema and demo data can be seeded using `database/schema.sql` and `database/seed.sql`:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS complaint_management_system;"
   mysql -u root -p complaint_management_system < database/schema.sql
   mysql -u root -p complaint_management_system < database/seed.sql
   ```
*(Note: Spring Boot's built-in `TestDataInitializer` also verifies and auto-seeds all demo accounts on startup if the database is fresh).*

### 2. Backend Startup (Spring Boot)
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Build and run the service:
   ```bash
   mvn spring-boot:run
   ```
3. Backend will start listening on `http://localhost:8080`.
4. Interactive Swagger API documentation: `http://localhost:8080/swagger-ui.html`

### 3. Frontend Startup (React Vite)
1. In a new terminal, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:5173` (or `http://localhost:3000`).

---

## 🐳 Docker Deployment

The application is fully containerized with multi-stage `Dockerfile`s and `docker-compose.yml`:

```bash
# Build and run the entire stack (Database + Backend + Frontend)
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- MySQL: Port 3306

---

## 🧪 Comprehensive Testing & Verification

### Running Automated Integration Tests
The backend includes an automated suite covering JWT authentication, complaint lifecycle state transitions, and RBAC endpoint gating:

```bash
cd backend
mvn clean test
```

### Verified Test Cases:
1. `AuthIntegrationTest`:
   - Valid credentials login returns valid JWT token and user details
   - Invalid password returns HTTP 401 Unauthorized
   - User registration creates user with BCrypt hashed password
   - Duplicate email registration returns HTTP 409 Conflict
   - `/api/auth/me` returns authenticated user details
2. `ComplaintLifecycleIntegrationTest`:
   - Citizen submits grievance with status `PENDING`
   - Admin assigns complaint to employee (`PENDING` -> `ASSIGNED`)
   - Assigned employee transitions status to `IN_PROGRESS`
   - Employee completes grievance (`RESOLVED` with timestamp)
   - Admin or officer finalizes complaint to `CLOSED`
   - Complete audit trail and notifications persisted in MySQL
3. `RbacSecurityIntegrationTest`:
   - Unauthenticated requests to secured endpoints return HTTP 401
   - Citizen attempting administrative actions returns HTTP 403 Forbidden
   - Employee accessing user management returns HTTP 403 Forbidden
   - Citizen accessing internal staff notes is blocked (HTTP 403)
   - Citizen cannot view complaints filed by other citizens

---

## 📡 Key REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticate and receive JWT
- `POST /api/auth/register` — Register a new citizen account
- `GET /api/auth/me` — Inspect current session

### Complaints (`/api/complaints`)
- `POST /api/complaints` — Submit complaint with multipart file attachments
- `GET /api/complaints` — List complaints with pagination, filtering, and search (Admin)
- `GET /api/complaints/my` — List complaints submitted by logged-in citizen
- `GET /api/complaints/assigned` — List complaints assigned to logged-in employee
- `GET /api/complaints/{id}` — Get complaint details, stepper, and attachments
- `PUT /api/complaints/{id}` — Update complaint title, description, category (Admin)
- `PUT /api/complaints/{id}/assign` — Assign complaint to an employee (Admin)
- `PUT /api/complaints/{id}/status` — Transition status with comment (Employee/Admin)
- `POST /api/complaints/{id}/notes` — Add confidential internal note (Employee/Admin)
- `DELETE /api/complaints/{id}` — Delete complaint (Admin)

### User Management (`/api/users`)
- `GET /api/users` — List users with search and role filter (Admin)
- `GET /api/users/employees` — List all active employees (Admin)
- `POST /api/users` — Create employee or admin user (Admin)
- `GET /api/users/{id}` — Get user details (Admin)
- `PUT /api/users/{id}` — Update user details and role (Admin)
- `DELETE /api/users/{id}` — Delete user (Admin)

### Reports & Analytics (`/api/reports`)
- `GET /api/reports/kpis` — Overall system counts and avg resolution time (Admin)
- `GET /api/reports/status-breakdown` — Counts per status (Admin)
- `GET /api/reports/category-distribution` — Counts per category (Admin)
- `GET /api/reports/trends` — Daily submission volume (Admin)
- `GET /api/reports/employee-performance` — Resolved counts per officer (Admin)
- `GET /api/reports/export-csv` — Export filtered complaints to CSV (Admin)

### Notifications (`/api/notifications`)
- `GET /api/notifications` — List user notifications
- `GET /api/notifications/unread-count` — Real-time unread badge count
- `PUT /api/notifications/{id}/read` — Mark notification as read
- `PUT /api/notifications/mark-all-read` — Mark all notifications as read

---

## 🔒 Security & Privacy Rules
- Passwords hashed with BCrypt (strength 10).
- Stateless JWT authentication with expiration.
- Cross-Site Scripting (XSS) and SQL Injection prevention via JPA Parameterized Queries and entity validation.
- Path traversal protection on file upload and download endpoints.
- **Internal Staff Notes Confidentiality**: Internal notes are filtered server-side in DTO responses and are never exposed to Citizen clients.
