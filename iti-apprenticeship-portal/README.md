# ITI Apprenticeship & Trade Job Matching Portal

A full-stack MERN (MongoDB, Express, React, Node.js) web application that connects
ITI/diploma graduates with apprenticeships and trade jobs offered by workshops,
factories, and manufacturing units.

Built to satisfy the Phase 1 scope defined in the project PRD: student & employer
registration, job posting/search/filter, application & shortlisting workflow, and
an admin management panel — across 8 interconnected pages.

---

## 1. Project Structure

```
iti-apprenticeship-portal/
├── backend/                  Node.js + Express + MongoDB REST API
│   ├── config/db.js          MongoDB connection
│   ├── models/                User, Job, Application (Mongoose schemas)
│   ├── middleware/            JWT auth guard + role-based access control
│   ├── controllers/           Business logic per module
│   ├── routes/                 Express routers (auth, students, employers, jobs, admin)
│   ├── seed/seedData.js       Realistic sample data loader
│   └── server.js              App entry point
├── frontend/                 React single-page application
│   ├── src/pages/              Login, Register, JobListing, JobDetails,
│   │                            ApplicationPage, StudentDashboard,
│   │                            EmployerPanel, AdminPanel, Home, NotFound
│   ├── src/components/         Navbar, Footer, JobCard, PrivateRoute
│   ├── src/context/AuthContext.js   Global auth/session state
│   ├── src/api/axiosConfig.js       Axios instance with JWT interceptor
│   └── src/styles/global.css        Design tokens ("workshop floor" theme)
└── README.md                 (this file)
```

## 2. Prerequisites

- Node.js 18+ and npm
- MongoDB running locally (`mongodb://127.0.0.1:27017`) **or** a free MongoDB Atlas cluster

## 3. Backend Setup

```bash
cd backend
cp .env.example .env      # then edit .env with your Mongo URI / JWT secret
npm install
npm run seed               # optional but recommended: loads realistic sample data
npm run dev                 # starts the API on http://localhost:5000 (nodemon)
```

Health check: `GET http://localhost:5000/api/health`

### Seeded test accounts (after running `npm run seed`)

| Role      | Email                              | Password       | Notes                     |
|-----------|-------------------------------------|----------------|---------------------------|
| Admin     | admin@itiportal.in                  | Admin@12345    | Full admin access         |
| Employer  | rajesh@precisiontools.in            | Employer@123   | Already approved          |
| Employer  | manoj@vermaautoworks.in             | Employer@123   | Pending admin approval    |
| Student   | amit.pawar@example.in               | Student@123    | Fitter trade               |
| Student   | priya.shinde@example.in             | Student@123    | Electrician trade          |
| Student   | rahul.jadhav@example.in             | Student@123    | Welder trade                |

## 4. Frontend Setup

```bash
cd frontend
cp .env.example .env       # points REACT_APP_API_URL at your backend
npm install
npm start                   # opens http://localhost:3000
```

## 5. Core User Flows

**Student:** Register → build trade-skill profile → search/filter jobs →
apply with a cover note → track application status (Applied / Shortlisted /
Hired / Rejected) on the dashboard.

**Employer:** Register workshop → wait for admin approval → post apprenticeship
or trade job openings → review applicants → shortlist / hire / reject.

**Admin:** Approve or deactivate employer accounts → moderate job postings
(flag fraudulent listings) → view platform-wide analytics (registered
students, employers, active jobs, applications, successful placements).

## 6. API Reference (summary)

| Method | Endpoint                                              | Access          |
|--------|--------------------------------------------------------|-----------------|
| POST   | /api/auth/register                                     | Public          |
| POST   | /api/auth/login                                        | Public          |
| GET    | /api/auth/me                                           | Any logged-in   |
| GET    | /api/jobs                                              | Public (search) |
| GET    | /api/jobs/:id                                          | Public          |
| GET    | /api/jobs/meta/trade-skills                            | Public          |
| GET/PUT| /api/students/profile                                  | Student         |
| POST   | /api/students/apply/:jobId                             | Student         |
| GET    | /api/students/applications                             | Student         |
| DELETE | /api/students/applications/:id                          | Student         |
| PUT    | /api/employers/profile                                 | Employer        |
| POST/GET | /api/employers/jobs                                  | Employer        |
| PUT/DELETE | /api/employers/jobs/:id                             | Employer        |
| GET    | /api/employers/jobs/:jobId/applications                | Employer        |
| PUT    | /api/employers/applications/:id/status                | Employer        |
| GET    | /api/admin/users                                        | Admin           |
| PUT    | /api/admin/employers/:id/approve                        | Admin           |
| PUT    | /api/admin/users/:id/status                             | Admin           |
| GET    | /api/admin/jobs                                          | Admin           |
| PUT    | /api/admin/jobs/:id/flag                                 | Admin           |
| GET    | /api/admin/analytics                                     | Admin           |

## 7. Security Notes

- Passwords are hashed with bcrypt before storage.
- JWT-based authentication with role embedded in the token payload.
- Role-based middleware (`allowRoles`) restricts each route group.
- Employers must be explicitly approved by an admin before they can post jobs.

## 8. Deployment

- **Backend:** Deploy to Render / Railway / any Node host; set `MONGO_URI`,
  `JWT_SECRET`, `CLIENT_ORIGIN` env vars; use a MongoDB Atlas connection string.
- **Frontend:** `npm run build` in `frontend/`, then deploy the `build/`
  folder to Vercel / Netlify; set `REACT_APP_API_URL` to your deployed API URL.

## 9. Out of Scope (Phase 1) — see PRD.md for full details

AI-based recommendations, integrated interview scheduling, integrated skill
training modules, and a native mobile app are intentionally excluded from
this phase and listed as future enhancements.
