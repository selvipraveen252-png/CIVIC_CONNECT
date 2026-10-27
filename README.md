# CivicConnect — Smart Civic Issue Reporting & Tracking Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node-emerald)](https://github.com)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org)
[![GIS Powered](https://img.shields.io/badge/GIS-Leaflet%20%2B%20OpenStreetMap-green)](https://leafletjs.com)
[![Docker Ready](https://img.shields.io/badge/Docker-Compose%20Ready-2496ED)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Academic Project First Review Edition**  
> Complete, production-grade, full-stack civic engagement and municipal issue lifecycle management application.

---

## 📌 1. Project Overview & Problem Statement

### The Civic Problem
In contemporary urban environments, citizens encounter broken road infrastructure, hazardous potholes, drinking water pipe bursts, open sewage backflows, uncollected garbage dumpsters, and broken streetlights daily. Existing channels (paper complaints, unstructured hotlines, or unmonitored email inboxes) suffer from:
- Lack of geographic precision (ambiguous verbal descriptions of locations).
- Complete opacity (citizens never know if a department received or inspected their issue).
- Disconnected departmental silos with no audit trail or accountability.
- Lack of photographic evidence and verification at resolution.

### The CivicConnect Solution
**CivicConnect** bridges citizens, municipal field officers, and city directors through a unified, transparent web portal:
1. **Citizens** pinpoint problems on an interactive GIS map using OpenStreetMap and GPS, upload photo evidence, and receive real-time notifications as repairs progress.
2. **Municipal Officers** verify issues, dispatch repair crews, upload post-resolution evidence, and provide official progress remarks.
3. **Administrators** monitor whole-city analytics, cross-departmental resolution rates, workload distribution, and geospatial heatmaps.

---

## 🏗️ 2. MERN Technology Stack & Architecture

CivicConnect is strictly engineered using the **MERN** stack with modern TypeScript and responsive styling:

| Layer | Technology | Role & Implementation Details |
|---|---|---|
| **Database (M)** | **MongoDB / MongoDB Atlas** | Primary NoSQL document store with Mongoose ORM, GeoJSON `Point` coordinates, and **`2dsphere` spatial indexing**. Includes automated in-memory MongoDB fallback for instant demonstration. |
| **Backend (E & N)** | **Express.js & Node.js** | RESTful API architecture, JWT authentication, bcrypt password hashing, Multer file processing, role guards, and centralized error handling. |
| **Frontend (R)** | **React.js & TypeScript** | Fast Vite bundler, React Router v6, Tailwind CSS design system, Lucide icons, and Recharts analytics. |
| **GIS Mapping** | **Leaflet & OpenStreetMap** | Real-time map picker, GPS auto-location, reverse geocoding lookup, and color-coded status pins. |
| **Caching / Cache Fallback** | **Redis (Optional)** | API & dashboard caching and rate limiting with graceful in-memory LRU fallback. |
| **Storage** | **Cloudinary / Local Disk** | Cloud-based image hosting with automatic local disk storage fallback (`server/uploads/`). |
| **DevOps** | **Docker & Docker Compose** | Multi-container setup orchestrating backend, frontend, MongoDB, and Redis. |

```
                       [ Citizen / Officer / Admin ]
                                     │
                                     ▼
                ┌─────────────────────────────────────────┐
                │   React + TypeScript Frontend (Vite)    │
                │  - Tailwind CSS Modern Glassmorphism    │
                │  - Leaflet GIS OpenStreetMap Engine     │
                │  - Recharts Visual Analytics            │
                └────────────────────┬────────────────────┘
                                     │ HTTP / REST / JWT
                                     ▼
                ┌─────────────────────────────────────────┐
                │       Express.js + Node.js Server       │
                │  - JWT Bearer Auth & Role Middleware   │
                │  - Multer / Cloudinary Image Pipeline   │
                │  - Redis / In-Memory Cache Service      │
                └────────────────────┬────────────────────┘
                                     │ Mongoose ODM
                                     ▼
                ┌─────────────────────────────────────────┐
                │      MongoDB / MongoDB Atlas Database   │
                │  - GeoJSON 2dsphere Spatial Indexing    │
                │  - Users, Issues, Depts, Notifications │
                │  - Audit History Event Streams          │
                └─────────────────────────────────────────┘
```

---

## 👥 3. User Roles & Capabilities

### 🟢 1. Citizen Role
- **Self-Registration & Authentication**: Secure sign-up, JWT login, and session preservation.
- **Report Issue**: Interactive Leaflet pin selection, automatic GPS detection, reverse-geocoded address suggestions, category selection, and photo upload.
- **My Reports Dashboard**: Real-time counter of submitted, pending, in-progress, and resolved complaints.
- **Live Status Timeline**: Visual 6-step progress tracker (`REPORTED` → `VERIFIED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`).
- **Reopen Mechanism**: If a repair was substandard, the citizen can reopen the ticket with remarks.
- **Notifications**: Automated alerts when an officer changes status or logs remarks.

### 🔵 2. Municipal Officer Role
- **Departmental Workspace**: Filter and view complaints under their specific jurisdiction (e.g., Public Works, Water Board, Solid Waste).
- **Metric Cards**: Assigned Issues, Pending Verification, In Progress, Resolved.
- **Operational Actions**:
  - `Verify`: Validate problem authenticity.
  - `Update Status`: Transition issue states (`IN_PROGRESS`, etc.) and append official audit remarks.
  - `Resolve`: Close out work with photographic resolution proof.

### 🟣 3. Administrator Role
- **Executive Analytics Dashboard**: Real-time charts of issues by category, priority, and status; resolution rate percentage; critical issue watchlists.
- **User Management**: Create, edit, inspect, and delete users; assign roles (`citizen`, `officer`, `admin`) and link officers to departments.
- **Department Management**: Add, update, and manage municipal agencies and emergency contact channels.
- **Global GIS Oversight**: View every civic issue pin across the city with multi-parameter filtering.

---

## 🔄 4. Complete Issue Lifecycle Workflow

```
[ CITIZEN ] ─────────► REPORTED
                           │
                      (Officer Inspects)
                           ▼
                       VERIFIED ─────────► [ REJECTED ] (e.g. Private Property)
                           │
                      (Crew Dispatched)
                           ▼
                       ASSIGNED
                           │
                      (Repairs Active)
                           ▼
                      IN_PROGRESS
                           │
                      (Work Finished + Photo Evidence)
                           ▼
                       RESOLVED ◄────────┐
                           │             │
                    (Citizen Audit)      │ (Citizen Reopens if unsatisfied)
                     /           \       │
                    ▼             ▼      │
                 CLOSED        REOPENED ─┘
```

---

## 📁 5. Project Folder Structure

```
CivicConnect/
├── docker-compose.yml              # Multi-container orchestration
├── package.json                    # Root workspace runner
├── README.md                       # Comprehensive documentation
│
├── server/                         # Express + Node.js API Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts               # MongoDB Atlas connection & embedded fallback
│   │   │   ├── redis.ts            # Optional Redis client with in-memory caching
│   │   │   └── cloudinary.ts       # Cloudinary credentials configuration
│   │   ├── controllers/
│   │   │   ├── authController.ts   # Register, login, profile
│   │   │   ├── issueController.ts  # CRUD, geospatial search, status workflow
│   │   │   ├── departmentController.ts # Department management
│   │   │   ├── userController.ts   # Admin user management
│   │   │   ├── notificationController.ts # Notification feeds
│   │   │   └── dashboardController.ts # Analytics aggregations
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT extraction & verification
│   │   │   ├── role.ts             # Role-based access control
│   │   │   ├── upload.ts           # Multer disk & cloud handler
│   │   │   ├── rateLimiter.ts      # Redis/Memory rate limiting
│   │   │   └── errorHandler.ts     # Global Mongoose error interceptor
│   │   ├── models/
│   │   │   ├── User.ts             # User schema with bcrypt pre-save
│   │   │   ├── Department.ts       # Municipal agency schema
│   │   │   ├── Issue.ts            # GeoJSON 2dsphere Point issue schema
│   │   │   └── Notification.ts     # In-app notification schema
│   │   ├── routes/                 # Express REST endpoint routers
│   │   ├── services/               # Caching and notification services
│   │   ├── tests/
│   │   │   └── api.test.ts         # Automated backend test suite
│   │   ├── utils/
│   │   │   ├── seed.ts             # Realistic demo data seeder
│   │   │   └── logger.ts           # Console formatting logger
│   │   ├── app.ts                  # Express application setup
│   │   └── server.ts               # Server startup & auto-seed trigger
│   ├── uploads/                    # Local storage fallback directory
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── client/                         # React + TypeScript Frontend
    ├── src/
    │   ├── components/             # Reusable UI components (Badges, MapView, Timeline, etc.)
    │   ├── context/                # AuthContext and NotificationContext
    │   ├── pages/                  # Landing, Login, Dashboards, GIS Map, Profile
    │   ├── services/               # Axios API client services
    │   ├── types/                  # TypeScript interface definitions
    │   ├── utils/                  # Status colors and date formatters
    │   ├── App.tsx                 # Routing table & layout
    │   ├── main.tsx                # React DOM entry
    │   └── index.css               # Tailwind CSS & Leaflet rules
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 🔑 6. Pre-Configured Demo Accounts

For academic review, testing, and demonstrations, the database includes preset accounts with realistic credentials. The login page also features **1-Click Instant Demo Login Buttons**:

| Role | Email | Password | Department / Notes |
|---|---|---|---|
| **Administrator** | `admin@civicconnect.com` | `Admin@123` | City Director (All administrative controls) |
| **Officer** | `officer@civicconnect.com` | `Officer@123` | Public Works Department (Roads & Potholes) |
| **Officer** | `water.officer@civicconnect.com` | `Officer@123` | Water Supply & Sewerage Board |
| **Officer** | `sanitation.officer@civicconnect.com` | `Officer@123` | Solid Waste Management Division |
| **Citizen** | `citizen@civicconnect.com` | `Citizen@123` | Primary reporting citizen account |
| **Citizen** | `jane.citizen@civicconnect.com` | `Citizen@123` | Secondary reporting citizen account |

*(All passwords also accept `Password@123` during demo evaluation).*

---

## 🌐 7. Complete REST API Specifications

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new citizen account
- `POST /api/auth/login` — Authenticate and receive JWT token + user payload
- `GET /api/auth/me` — Fetch currently authenticated user profile
- `PUT /api/auth/profile` — Update user details and profile picture (Multipart)

### Issues & Workflow (`/api/issues`)
- `POST /api/issues` — Report new civic issue with coordinates & image (Citizen/Admin)
- `GET /api/issues` — Search & filter issues (Category, Status, Priority, Geo-radius)
- `GET /api/issues/my` — Get reports submitted by current citizen
- `GET /api/issues/:id` — Get full issue details with populated audit history
- `PUT /api/issues/:id` — Update issue details
- `DELETE /api/issues/:id` — Delete issue
- `PATCH /api/issues/:id/status` — Advance status, add remarks, upload proof (Officer/Admin)
- `PATCH /api/issues/:id/assign` — Assign department/officer and priority (Officer/Admin)
- `POST /api/issues/:id/reopen` — Reopen closed or resolved issue (Citizen/Admin)

### Departments (`/api/departments`)
- `GET /api/departments` — List all departments
- `GET /api/departments/:id` — Get department by ID and assigned officers
- `POST /api/departments` — Create department (Admin)
- `PUT /api/departments/:id` — Update department details (Admin)
- `DELETE /api/departments/:id` — Delete department (Admin)

### Users (`/api/users`)
- `GET /api/users` — List users with role filter and search (Admin)
- `GET /api/users/:id` — Get user profile and resolution metrics (Admin)
- `POST /api/users` — Provision new user (Admin)
- `PUT /api/users/:id` — Update user permissions and department (Admin)
- `DELETE /api/users/:id` — Delete user account (Admin)

### Notifications & Analytics
- `GET /api/notifications` — Fetch user alerts and unread counter
- `PATCH /api/notifications/:id/read` — Mark notification read
- `PATCH /api/notifications/read-all` — Mark all notifications read
- `GET /api/dashboard/stats` — Retrieve role-tailored metrics & chart aggregations

---

## ⚙️ 8. Environment Configuration (`.env`)

Create `server/.env` based on `server/.env.example`:

```env
# MongoDB Connection (Local or Atlas URI)
MONGODB_URI=mongodb://127.0.0.1:27017/civicconnect

# JWT Secret Token
JWT_SECRET=your_jwt_secret_key_here

# Server Port
PORT=5000

# Optional Redis Connection (Leave empty to use in-memory cache)
REDIS_URL=

# Optional Cloudinary Credentials (Leave empty to use local disk storage /uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> **Zero-Setup Guarantee**: If MongoDB is not installed locally and no Atlas URI is provided, CivicConnect automatically boots an **embedded in-memory MongoDB database** so the project runs immediately without external configuration!

---

## 🚀 9. Installation & Running Instructions

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### Method A: Local Development (Recommended)

1. **Install Dependencies:**
   ```bash
   # From root directory:
   npm --prefix server install
   npm --prefix client install
   ```

2. **Run Automated Test Suite:**
   ```bash
   npm --prefix server test
   ```
   *(Verifies MongoDB connection, GeoJSON 2dsphere indexing, bcrypt hashing, JWT issuance, and status history tracking).*

3. **Start Backend Server:**
   ```bash
   npm --prefix server run dev
   ```
   *(Server starts on `http://localhost:5000` and auto-seeds 18+ sample issues if database is empty).*

4. **Start Frontend Web App:**
   ```bash
   npm --prefix client run dev
   ```
   *(Access web portal at `http://localhost:5173`).*

---

### Method B: Docker Compose

To run the complete multi-container stack (Backend, Frontend, MongoDB, Redis):

```bash
docker-compose up --build
```
- Web Application: `http://localhost:3000` or `http://localhost:80`
- Backend API: `http://localhost:5000/api`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

---

## 🔮 10. Future Enhancements
- **AI Image Classification**: Automated severity scoring and duplicate photo detection using vision models.
- **SMS / WhatsApp Gateway**: Citizens receive WhatsApp resolution alerts and SMS updates.
- **Municipal Work-Order ERP Sync**: Bi-directional integration with municipal SAP/Oracle enterprise systems.
- **Offline PWA Support**: Mobile field officers can log remarks in offline mode with auto-sync when reconnected.

---

**Developed with ❤️ for Academic Review & Smart City Civic Innovation.**
