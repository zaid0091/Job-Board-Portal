# Job Board Portal 🚀

[![Django](https://img.shields.io/badge/Django-5.1-092e20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.2-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38b2ac?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ed?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

A comprehensive, full-stack Job Board Portal designed for seamless recruitment and job seeking. Built with a modern tech stack focusing on performance, scalability, and security.

![Job Board Logo](./frontend/public/logo.png)

## ✨ Features

### For Job Seekers
- **Advanced Job Search:** Filter jobs by category, location, salary range, and job type.
- **Personalized Dashboard:** Track application status (Pending, Interviewing, Hired, Rejected).
- **Profile Management:** Showcase your skills, experience, and upload resumes.
- **Notifications:** Real-time system and email alerts for job updates.
- **Google OAuth:** One-click registration and login.

### For Employers
- **Job Management:** Create, update, and manage job listings with a powerful editor.
- **Application Tracking:** Review candidate profiles and manage the hiring pipeline.
- **Analytics Dashboard:** Get insights into job performance and application trends.
- **Company Branding:** Customize company profiles and details.

## 🛠️ Tech Stack

### Backend
- **Core:** Python 3.12, Django 5.1
- **API:** Django REST Framework (DRF)
- **Auth:** JWT (SimpleJWT), Google OAuth 2.0
- **Database:** PostgreSQL
- **Caching & Tasks:** Redis, Celery, Celery Beat
- **Security:** Argon2 password hashing, Bleach HTML sanitization

### Frontend
- **Framework:** React 18 (TypeScript)
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS, Framer Motion (Animations)
- **Forms:** React Hook Form, Zod (Validation)
- **Icons:** Heroicons

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL & Redis

### Local Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/zaid0091/job-board-portal.git
   cd job-board-portal
   ```

2. **Backend Configuration:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements/base.txt  # Use base.txt for full dependencies
   cp .env.example .env  # Update variables in .env
   python manage.py migrate
   python manage.py runserver
   ```

4. **Running Background Tasks (Celery):**
   In a separate terminal:
   ```bash
   cd backend
   # Ensure Redis is running first
   celery -A config worker -l info
   ```

3. **Frontend Configuration:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env  # Update VITE_API_URL
   npm run dev
   ```

### Running with Docker

For a production-like environment:
```bash
docker-compose up --build
```

## 📈 Architecture

The project follows a clean separation of concerns:
- **Backend:** Modular Django apps (`users`, `jobs`, `applications`, `profiles`, `notifications`, `analytics`).
- **Frontend:** Atomic component structure with Redux for global state and RTK Query for API interactions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Antigravity AI](https://github.com/google-deepmind)
