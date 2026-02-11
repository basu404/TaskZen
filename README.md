# TaskZen – Productivity Dashboard

A full-stack productivity dashboard with secure JWT authentication and real-time task management.

> Note: “Real-time” here means the UI updates instantly after API actions. The current backend is REST-based (no WebSockets yet).

## Tech Stack

### Frontend

- React (Vite)
- TailwindCSS
- Axios
- React Router
- dnd-kit (drag & drop)

### Backend

- Node.js
- Express.js
- MongoDB Atlas (via Mongoose)
- JWT Authentication
- bcrypt (password hashing)


## Features

### 🔐 Authentication

- User registration
- Login with JWT
- Protected routes (Dashboard is gated behind auth)
- Profile viewing + editing (name/email + optional password change)
- Secure password hashing with bcrypt

### 📋 Task Management (CRUD)

- Create tasks
- Edit tasks (title/description/priority/due date/category)
- Delete tasks
- Toggle completion (tracks `completedAt`)
- Drag-and-drop reordering (persists order)
- Due dates & categories
- Search & filter
- Sorting options

### 📊 Dashboard

- Active & completed task stats
- Progress bar
- Calendar view
- Responsive layout

## Project Structure

Current structure in this repo:

```text
frontend/
  public/
  src/
    components/
      DashboardTailwind.jsx
      Dashboard.jsx
      Login.jsx
      Signup.jsx
      ProtectedRoute.jsx
      Auth.css
      Dashboard.css
    assets/
    App.jsx
    App.css
    main.jsx
    index.css
  vite.config.js
  package.json

backend/
  src/
    controllers/
      authController.js
      taskController.js
    middleware/
      auth.js
    models/
      User.js
      Task.js
    routes/
      auth.js
      tasks.js
  server.js
  package.json
```

Separation of concerns (high-level):

- Frontend handles UI, routing, and calling the REST API.
- Backend exposes REST endpoints for auth/profile and tasks, validates requests, and enforces authorization.
- MongoDB stores users and tasks (tasks are scoped per-user).

## Setup Instructions

### 1) Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file in `backend/`:

```bash
# backend/.env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000

# Optional (CORS allowlist for the frontend dev server)
CLIENT_ORIGIN=http://localhost:5173
```

Backend runs by default on `http://localhost:5000`.

### 2) Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file in `frontend/`:

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:5000
```

Frontend runs by default on `http://localhost:5173`.

## API Endpoints

Auth + Profile:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile` (Bearer token required)
- `PUT /api/auth/profile` (Bearer token required)

Tasks (all require Bearer token):

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/tasks/reorder`

Health check:

- `GET /api/health`

## Security Considerations

- Passwords are hashed using `bcryptjs` before storing in MongoDB.
- JWT auth middleware validates Bearer tokens and protects task/profile endpoints.
- Protected routes on the frontend prevent unauthenticated access to `/dashboard`.
- Authorization checks ensure users can only update/delete their own tasks.
- Sensitive configuration (MongoDB URI, JWT secret) is stored in environment variables.

## Scalability Note

This architecture is modular and can scale horizontally because authentication is stateless (JWT). The backend is organized by routes/controllers/models and can be extended by introducing a dedicated service layer, caching (Redis), and role-based access control if required. MongoDB can be optimized further with additional indexing and query tuning as the dataset grows.

## Future Improvements

- Role-based access control (RBAC)
- Refresh tokens + token rotation
- Real-time sync via WebSockets
- Dockerization (dev + production)
- CI/CD pipeline (lint/test/build/deploy)
