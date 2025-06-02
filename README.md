# Family Task Planner

A modern, minimalistic family task planning application built with a microservices architecture.

## Tech Stack

### Backend
- **Python 3.13** with **FastAPI**
- **SQLAlchemy** ORM with **PostgreSQL**
- **Pydantic** for data validation
- **mypy** for static type checking
- **pytest** for unit testing
- **Alembic** for database migrations
- **Babel** for internationalization

### Frontend
- **React 18** with **TypeScript**
- **Vite** for build tooling
- **Vitest** for unit testing
- **React i18next** for internationalization
- **Axios** for API communication

### Infrastructure
- **Docker & Docker Compose** for containerization
- **PostgreSQL** database
- **Adminer** for database administration
- **Playwright** for E2E testing
- **GitHub Actions** for CI/CD

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.13+ (for local development)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd family-board-windsurf-claude-sonnet-4-python
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your preferred settings.

3. **Start the application**
   ```bash
   docker compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Database Admin (Adminer): http://localhost:8080

## Development

### Local Development Setup

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

3. **E2E Tests Setup**
   ```bash
   cd e2e-tests
   npm install
   npx playwright install chromium
   ```

### Running Tests

#### Backend Tests
```bash
cd backend
pytest tests/ -v --cov=app
```

#### Frontend Tests
```bash
cd frontend
npm run test
npm run test:coverage
```

#### E2E Tests
```bash
# Start the application first
docker compose up -d

# Run E2E tests
cd e2e-tests
npm test
```

#### Type Checking
```bash
# Backend
cd backend
mypy app --ignore-missing-imports

# Frontend
cd frontend
npx tsc --noEmit
```

### Database Migrations

```bash
cd backend

# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Downgrade migrations
alembic downgrade -1
```

## CI/CD with GitHub Actions

The project includes a comprehensive CI/CD pipeline that runs:

- Backend unit tests with coverage
- Frontend unit tests with coverage
- Type checking (mypy for Python, tsc for TypeScript)
- Linting
- E2E tests with Playwright
- Docker build verification

### Local CI Testing with ACT

Install ACT to run GitHub Actions locally:

```bash
# Install ACT (macOS)
brew install act

# Run the CI pipeline locally (non-interactive)
act --container-daemon-socket - --pull=false
```

## Project Structure

```
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configuration
│   │   ├── crud/           # Database operations
│   │   ├── db/             # Database setup
│   │   ├── models/         # SQLAlchemy models
│   │   └── schemas/        # Pydantic schemas
│   ├── alembic/            # Database migrations
│   ├── tests/              # Backend tests
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── i18n/           # Internationalization
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── package.json
├── e2e-tests/              # Playwright E2E tests
│   ├── tests/
│   └── playwright.config.ts
├── .github/workflows/      # GitHub Actions
├── docker-compose.yml      # Docker services
└── .env.example           # Environment template
```

## Features

### Current Features
- ✅ Dockerized microservices architecture
- ✅ User management (CRUD operations)
- ✅ Internationalization (English/French)
- ✅ Type-safe API with strong typing
- ✅ Comprehensive testing suite
- ✅ CI/CD pipeline

### Planned Features
- 🔄 Task management
- 🔄 Family member roles and permissions
- 🔄 Task assignment and tracking
- 🔄 Calendar integration
- 🔄 Notifications
- 🔄 Mobile responsiveness

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Run tests locally: `act --container-daemon-socket -`
4. Submit a Pull Request to `develop`

## License

This project is licensed under the MIT License.
