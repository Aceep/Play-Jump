# Gane - Full-Stack Game Platform

A game-ready web application built with React (TypeScript), Rust (Axum), and PostgreSQL, featuring authentication and WebSocket support.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Rust + Axum + SQLx
- **Database**: PostgreSQL 15
- **Authentication**: JWT-based with email/password + guest access
- **Communication**: REST API + WebSocket-ready

## Features

### Authentication
- Email/password registration and login
- Guest access (no registration required)
- JWT-based session management
- Protected routes with middleware

### User Management
- User model with email, password, and guest support
- Password hashing with Argon2
- Session persistence

### WebSocket Ready
- Prepared WebSocket endpoint at `/ws` (implementation pending)

## Architecture

```
gane/
├── frontend/          # React TypeScript application
│   ├── src/
│   │   ├── pages/    # Landing, Login, Register, Game
│   │   ├── api/      # Typed API client
│   │   └── ...
│   └── Dockerfile
├── backend/           # Rust Axum API server
│   ├── src/
│   │   ├── handlers/ # Auth endpoints
│   │   ├── models/   # User model
│   │   ├── middleware/ # Auth middleware
│   │   └── ...
│   ├── migrations/   # Database migrations
│   └── Dockerfile
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- (Optional) Rust and Node.js for local development

### Running the Application

1. **Clone and navigate to the project**:
   ```bash
   cd /home/alycgaut/gane
   ```

2. **Configure environment variables**:
   The `.env` file is already set up with default values. For production, update:
   - `JWT_SECRET` - Use a strong random string
   - `POSTGRES_PASSWORD` - Use a secure password

3. **Start all services**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - Database: localhost:5432

### First Time Setup

The backend will automatically run database migrations on startup, creating the necessary tables.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/guest` - Create guest session
- `POST /api/auth/logout` - Logout current session
- `GET /api/auth/me` - Get current user info

### WebSocket (Prepared)

- `GET /ws` - WebSocket connection endpoint (implementation pending)

## Development

### Hot Reload

- **Frontend**: Hot reload enabled via Vite
- **Backend**: Volume mounted for code changes (requires manual rebuild)

### Running Tests

```bash
# Backend tests
cd backend
cargo test

# Frontend tests
cd frontend
npm test
```

### Database Migrations

Migrations are located in `backend/migrations/` and run automatically on startup.

To create a new migration:
```bash
cd backend
sqlx migrate add <migration_name>
```

## User Flow

### Landing Page (`/`)

**Not Authenticated**:
- "Play as Guest" button → Creates guest session → Redirects to `/game`
- "Login" button → Redirects to `/login`
- "Register" button → Redirects to `/register`

**Authenticated**:
- Shows user email or "Guest User"
- "Start Game" button → Redirects to `/game`
- "Logout" button → Logs out and reloads

### Game Page (`/game`)

Currently a placeholder view. This is where game logic will be implemented in the future.

## Mobile Support

The frontend is fully responsive and optimized for mobile devices.

## Project Status

### ✅ Implemented
- Docker containerization with hot reload
- Complete authentication system
- User model with guest support
- Protected routes and middleware
- Typed frontend API client
- Mobile-responsive UI
- Database migrations

### 🔄 Prepared (Not Implemented)
- WebSocket endpoint structure
- Game logic and gameplay

## Security Notes

- Passwords are hashed using Argon2
- JWT tokens for session management
- CORS configured for frontend access
- Environment variables for sensitive data

## Future Enhancements

- Implement WebSocket communication for real-time gameplay
- Add game logic and mechanics
- User profile management
- Leaderboards and statistics
- Password reset functionality
- Email verification

## Troubleshooting

### Port Already in Use
```bash
# Change ports in docker-compose.yml or stop conflicting services
docker-compose down
```

### Database Connection Issues
```bash
# Reset database volume
docker-compose down -v
docker-compose up --build
```

### Frontend Not Loading
```bash
# Rebuild frontend container
docker-compose up --build frontend
```

## License

MIT
