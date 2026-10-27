# CivicConnect: Smart Civic Issue Reporting & Tracking Platform
## Comprehensive Academic Project Report & Technical Source Code Appendix

---

### Project Metadata
- **Project Title:** CivicConnect — Smart Civic Issue Reporting & Tracking Platform
- **Architecture:** Full-Stack MERN (MongoDB, Express.js, React.js, Node.js) with TypeScript
- **Geospatial Engine:** Leaflet GIS with OpenStreetMap & MongoDB `2dsphere` Spatial Indexing
- **Authentication & Security:** JSON Web Token (JWT) Bearer Auth, Bcrypt Hashing, RBAC
- **Deployment:** Docker, Docker Compose, Multi-tier Redis/Memory Caching

---

## TABLE OF CONTENTS
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [System Architecture & Data Flow](#2-system-architecture--data-flow)
3. [Project Directory Structure](#3-project-directory-structure)
4. [Environment Configuration & Dependencies](#4-environment-configuration--dependencies)
5. [Database Models & Geospatial Schemas](#5-database-models--geospatial-schemas)
6. [Security & Authentication Middleware](#6-security--authentication-middleware)
7. [Core Business Logic & Backend Controllers](#7-core-business-logic--backend-controllers)
8. [Express Application Setup & Routing Pipeline](#8-express-application-setup--routing-pipeline)
9. [REST API Interface Specification & Sample Payloads](#9-rest-api-interface-specification--sample-payloads)
10. [Frontend Highlights: Authentication & Progress Tracking](#10-frontend-highlights-authentication--progress-tracking)
11. [Project Screenshots & Interface Directory (Figures A.1 – A.7)](#11-project-screenshots--interface-directory-figures-a1--a7)
12. [Installation, Testing & Execution Guide](#12-installation-testing--execution-guide)

---

## 1. EXECUTIVE SUMMARY & PROBLEM STATEMENT

### 1.1 The Civic Problem
In contemporary urban governance, municipal authorities struggle with outdated issue reporting mechanisms such as physical complaint registers, unmonitored hotlines, or generic emails. These traditional approaches suffer from critical flaws:
- **Lack of Geographic Precision:** Complaints lack exact GPS coordinates, leading to field crew disorientation.
- **Opacity & Lack of Accountability:** Citizens have zero visibility into whether complaints were received, inspected, or dispatched.
- **Inter-Departmental Silos:** Complaints sit unrouted between public works, water boards, and electricity boards without unified coordination.
- **Absence of Proof of Work:** Issues are marked closed without visual proof or citizen satisfaction verification.

### 1.2 The CivicConnect Solution
**CivicConnect** is an enterprise-grade civic issue lifecycle platform connecting **Citizens**, **Municipal Officers**, and **City Administrators**:
- **Citizens** pinpoint infrastructure defects on an interactive GIS map, upload photos, and track repair progression in real time.
- **Field Officers** manage department-specific queues, update statuses, dispatch repair crews, and upload post-resolution evidence.
- **City Administrators** supervise city-wide KPI dashboards, departmental resolution percentages, and geographic heatmaps.

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

## 2. SYSTEM ARCHITECTURE & DATA FLOW

The platform follows a three-tier decoupled architecture:
1. **Presentation Tier:** React 18, TypeScript, Tailwind CSS, Leaflet OpenStreetMap, Lucide Icons, and Recharts.
2. **Application Tier:** Node.js and Express.js REST API with JWT authentication, Multer file processing, and Redis caching.
3. **Data Tier:** MongoDB document database with GeoJSON `Point` coordinates and `2dsphere` spatial indexing, including an automated in-memory MongoDB fallback.

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
                │  - JWT Bearer Auth & Role Middleware    │
                │  - Multer / Cloudinary Image Pipeline   │
                │  - Redis / In-Memory Cache Service      │
                └────────────────────┬────────────────────┘
                                     │ Mongoose ODM
                                     ▼
                ┌─────────────────────────────────────────┐
                │      MongoDB / MongoDB Atlas Database   │
                │  - GeoJSON 2dsphere Spatial Indexing    │
                │  - Users, Issues, Depts, Notifications  │
                │  - Audit History Event Streams          │
                └─────────────────────────────────────────┘
```

---

## 3. PROJECT DIRECTORY STRUCTURE

```text
CivicConnect/
├── docker-compose.yml              # Multi-container orchestration (Node, React, Mongo, Redis)
├── package.json                    # Workspace orchestrator
├── README.md                       # Repository guide
├── PROJECT_REPORT.md               # Unified academic report & source code appendix
│
├── server/                         # Express + Node.js API Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts               # MongoDB connection with MongoMemoryServer fallback
│   │   │   ├── redis.ts            # Redis client initialization with in-memory caching
│   │   │   └── cloudinary.ts       # Cloudinary media configuration
│   │   ├── controllers/
│   │   │   ├── authController.ts   # Registration, login, profile, and JWT issuance
│   │   │   ├── issueController.ts  # Civic issue CRUD, GeoJSON spatial search, status workflow
│   │   │   ├── departmentController.ts # Municipal agency setup & officer assignments
│   │   │   ├── userController.ts   # User management and role administration
│   │   │   ├── notificationController.ts # In-app notification delivery
│   │   │   └── dashboardController.ts # Aggregated role-based metrics
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT Bearer verification
│   │   │   ├── role.ts             # Role-based access control guard
│   │   │   ├── upload.ts           # Multer disk and cloud image upload processing
│   │   │   ├── rateLimiter.ts      # Sliding-window rate limiter
│   │   │   └── errorHandler.ts     # Global Express error interceptor
│   │   ├── models/
│   │   │   ├── User.ts             # User schema with bcrypt pre-save password hashing
│   │   │   ├── Department.ts       # Municipal department schema
│   │   │   ├── Issue.ts            # Issue schema with 2dsphere GeoJSON and audit trail
│   │   │   └── Notification.ts     # Real-time event notification schema
│   │   ├── routes/
│   │   │   ├── authRoutes.ts       # Authentication endpoints (/api/auth)
│   │   │   ├── issueRoutes.ts      # Issue reporting and lifecycle routes (/api/issues)
│   │   │   ├── departmentRoutes.ts # Municipal agency routes (/api/departments)
│   │   │   ├── userRoutes.ts       # User administration routes (/api/users)
│   │   │   ├── notificationRoutes.ts # In-app alert endpoints (/api/notifications)
│   │   │   └── dashboardRoutes.ts  # Analytics aggregation routes (/api/dashboard)
│   │   ├── services/
│   │   │   ├── cacheService.ts     # Multi-tier Redis / memory caching service
│   │   │   └── notificationService.ts # Event-driven citizen/officer notification dispatch
│   │   ├── tests/
│   │   │   ├── api.test.ts         # Automated backend test suite
│   │   │   └── e2e-workflow.test.js # End-to-end civic lifecycle verification
│   │   ├── utils/
│   │   │   ├── seed.ts             # Seed script for realistic municipal complaints
│   │   │   └── logger.ts           # Structured console logging utility
│   │   ├── app.ts                  # Express application pipeline configuration
│   │   └── server.ts               # HTTP server bootstrap and auto-seeder
│   ├── uploads/                    # Local image storage directory (fallback)
│   ├── .env.example                # Environment variable blueprint
│   ├── package.json                # Backend dependency manifest
│   └── tsconfig.json               # Backend TypeScript compiler settings
│
└── client/                         # React.js + TypeScript Modern Single-Page App
    ├── src/
    │   ├── components/
    │   │   ├── ActionModal.tsx     # Officer status update and remarks modal
    │   │   ├── CategoryIcon.tsx    # Category badge and icon resolver
    │   │   ├── MapPicker.tsx       # Leaflet coordinate selection pin with reverse geocoding
    │   │   ├── MapView.tsx         # Interactive geospatial multi-pin map viewer
    │   │   ├── Navbar.tsx          # Dynamic navigation bar with role badges & alerts
    │   │   ├── PriorityBadge.tsx   # Visual indicator for issue urgency
    │   │   ├── ProtectedRoute.tsx  # Route guard checking authentication and roles
    │   │   ├── StatCard.tsx        # KPI metrics counter card
    │   │   ├── StatusBadge.tsx     # Color-coded issue status indicator
    │   │   └── VisualTimeline.tsx  # 6-stage lifecycle progress tracker & audit timeline
    │   ├── context/
    │   │   ├── AuthContext.tsx     # Authentication state, login, and logout provider
    │   │   └── NotificationContext.tsx # Live unread alerts counter provider
    │   ├── pages/
    │   │   ├── Landing.tsx         # Public landing page with problem overview & stats
    │   │   ├── Login.tsx           # Authentication portal with 1-Click Demo Accounts
    │   │   ├── Register.tsx        # Citizen account creation form
    │   │   ├── CitizenDashboard.tsx# Citizen personal workspace and report summary
    │   │   ├── OfficerDashboard.tsx# Field officer department triage and resolution portal
    │   │   ├── AdminDashboard.tsx  # Municipal director analytics and department oversight
    │   │   ├── ReportIssue.tsx     # Issue submission form with GPS and image uploader
    │   │   ├── IssueDetails.tsx    # Comprehensive issue view, timeline, remarks, and reopen
    │   │   ├── GisMap.tsx          # Fullscreen city-wide GIS explorer and heat view
    │   │   ├── MyIssues.tsx        # Citizen filterable ticket history
    │   │   ├── DepartmentManagement.tsx # Municipal agency manager
    │   │   └── UserManagement.tsx  # System user administration and role assignment
    │   ├── services/
    │   │   ├── api.ts              # Axios instance configured with JWT request interceptor
    │   │   ├── authService.ts      # Authentication API calls
    │   │   ├── issueService.ts     # Issue reporting and workflow transition calls
    │   │   └── userService.ts      # Administrative user management calls
    │   ├── types/
    │   │   └── index.ts            # Global TypeScript interfaces and domain models
    │   ├── utils/
    │   │   ├── formatDate.ts       # Human-readable date and relative time formatting
    │   │   └── statusColors.ts     # Status badge styling and color mappings
    │   ├── App.tsx                 # Client routing declarations
    │   ├── main.tsx                # React DOM tree entry
    │   └── index.css               # Tailwind CSS declarations and Leaflet styles
    ├── index.html                  # HTML5 base document
    ├── package.json                # Frontend dependency manifest
    ├── tailwind.config.js          # Tailwind CSS styling and theme tokens
    └── vite.config.ts              # Vite compilation and proxy configuration
```

---

## 4. ENVIRONMENT CONFIGURATION & DEPENDENCIES

### 4.1 Environment Variables Configuration (`server/.env`)
```env
# Server Port & Mode
PORT=5000
NODE_ENV=development

# Database Configuration (Local MongoDB or Atlas URI)
MONGODB_URI=mongodb://127.0.0.1:27017/civicconnect

# Security Configuration - JSON Web Token Secret
JWT_SECRET=civicconnect_super_secret_jwt_key_2026_academic_demo
JWT_EXPIRES_IN=7d

# Optional Redis Connection (Leave empty to use built-in in-memory cache)
REDIS_URL=

# Optional Cloudinary Credentials (Leave empty to use local disk storage /uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 4.2 Backend Dependency Configuration (`server/package.json`)
```json
{
  "name": "civicconnect-server",
  "version": "1.0.0",
  "description": "CivicConnect API Server - Smart Civic Issue Reporting & Tracking Platform",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "seed": "tsx src/utils/seed.ts",
    "test": "tsx src/tests/api.test.ts"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cloudinary": "^2.5.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "ioredis": "^5.4.2",
    "jsonwebtoken": "^9.0.2",
    "mongodb-memory-server": "^10.1.3",
    "mongoose": "^8.9.5",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.8",
    "@types/multer": "^1.4.12",
    "@types/node": "^22.10.7",
    "ts-node": "^10.9.2",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3"
  }
}
```

### 4.3 Frontend Dependency Configuration (`client/package.json`)
```json
{
  "name": "civicconnect-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.9",
    "clsx": "^2.1.1",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.469.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-leaflet": "^4.2.1",
    "react-router-dom": "^6.28.1",
    "recharts": "^2.15.0",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.16",
    "@types/node": "^22.10.7",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.6.2",
    "vite": "^6.0.7"
  }
}
```

---

## 5. DATABASE MODELS & GEOSPATIAL SCHEMAS

### 5.1 MongoDB Connection Setup (`server/src/config/db.ts`)
```typescript
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongodInstance: any = null;

export const connectDB = async (): Promise<string> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicconnect';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[MongoDB] Connected successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return uri;
  } catch (primaryError: any) {
    const maskedUri = uri.replace(/\/\/[^@]+@/, '//***:***@');
    console.warn(`[MongoDB] Could not connect to primary URI (${maskedUri}): ${primaryError.message}`);
    console.log('[MongoDB] Initializing in-memory MongoDB server fallback for demonstration...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to Embedded MongoDB Server: ${memoryUri}`);
      return memoryUri;
    } catch (fallbackError: any) {
      console.error('[MongoDB] Failed to connect to both primary URI and in-memory server:', fallbackError);
      throw fallbackError;
    }
  }
};

export const closeDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
```

### 5.2 User Model (`server/src/models/User.ts`)
```typescript
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'citizen' | 'officer' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  department?: mongoose.Types.ObjectId;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['citizen', 'officer', 'admin'],
      default: 'citizen',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    profileImage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
```

### 5.3 Civic Issue Model (`server/src/models/Issue.ts`)
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export type IssueCategory =
  | 'Road Damage'
  | 'Pothole'
  | 'Water Leakage'
  | 'Garbage Overflow'
  | 'Streetlight Failure'
  | 'Drainage Problem'
  | 'Traffic Problem'
  | 'Public Infrastructure'
  | 'Other';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IssueStatus =
  | 'REPORTED'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'REOPENED';

export interface IStatusHistoryItem {
  status: IssueStatus;
  changedBy: mongoose.Types.ObjectId;
  changedAt: Date;
  remarks?: string;
  evidenceImage?: string;
}

export interface IIssue extends Document {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  image?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  reportedBy: mongoose.Types.ObjectId;
  assignedDepartment?: mongoose.Types.ObjectId;
  assignedOfficer?: mongoose.Types.ObjectId;
  statusHistory: IStatusHistoryItem[];
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StatusHistorySchema = new Schema<IStatusHistoryItem>(
  {
    status: {
      type: String,
      enum: ['REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED', 'REOPENED'],
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      default: '',
    },
    evidenceImage: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const IssueSchema = new Schema<IIssue>(
  {
    title: {
      type: String,
      required: [true, 'Please provide issue title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide issue description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Road Damage', 'Pothole', 'Water Leakage', 'Garbage Overflow',
        'Streetlight Failure', 'Drainage Problem', 'Traffic Problem',
        'Public Infrastructure', 'Other',
      ],
      default: 'Other',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED', 'REOPENED'],
      default: 'REPORTED',
    },
    image: {
      type: String,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      type: String,
      required: [true, 'Please provide an address or landmark'],
      trim: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    assignedOfficer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: [],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// 2dsphere index on location for geospatial querying
IssueSchema.index({ location: '2dsphere' });
IssueSchema.index({ status: 1 });
IssueSchema.index({ category: 1 });
IssueSchema.index({ priority: 1 });
IssueSchema.index({ reportedBy: 1 });
IssueSchema.index({ assignedDepartment: 1 });

export const Issue = mongoose.model<IIssue>('Issue', IssueSchema);
export default Issue;
```

---

## 6. SECURITY & AUTHENTICATION MIDDLEWARE

### 6.1 JWT Bearer Token Verification (`server/src/middleware/auth.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'civicconnect_super_secret_jwt_key_2026_academic_demo';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ success: false, message: 'User belonging to this token no longer exists.' });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};
```

### 6.2 Role-Based Access Control Guard (`server/src/middleware/role.ts`)
```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to perform this action.`,
      });
      return;
    }

    next();
  };
};
```

---

## 7. CORE BUSINESS LOGIC & BACKEND CONTROLLERS

### 7.1 Authentication Controller (`server/src/controllers/authController.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser, UserRole } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const generateToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET || 'civicconnect_super_secret_jwt_key_2026_academic_demo';
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    secret,
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const assignedRole: UserRole = role && ['citizen', 'officer', 'admin'].includes(role) ? role : 'citizen';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      role: assignedRole,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('department', 'name');

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
      return;
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
```

### 7.2 Issue Management & Lifecycle Controller (`server/src/controllers/issueController.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import Issue, { IssueCategory, IssuePriority, IssueStatus } from '../models/Issue';
import Department from '../models/Department';
import { AuthRequest } from '../middleware/auth';
import { handleImageUpload } from '../middleware/upload';
import { createNotification } from '../services/notificationService';
import { cacheService } from '../services/cacheService';

// Report a New Civic Issue with Geolocation & Auto-Department Routing
export const createIssue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { title, description, category, priority, address, latitude, longitude } = req.body;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!title || !description || !category || !address || isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ success: false, message: 'Title, description, category, address, and coordinates are required.' });
      return;
    }

    let imageUrl = req.file ? await handleImageUpload(req.file) : req.body.image || '';

    // Auto-map category to municipal department
    let assignedDeptId = null;
    const departmentMatchMap: Record<string, string> = {
      'Road Damage': 'Public Works',
      'Pothole': 'Public Works',
      'Water Leakage': 'Water Supply',
      'Drainage Problem': 'Water Supply',
      'Garbage Overflow': 'Solid Waste',
      'Streetlight Failure': 'Electricity',
    };

    const targetDept = departmentMatchMap[category];
    if (targetDept) {
      const matchedDept = await Department.findOne({ name: { $regex: new RegExp(targetDept, 'i') } });
      if (matchedDept) assignedDeptId = matchedDept._id;
    }

    const issue = await Issue.create({
      title: title.trim(),
      description: description.trim(),
      category: category as IssueCategory,
      priority: (priority as IssuePriority) || 'MEDIUM',
      status: 'REPORTED',
      image: imageUrl,
      location: {
        type: 'Point',
        coordinates: [lng, lat], // GeoJSON order: [longitude, latitude]
      },
      address: address.trim(),
      reportedBy: req.user._id,
      assignedDepartment: assignedDeptId,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: req.user._id,
          changedAt: new Date(),
          remarks: 'Issue reported by citizen through CivicConnect platform.',
        },
      ],
    });

    await createNotification(
      req.user._id,
      `Your report "${issue.title}" has been successfully logged.`,
      issue._id as any
    );

    await cacheService.invalidate('stats:*');

    res.status(201).json({ success: true, message: 'Issue reported successfully', issue });
  } catch (error) {
    next(error);
  }
};

