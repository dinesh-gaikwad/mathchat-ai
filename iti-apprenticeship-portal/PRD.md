# Product Requirements Document (Reference)
## ITI Apprenticeship & Trade Job Matching Portal

> This file mirrors the original project brief provided by Unified Mentor, kept
> alongside the codebase for reviewer reference.

**Context:** ITI/diploma graduates struggle to find apprenticeships & trade jobs
because openings are shared informally (notice boards, local contacts).
Workshops/factories similarly struggle to find skilled candidates
(electricians, welders, mechanics, machinists, technicians). This portal is a
centralized digital bridge between the two sides.

**Reference organizations:** National Skill Development Corporation, National
Apprenticeship Promotion Scheme, Apna (blue-collar job matching platform).

### Phase 1 — In Scope (fully implemented in this codebase)
- Student registration & profile creation
- Employer registration & job posting
- Apprenticeship and job listings
- Job search & filtering (keyword, trade skill, location, job type)
- Application submission system
- Candidate shortlisting by employers
- Admin management panel (approvals, moderation, analytics)

### Phase 1 — Out of Scope (future enhancements, not built here)
- Online interview scheduling system
- AI-based job recommendation system
- Integrated skill training modules
- Native mobile application
- Integration with government apprenticeship schemes

### Required Pages (all implemented)
1. Login / Register
2. Job Listing (search & filter)
3. Job Details
4. Application Page
5. Student Dashboard
6. Employer Panel
7. Admin Panel
8. Home (landing page)

### Non-Functional Requirements — how this codebase addresses them
| Requirement                     | Implementation |
|----------------------------------|-----------------|
| Secure authentication            | bcrypt password hashing + JWT tokens |
| Role-based access control        | `allowRoles()` middleware per route group |
| Mobile-responsive interface      | CSS grid with `auto-fit`/`minmax`, mobile breakpoints |
| Fast job search                  | MongoDB text + field indexes on Job model |
| Secure data storage              | Mongoose schema validation, hashed passwords, `.env` secrets |
| Scalable architecture            | Stateless REST API, separate frontend/backend, ready for horizontal scaling |

### Key Performance Indicators (tracked live in Admin → Analytics tab)
- Number of registered students
- Number of job postings (total & active)
- Job application rate
- Employer engagement rate (pending vs. approved employers)
- Successful apprenticeship placements (applications marked "hired")

### Assumptions carried into this build
- Workshops/factories actively post openings (seed data models 3 employers, 5 jobs)
- Students regularly check listings (dashboard shows live application status)
- Accuracy of job details depends on the employer providing them at posting time
