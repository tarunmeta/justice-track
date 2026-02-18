# JusticeTrack

**Transparent Legal Tracking for Public Accountability**

A production-ready full-stack civic legal transparency platform for tracking verified legal cases with official references (FIR numbers, Court Case Numbers, or verified News URLs). No unverified accusations allowed.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Framer Motion |
| **Backend** | NestJS, TypeScript, PostgreSQL, Prisma ORM |
| **Auth** | JWT (Access + Refresh tokens), OTP verification, Role-based guards |
| **DevOps** | Docker, docker-compose, multi-stage builds |

---

## Quick Start (Local Development)

### Prerequisites
- **Node.js** 18+ and **npm**
- **PostgreSQL** 16+ (or use Docker)
- **Docker** and **Docker Compose** (optional)

### 1. Clone and Setup Environment

```bash
# Copy environment file
cp .env.example .env
# Edit .env with your database credentials if not using Docker defaults
```

### 2. Start Database (Docker)

```bash
docker-compose up -d postgres
```

### 3. Setup Backend

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed     # Seeds admin, moderator, lawyer, and sample cases
npm run start:dev       # Starts on http://localhost:4000
```

### 4. Setup Frontend

```bash
cd client
npm install
npm run dev             # Starts on http://localhost:3000
```

### 5. Open Browser

Visit **http://localhost:3000**

---

## Seed Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@justicetrack.com | Admin@123456 |
| Moderator | mod@justicetrack.com | Moderator@123 |
| Lawyer | lawyer@justicetrack.com | Lawyer@123456 |
| Public User | user@justicetrack.com | User@1234567 |

---

## Production Deployment (Docker)

```bash
# Build and run all services
docker-compose up --build

# Services:
# Frontend:  http://localhost:3000
# Backend:   http://localhost:4000
# Database:  localhost:5432
```

---

## Project Structure

```
justice-system/
├── docker-compose.yml           # Multi-service orchestration
├── .env.example                 # Environment template
├── server/                      # NestJS Backend
│   ├── prisma/
│   │   ├── schema.prisma        # Database models
│   │   └── seed.ts              # Seed script
│   ├── src/
│   │   ├── main.ts              # Entry point
│   │   ├── app.module.ts        # Root module
│   │   ├── prisma/              # Prisma service
│   │   ├── auth/                # JWT auth, guards, strategies
│   │   ├── users/               # User management
│   │   ├── cases/               # Case CRUD, file upload
│   │   ├── votes/               # Support/oppose voting
│   │   ├── moderation/          # Approve/reject/flag
│   │   └── analytics/           # Dashboard data
│   └── Dockerfile
├── client/                      # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Landing + trending
│   │   │   ├── auth/            # Login, Register + OTP
│   │   │   ├── cases/           # Browse, Detail, Create
│   │   │   ├── dashboard/       # User dashboard
│   │   │   ├── moderate/        # Moderator panel
│   │   │   └── admin/           # Admin analytics
│   │   ├── components/          # Navbar, Providers
│   │   └── lib/                 # API client, stores, utils
│   └── Dockerfile
└── README.md
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |

### Cases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cases` | List cases (public) |
| GET | `/api/cases/trending` | Get trending cases |
| GET | `/api/cases/:id` | Case details |
| POST | `/api/cases` | Submit case (auth) |
| PATCH | `/api/cases/:id/status` | Update status (mod/admin) |
| POST | `/api/cases/:id/lawyer-comments` | Add legal insight (lawyer) |

### Votes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/votes/:caseId` | Vote support/oppose |
| DELETE | `/api/votes/:caseId` | Remove vote |
| GET | `/api/votes/:caseId` | Get user's vote |

### Moderation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/moderation/cases/:id/approve` | Approve case |
| POST | `/api/moderation/cases/:id/reject` | Reject case |
| POST | `/api/moderation/cases/:id/flag` | Flag case |
| GET | `/api/moderation/logs` | View moderation logs |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Analytics data |
| GET | `/api/users` | List users |
| PATCH | `/api/users/:id/role` | Update user role |
| PATCH | `/api/users/:id/status` | Update user status |

---

## Security Features

- ✅ Helmet HTTP headers
- ✅ CORS configuration
- ✅ JWT access + refresh tokens
- ✅ Rate limiting (60 req/min global)
- ✅ Input validation (class-validator whitelist)
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS prevention (HTML tag stripping)
- ✅ Role-based authorization guards
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ Abusive content detection (AI moderation placeholder)
- ✅ Guilt declaration prevention for lawyers
- ✅ Anti vote manipulation (unique constraint)

---

## License

MIT