// Advance Issue Lifecycle Status with Remarks & Photographic Evidence
export const updateIssueStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, remarks } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found' });
      return;
    }

    let evidenceImageUrl = req.file ? await handleImageUpload(req.file) : req.body.evidenceImage || '';

    if (status === 'RESOLVED' && !issue.resolvedAt) {
      issue.resolvedAt = new Date();
    }

    issue.status = status;
    issue.statusHistory.push({
      status,
      changedBy: req.user!._id,
      changedAt: new Date(),
      remarks: remarks || `Status transitioned to ${status} by ${req.user!.name}`,
      evidenceImage: evidenceImageUrl,
    });

    await issue.save();

    await createNotification(
      issue.reportedBy,
      `Your report "${issue.title}" status has changed to: ${status}.`,
      issue._id as any
    );

    await cacheService.invalidate('stats:*');

    res.status(200).json({ success: true, message: 'Status updated successfully', issue });
  } catch (error) {
    next(error);
  }
};

// Reopen a Resolved or Closed Issue if Substandard
export const reopenIssue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { remarks } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found' });
      return;
    }

    issue.status = 'REOPENED';
    issue.resolvedAt = undefined;
    issue.statusHistory.push({
      status: 'REOPENED',
      changedBy: req.user!._id,
      changedAt: new Date(),
      remarks: remarks || 'Citizen reopened issue due to inadequate resolution.',
    });

    await issue.save();
    await cacheService.invalidate('stats:*');

    res.status(200).json({ success: true, message: 'Issue reopened successfully', issue });
  } catch (error) {
    next(error);
  }
};
```

---

## 8. EXPRESS APPLICATION SETUP & ROUTING PIPELINE

### 8.1 Express Main App File (`server/src/app.ts`)
```typescript
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import issueRoutes from './routes/issueRoutes';
import departmentRoutes from './routes/departmentRoutes';
import userRoutes from './routes/userRoutes';
import notificationRoutes from './routes/notificationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

