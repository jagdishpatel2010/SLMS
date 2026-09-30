# Online Student Course & Learning Management System (SLMS)

A full-stack MERN application where students register, browse and enroll in
courses, work through lessons, take quizzes, and track their learning progress.
Admins manage courses, lessons, quizzes, and students.

- **Frontend:** React (Vite), React Router, Axios, PropTypes
- **Backend:** Node.js, Express, PostgreSQL (Sequelize ORM), JWT authentication
- **Auth:** JWT stored in an httpOnly cookie, with role-based access
  (`student` / `admin`)

---

## Project structure

```
Student/
├── backend/                 # Express + MongoDB API
│   ├── src/
│   │   ├── config/          # env + database connection
│   │   ├── controllers/     # route handlers (auth, course, lesson, quiz, ...)
│   │   ├── middleware/      # auth, validation, rate limiting, error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── utils/           # token, ApiError, asyncHandler
│   │   ├── app.js           # Express app (middleware + routes)
│   │   ├── server.js        # entry point (connects DB, starts server)
│   │   └── seed.js          # demo data seeding script
│   ├── .env.example
│   └── package.json
│
└── frontend/                # React (Vite) single-page app
    ├── src/
    │   ├── components/       # reusable UI (Navbar, CourseCard, Spinner, ...)
    │   ├── pages/            # route pages (Login, Catalogue, Learning, ...)
    │   ├── context/          # Auth + Toast providers
    │   ├── hooks/            # useForm
    │   ├── services/         # API call wrappers
    │   ├── utils/            # axios instance
    │   ├── assets/styles/    # global styles
    │   ├── App.jsx           # route table
    │   └── index.jsx         # entry point
    ├── .env.example
    └── package.json
```

---

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** running locally (default `localhost:5432`) or a hosted
  Postgres connection string. Create an empty database named `slms` (or set
  `PGDATABASE` / `DATABASE_URL` to match your own).

---

## Getting started

> Note: there is no root `package.json`. Run npm commands **inside** the
> `backend` and `frontend` folders separately.

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env      # macOS/Linux: cp .env.example .env
```

Edit `.env` and set at least a `JWT_SECRET` (any long random string) and your
PostgreSQL settings (`PGUSER`, `PGPASSWORD`, `PGDATABASE`, ... or a single
`DATABASE_URL`). Make sure the target database exists:

```sql
CREATE DATABASE slms;
```

Seed demo data (drops and recreates all tables, then inserts demo content):

```bash
npm run seed
```

Start the API:

```bash
npm run dev      # with auto-reload (nodemon)
# or
npm start
```

The API runs on `http://localhost:5000`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` calls to the
backend automatically (configured in `vite.config.js`).

### Demo accounts (after seeding)

| Role    | Email               | Password    |
| ------- | ------------------- | ----------- |
| Admin   | admin@slms.test     | admin123    |
| Student | student@slms.test   | student123  |

---

## Features

**Students**

- Register, log in, log out, and a forgot-password screen
- Browse the course catalogue with search, category/level filters, and sorting
- View course details (modules, lessons, quizzes) and enroll
- Learning interface: read lessons, open video links, move next/previous, mark
  lessons complete
- Take quizzes and see graded results (total, correct, wrong, percentage,
  pass/fail)
- Dashboard: enrolled/in-progress/completed counts, per-course progress bars,
  and quiz scores

**Admins**

- Create, edit, and delete courses (cascades to lessons and quizzes)
- Add, edit, and delete lessons per course
- Build quizzes with multiple questions and options, marking the correct answer
- View and remove students

---

## API endpoints

Base URL: `/api`

### Auth
| Method | Path             | Access | Description                |
| ------ | ---------------- | ------ | -------------------------- |
| POST   | `/auth/register` | public | Register + start session   |
| POST   | `/auth/login`    | public | Log in                     |
| POST   | `/auth/logout`   | any    | Log out (clears cookie)    |
| GET    | `/auth/me`       | auth   | Current user               |

### Courses
| Method | Path                     | Access  | Description                      |
| ------ | ------------------------ | ------- | -------------------------------- |
| GET    | `/courses`               | public  | List (search/filter/sort)        |
| GET    | `/courses/meta/categories`| public | Distinct categories              |
| GET    | `/courses/:id`           | public  | Course detail + lessons/quizzes  |
| POST   | `/courses`               | admin   | Create                           |
| PUT    | `/courses/:id`           | admin   | Update                           |
| DELETE | `/courses/:id`           | admin   | Delete (cascade)                 |
| POST   | `/courses/:id/enroll`    | student | Enroll                           |

### Lessons
| Method | Path                | Access | Description            |
| ------ | ------------------- | ------ | ---------------------- |
| GET    | `/lessons/:courseId`| auth   | Lessons for a course   |
| POST   | `/lessons`          | admin  | Create                 |
| PUT    | `/lessons/:id`      | admin  | Update                 |
| DELETE | `/lessons/:id`      | admin  | Delete                 |

### Enrollments
| Method | Path                                                | Access | Description             |
| ------ | --------------------------------------------------- | ------ | ----------------------- |
| GET    | `/enrollments`                                      | auth   | My enrollments          |
| GET    | `/enrollments/:courseId`                            | auth   | My enrollment (course)  |
| PATCH  | `/enrollments/:courseId/lessons/:lessonId/complete` | auth   | Mark lesson complete    |

### Quizzes
| Method | Path                    | Access | Description                    |
| ------ | ----------------------- | ------ | ------------------------------ |
| GET    | `/quizzes/:courseId`    | auth   | Quizzes for a course (no answers) |
| GET    | `/quizzes/single/:id`   | auth   | One quiz to take (no answers)  |
| POST   | `/quizzes`              | admin  | Create with answer key         |
| PUT    | `/quizzes/:id`          | admin  | Update                         |
| DELETE | `/quizzes/:id`          | admin  | Delete                         |
| POST   | `/quizzes/:id/submit`   | auth   | Submit answers, get result     |

### Progress & Admin
| Method | Path                    | Access | Description                 |
| ------ | ----------------------- | ------ | --------------------------- |
| GET    | `/progress`             | auth   | Learning-progress summary   |
| GET    | `/admin/students`       | admin  | List students               |
| DELETE | `/admin/students/:id`   | admin  | Remove a student (cascade)  |

---

## Database tables (PostgreSQL)

- `users` — students and admins (hashed passwords)
- `courses` — course catalogue
- `lessons` — lessons belonging to courses (FK `courseId`)
- `quizzes` — quizzes belonging to courses (FK `courseId`)
- `questions` — quiz questions with options + answer key (FK `quizId`)
- `enrollments` — student ↔ course links + progress (unique `studentId`+`courseId`)
- `completed_lessons` — join table of completed lessons per enrollment
- `quiz_results` — graded quiz submissions

Tables and foreign keys are created automatically by Sequelize
(`sequelize.sync`) on server start / seed; no manual migrations are required.

---

## Security notes

- Passwords hashed with bcrypt; the hash is excluded from queries by a
  Sequelize `defaultScope` and never returned by the API.
- Queries use the Sequelize ORM (parameterized) — no raw string-built SQL.
- JWT stored in an httpOnly cookie (mitigates XSS token theft); `sameSite` set
  to mitigate CSRF; `secure` enabled in production.
- Quiz correct-answers are stored and graded server-side only, never sent to
  students before grading.
- Input validated with express-validator; rate limiting applied globally and
  more strictly on auth endpoints.
- No secrets are hard-coded; configuration is read from environment variables
  (`.env`, which is git-ignored).
```
