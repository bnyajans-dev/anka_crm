# Anka Travel CRM & Field Sales Management System

## Overview
Production-ready CRM and Field Sales Management System for Anka Travel, an educational tour company. The system manages schools, visits, offers, sales, appointments, performance tracking, expense management with profit calculation, and role-based access control.

## GitHub Repository
- **URL:** https://github.com/bnyajans-dev/anka_crm
- **Branch:** main
- **Push Commands:**
  ```bash
  git add .
  git commit -m "commit message"
  git push
  ```

## Project Architecture

### Tech Stack
- **Frontend:** React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL (External via EXTERNAL_DATABASE_URL)
- **ORM:** Drizzle ORM
- **State Management:** TanStack Query (React Query)
- **Routing:** Wouter
- **Internationalization:** Turkish UI text

### Key Directories
```
├── client/src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components (Dashboard, Schools, Sales, etc.)
│   ├── lib/            # Utilities, mockApi, auth context
│   └── hooks/          # Custom React hooks
├── server/
│   ├── routes.ts       # API endpoints
│   ├── storage.ts      # Database operations interface
│   └── db.ts           # Database connection
├── shared/
│   └── schema.ts       # Drizzle schema definitions
```

### User Roles (RBAC)
- **system_admin:** Full system access
- **admin:** Company-wide access
- **manager:** Team-level access
- **sales:** Individual sales rep access

### Database Schema
Key tables: users, teams, schools, visits, offers, sales, expenses, appointments, targets, announcements, audit_logs, cities, districts, tour_packages

## Recent Changes
- **2024-12-04:** Initial GitHub push completed
- **2024-12-04:** External PostgreSQL database connection configured (EXTERNAL_DATABASE_URL)
- **2024-12-04:** Expense management system with profit calculation implemented
- **2024-12-04:** Sale detail page with expense tracking created
- **2024-12-04:** Added "Satış Uzmanı" user (uzman@ankatravel.com) with sales role

## User Preferences
- All UI text in Turkish
- Codebase comments/variables in English
- Mobile-responsive design priority
- Real data over mock data preferred

## Environment Secrets
- DATABASE_URL / EXTERNAL_DATABASE_URL: PostgreSQL connection
- GITHUB_TOKEN: GitHub authentication for git operations
- GIT_URL: Configured for easy git push

## Development Notes
- Mock API (client/src/lib/mockApi.ts) retained for offline/development work
- Backend routes ready for production use
- Expense RBAC enforced at storage layer