const app: Application = express();

// Cross-Origin Resource Sharing
app.use(cors({ origin: true, credentials: true }));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Route for Uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate Limiter
app.use(rateLimiter({ windowMs: 60 * 1000, max: 200 }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'online', platform: 'CivicConnect API', version: '1.0.0' });
});

// REST Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Interception
app.use(errorHandler);

export default app;
```

### 8.2 Issue Router Pipeline (`server/src/routes/issueRoutes.ts`)
```typescript
import { Router } from 'express';
import {
  createIssue,
  getIssues,
  getMyIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  updateIssueStatus,
  assignIssue,
  reopenIssue,
} from '../controllers/issueController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/role';
import { upload } from '../middleware/upload';

const router = Router();

// Public / General listings
router.get('/', getIssues);
router.get('/my', authenticate, getMyIssues);
router.get('/:id', getIssueById);

// Issue creation (Authenticated Citizen/Admin)
router.post('/', authenticate, upload.single('image'), createIssue);

// Issue update & deletion
router.put('/:id', authenticate, upload.single('image'), updateIssue);
router.delete('/:id', authenticate, deleteIssue);

// Workflow updates: Officer / Admin actions
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('officer', 'admin'),
  upload.single('evidenceImage'),
  updateIssueStatus
);

router.patch(
  '/:id/assign',
  authenticate,
  authorizeRoles('officer', 'admin'),
  assignIssue
);

// Citizen / Admin reopen action
router.post('/:id/reopen', authenticate, reopenIssue);

export default router;
```

---

## 9. REST API INTERFACE SPECIFICATION & SAMPLE PAYLOADS

### 9.1 Authentication (`POST /api/auth/login`)
#### Request:
```http
POST /api/auth/login HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "email": "officer@civicconnect.com",
  "password": "Officer@123"
}
```
#### Response:
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66f591bc89b1a12345678901",
    "name": "Marcus Vance",
    "email": "officer@civicconnect.com",
    "role": "officer",
    "department": {
      "_id": "66f591bc89b1a12345678888",
      "name": "Public Works Department"
    }
  }
}
```

### 9.2 Issue Creation (`POST /api/issues`)
#### Request:
```http
POST /api/issues HTTP/1.1
Host: localhost:5000
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "title": "Severe Deep Pothole on 5th Cross Road",
  "description": "Hazardous road crater causing traffic bottleneck and scooter skid risks.",
  "category": "Pothole",
  "priority": "HIGH",
  "address": "Opposite City Central Library, 5th Cross, Metro Ward 12",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "image": "https://res.cloudinary.com/civicconnect/image/upload/sample_pothole.jpg"
}
```
#### Response:
```json
{
  "success": true,
  "message": "Issue reported successfully",
  "issue": {
    "_id": "66f6004b78c934561234abcd",
    "title": "Severe Deep Pothole on 5th Cross Road",
    "category": "Pothole",
    "priority": "HIGH",
    "status": "REPORTED",
    "location": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716]
    },
    "address": "Opposite City Central Library, 5th Cross, Metro Ward 12",
    "reportedBy": "66f591bc89b1a12345678912",
    "assignedDepartment": "66f591bc89b1a12345678888",
    "statusHistory": [
      {
        "status": "REPORTED",
        "changedBy": "66f591bc89b1a12345678912",
        "changedAt": "2026-10-25T06:00:00.000Z",
        "remarks": "Issue reported by citizen through CivicConnect platform."
      }
    ],
    "createdAt": "2026-10-25T06:00:00.000Z"
  }
}
```

### 9.3 Status Transition (`PATCH /api/issues/:id/status`)
#### Request:
```http
PATCH /api/issues/66f6004b78c934561234abcd/status HTTP/1.1
Host: localhost:5000
Authorization: Bearer <OFFICER_TOKEN>
Content-Type: application/json

{
  "status": "RESOLVED",
  "remarks": "Pothole repaved with hot-mix asphalt and road leveling completed by PWD crew.",
  "evidenceImage": "https://res.cloudinary.com/civicconnect/image/upload/pothole_repaired.jpg"
}
```
#### Response:
```json
{
  "success": true,
  "message": "Status updated successfully",
  "issue": {
    "_id": "66f6004b78c934561234abcd",
    "status": "RESOLVED",
    "resolvedAt": "2026-10-25T10:15:30.000Z",
    "statusHistory": [
      {
        "status": "REPORTED",
        "changedAt": "2026-10-25T06:00:00.000Z",
        "remarks": "Issue reported by citizen through CivicConnect platform."
      },
      {
        "status": "RESOLVED",
        "changedBy": "66f591bc89b1a12345678901",
        "changedAt": "2026-10-25T10:15:30.000Z",
        "remarks": "Pothole repaved with hot-mix asphalt and road leveling completed by PWD crew.",
        "evidenceImage": "https://res.cloudinary.com/civicconnect/image/upload/pothole_repaired.jpg"
      }
    ]
  }
}
```

---

## 10. FRONTEND HIGHLIGHTS: AUTHENTICATION & PROGRESS TRACKING

### 10.1 Login Page with 1-Click Demo Buttons (`client/src/pages/Login.tsx`)
```tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { MapPin, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await authService.login({ email: demoEmail, password: demoPass });
      if (res.success) {
        login(res.token, res.user);
        if (res.user.role === 'admin') navigate('/admin/dashboard');
        else if (res.user.role === 'officer') navigate('/officer/dashboard');
        else navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-slate-900 text-xl">CivicConnect</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to your account</h2>
        </div>

        {/* 1-Click Demonstration Account Switcher */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Instant 1-Click Academic Demo Login
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('citizen@civicconnect.com', 'Citizen@123')}
              className="px-2.5 py-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200"
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('officer@civicconnect.com', 'Officer@123')}
              className="px-2.5 py-2 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl border border-blue-200"
            >
              Officer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@civicconnect.com', 'Admin@123')}
              className="px-2.5 py-2 text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl border border-purple-200"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 10.2 Visual 6-Stage Progress Tracker (`client/src/components/VisualTimeline.tsx`)
```tsx
import React from 'react';
import { IssueStatus, StatusHistoryItem } from '../types';
import { CheckCircle2, Clock } from 'lucide-react';

interface Props {
  currentStatus: IssueStatus;
  statusHistory: StatusHistoryItem[];
}

const WORKFLOW_STEPS: { key: IssueStatus; label: string; desc: string }[] = [
  { key: 'REPORTED', label: 'Reported', desc: 'Submitted by citizen' },
  { key: 'VERIFIED', label: 'Verified', desc: 'Validated by dept officer' },
  { key: 'ASSIGNED', label: 'Assigned', desc: 'Workforce dispatched' },
  { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Field repair active' },
  { key: 'RESOLVED', label: 'Resolved', desc: 'Resolution evidence uploaded' },
  { key: 'CLOSED', label: 'Closed', desc: 'Confirmed & closed' },
];

export const VisualTimeline: React.FC<Props> = ({ currentStatus, statusHistory }) => {
  const stepIndexMap: Record<string, number> = {
    REPORTED: 0, VERIFIED: 1, ASSIGNED: 2, IN_PROGRESS: 3, RESOLVED: 4, CLOSED: 5
  };
  const currentIdx = stepIndexMap[currentStatus] ?? -1;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-base font-bold text-slate-900">Issue Progress Tracking</h3>
      <div className="grid grid-cols-6 gap-2 mt-6">
        {WORKFLOW_STEPS.map((step, idx) => {
          const isCompleted = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div key={step.key} className="text-center">
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
              <p className={`mt-2 text-xs font-semibold ${isCurrent ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

---

## 11. PROJECT SCREENSHOTS & INTERFACE DIRECTORY (FIGURES A.1 – A.7)

> **Report Note:** Insert the captured graphic screenshots into each designated figure section below for physical printout or PDF export.

---

### Figure A.1: Sign-in Portal with 1-Click Demonstration Account Switchers
```text
+-----------------------------------------------------------------------------------+
|  [CivicConnect Logo]                                                              |
|                                                                                   |
|  Sign in to your account                                                          |
|  Access your personalized civic tracking console                                  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |  * INSTANT 1-CLICK ACADEMIC DEMO LOGIN                                      |  |
|  |  +---------------------+  +--------------------+  +----------------------+  |  |
|  |  | [ Citizen ]         |  | [ Officer ]        |  | [ Admin ]            |  |  |
|  |  +---------------------+  +--------------------+  +----------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  Email Address:    [ citizen@civicconnect.com                            ]        |
|  Password:         [ ************                                        ]        |
|                                                                                   |
|  [                     Sign In to CivicConnect Portal                    ]        |
+-----------------------------------------------------------------------------------+
```
**Caption**: *Figure A.1: CivicConnect Authentication Portal featuring role-based credential inputs and 1-Click instant demo switchers for Citizen, Municipal Officer, and Administrator.*

---

### Figure A.2: Citizen Self-Service Dashboard & Ticket History
```text
+-----------------------------------------------------------------------------------+
|  CivicConnect   [Dashboard]   [Report Issue]   [GIS Map]    (Notifications) [Alex]|
+-----------------------------------------------------------------------------------+
|  Welcome back, Alex Rivera (Citizen)                                              |
|                                                                                   |
|  +----------------+  +----------------+  +----------------+  +-----------------+  |
|  | TOTAL REPORTS  |  | PENDING        |  | IN PROGRESS    |  | RESOLVED        |  |
|  |      8         |  |      2         |  |      3         |  |      3          |  |
|  +----------------+  +----------------+  +----------------+  +-----------------+  |
|                                                                                   |
|  Recent Civic Reports:                                                            |
|  - [#CIV-102] Deep Pothole on 5th Cross Road      [IN_PROGRESS]   (Public Works)  |
|  - [#CIV-101] Water Pipe Burst near Metro Gate    [VERIFIED]      (Water Supply)  |
|  - [#CIV-098] Streetlight Blackout on 2nd Main    [RESOLVED]      (Electricity)   |
+-----------------------------------------------------------------------------------+
```
**Caption**: *Figure A.2: Citizen Self-Service Workspace displaying aggregate complaint status cards, recent issue activity, and direct links to active tickets.*

---

### Figure A.3: Interactive Issue Reporting with GPS Detection & Leaflet Pinning
```text
+-----------------------------------------------------------------------------------+
|  Report a Civic Issue                                                             |
|  Provide accurate problem details and pinpoint the geographic location.           |
|                                                                                   |
|  Issue Title:      [ Hazardous Pothole near South Gate                     ]      |
|  Category:         [ Pothole v ]              Priority:  [ HIGH v ]               |
|  Description:      [ Large road depression causing traffic and vehicle damage.   ] |
|                                                                                   |
|  Interactive Geographic Map:                                                      |
|  +-----------------------------------------------------------------------------+  |
|  |  [ + ]  OpenStreetMap GIS Tile Engine                                       |  |
|  |  [ - ]                                                                      |  |
|  |             [ Pin: 12.9716 N, 77.5946 E ]                                   |  |
|  |             Opposite Central Library, Ward 12                               |  |
|  +-----------------------------------------------------------------------------+  |
|  [ Use Current GPS Location ]    Reverse Geocoded: [ South Ward 12, Metro Area ]  |
|  Attach Photo Proof:             [ Choose File: pothole_evidence.jpg ]            |
|                                                                                   |
|  [                        Submit Civic Issue Report                      ]        |
+-----------------------------------------------------------------------------------+
```
**Caption**: *Figure A.3: Interactive Issue Reporting Interface featuring Leaflet GIS coordinate pinning, HTML5 Geolocation API integration, and file upload for visual evidence.*

---

### Figure A.4: City-Wide Geospatial GIS Heatmap & Multi-Layer Explorer
```text
+-----------------------------------------------------------------------------------+
|  City-Wide Civic GIS Explorer                                                     |
|  Filter: Category [ All v ]   Status [ Active Only v ]   Priority [ All v ]       |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |  Leaflet Map Engine                                                         |  |
|  |                                                                             |  |
|  |       (RED PIN: Critical Water Burst)                                       |  |
|  |                                (AMBER PIN: Road Damage)                     |  |
|  |                                                                             |  |
|  |                   (BLUE PIN: Drainage Issue)                                |  |
|  |                                                                             |  |
|  +-----------------------------------------------------------------------------+  |
|  Legend: [Red: Critical] [Orange: High] [Blue: In Progress] [Green: Resolved]     |
+-----------------------------------------------------------------------------------+
```
**Caption**: *Figure A.4: Geospatial OpenStreetMap interface illustrating real-time municipal complaints color-coded by urgency and operational status across city zones.*

---

### Figure A.5: Issue Lifecycle Details with 6-Stage Progress Tracker & Proof
```text
+-----------------------------------------------------------------------------------+
|  Issue #CIV-102: Deep Pothole on 5th Cross Road                                   |
|  Category: Pothole | Priority: HIGH | Department: Public Works Department         |
|                                                                                   |
|  Resolution Workflow:                                                             |
|  [ (v) Reported ]-->[ (v) Verified ]-->[ (v) Assigned ]-->[ (*) In Progress ]...  |
|                                                                                   |
|  Audit Trail & Remarks:                                                           |
|  - 2026-10-25 06:00: Reported by Alex Rivera (Citizen)                            |
|  - 2026-10-25 08:30: Verified by Officer Vance (Public Works)                      |
|  - 2026-10-25 09:15: Crew Dispatched. Repair truck #14 assigned.                  |
|                                                                                   |
|  Photographic Evidence:                                                           |
|  [ Initial Report Image ]               [ Post-Repair Evidence (Pending) ]        |
|                                                                                   |
|  [ Reopen Issue ] (Enabled for Citizen upon resolution if unsatisfied)            |
+-----------------------------------------------------------------------------------+
```
**Caption**: *Figure A.5: Detailed Issue Inspection screen showing the 6-stage lifecycle progress tracker, officer audit remarks, and photographic verification.*

---

### Figure A.6: Municipal Field Officer Operational Workspace
```text
+-----------------------------------------------------------------------------------+
|  Officer Workspace: Public Works Department                       [Officer Vance] |
|                                                                                   |
|  [ ASSIGNED: 12 ]    [ PENDING REVIEW: 4 ]    [ IN PROGRESS: 5 ]   [ RESOLVED: 3 ]|
|                                                                                   |
|  Departmental Queue:                                                              |
|  +-----------------------------------------------------------------------------+  |
|  | ID       | Title                       | Priority | Status      | Action    |  |
|  |----------|-----------------------------|----------|-------------|-----------|  |
|  | #CIV-102 | Deep Pothole 5th Cross      | HIGH     | IN_PROGRESS | [Update]  |  |
|  | #CIV-105 | Broken Concrete Curb        | MEDIUM   | REPORTED    | [Verify]  |  |
|  | #CIV-108 | Pavement Sinkhole           | CRITICAL | ASSIGNED    | [Update]  |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```
**Caption**: *Figure A.6: Municipal Officer Console providing triage controls, status updating modals, and photo resolution upload capabilities for field operations.*

---

### Figure A.7: Executive Administrator Analytics & Departmental Oversight
```text
+-----------------------------------------------------------------------------------+
|  Executive Municipal Administration Console                                       |
|                                                                                   |
|  +---------------+  +---------------+  +---------------+  +--------------------+  |
|  | TOTAL ISSUES  |  | ACTIVE USERS  |  | RESOLUTION %  |  | DEPARTMENTS        |  |
|  |      142      |  |      89       |  |      84%      |  |       6            |  |
|  +---------------+  +---------------+  +---------------+  +--------------------+  |
|                                                                                   |
|  [ Issues by Category (Bar Chart) ]      [ Issues by Priority (Pie Chart) ]       |
|  - Road Damage: 45                       - High / Critical: 38%                   |
|  - Water Leakage: 32                     - Medium: 44%                            |
|  - Solid Waste: 28                       - Low: 18%                               |
|  - Streetlight: 22                                                                |
|                                                                                   |
|  Quick Actions: [ Manage Users ]   [ Manage Departments ]   [ Audit Log ]         |
+-----------------------------------------------------------------------------------+
```
**Caption**: *Figure A.7: City Director Analytics Dashboard displaying city-wide metrics, Recharts category and priority visualizations, and administrative controls.*

---

## 12. INSTALLATION, TESTING & EXECUTION GUIDE

### 12.1 Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local or MongoDB Atlas connection string)
- **Docker & Docker Compose** (Optional, for containerized run)

### 12.2 Development Setup Steps
```bash
# 1. Install Server Dependencies
npm --prefix server install

# 2. Install Client Dependencies
npm --prefix client install

# 3. Execute Automated Tests (Verifies Auth, Geospatial Queries, and Lifecycle)
npm --prefix server test

# 4. Start Server Backend
npm --prefix server run dev
# Backend runs at http://localhost:5000

# 5. Start Client Web Application
npm --prefix client run dev
# Frontend runs at http://localhost:5173
```

### 12.3 Automated Test Execution Output
```bash
> civicconnect-server@1.0.0 test
> tsx src/tests/api.test.ts

[Test 1] Connect to MongoDB Database ...................... PASSED
[Test 2] Password Hashing with Bcrypt ..................... PASSED
[Test 3] JWT Issuance & Token Verification ................ PASSED
[Test 4] GeoJSON 2dsphere Geospatial Proximity Query ...... PASSED
[Test 5] Civic Issue Lifecycle State Machine Audit ........ PASSED

All 5 core system tests passed successfully.
```

### 12.4 Pre-Configured Demo Credentials
| Role | Email | Password | Department / Scope |
|---|---|---|---|
| **Administrator** | `admin@civicconnect.com` | `Admin@123` | City Director (All administrative controls) |
| **Officer (Roads)** | `officer@civicconnect.com` | `Officer@123` | Public Works Department (Roads & Potholes) |
| **Officer (Water)** | `water.officer@civicconnect.com` | `Officer@123` | Water Supply & Sewerage Board |
| **Officer (Sanitation)** | `sanitation.officer@civicconnect.com` | `Officer@123` | Solid Waste Management Division |
| **Citizen (Alex)** | `citizen@civicconnect.com` | `Citizen@123` | Registered Citizen account |
| **Citizen (Jane)** | `jane.citizen@civicconnect.com` | `Citizen@123` | Registered Citizen account |
