# Replit.md

## Overview

This is a full-stack web application built as an API proxy service that allows users to manage multiple AI APIs through a unified interface. The application provides a dashboard for managing API endpoints, model aliases, users, and monitoring request logs. It serves as a middleware layer between clients and various AI service providers, handling authentication, routing, and logging.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Proxy Logic**: Custom middleware for API request proxying
- **Session Management**: PostgreSQL-based session storage

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Storage Interface**: Abstracted storage layer with in-memory fallback for development

## Key Components

### Database Schema
The application uses five main tables:
- `apis`: Stores upstream API configurations (name, base URL, API key, model name)
- `model_aliases`: Maps friendly aliases to specific API configurations
- `api_users`: Manages user accounts with API keys and model permissions
- `request_logs`: Tracks all proxy requests with performance metrics and error logging
- `configuration`: Stores system-wide configuration settings as key-value pairs

### API Proxy Middleware
- Intercepts requests to `/v1/*` endpoints (OpenAI-compatible)
- Validates API keys against the `api_users` table
- Routes requests to appropriate upstream APIs based on model aliases
- Logs all requests with timing, token usage, and error information
- Handles authentication, authorization, and rate limiting

### Admin Interface
- Dashboard with real-time statistics
- API management for configuring upstream services
- Model alias management for friendly naming
- User management with permission controls
- Request log viewer with export functionality
- System configuration interface

### Authentication & Authorization
- API key-based authentication for proxy requests
- Permission-based access control (users have allowed model lists)
- Admin interface uses session-based authentication (implementation pending)

## Data Flow

1. **Proxy Requests**: Client → Proxy Middleware → Upstream API → Response Logging → Client
2. **Admin Operations**: Admin UI → Express Routes → Storage Layer → Database → Response
3. **Real-time Updates**: Database changes trigger React Query cache invalidation for live updates

## External Dependencies

### Core Runtime Dependencies
- `@neondatabase/serverless`: PostgreSQL serverless database connection
- `drizzle-orm`: Database ORM and query builder
- `express`: Web server framework
- `react` & `react-dom`: Frontend framework
- `@tanstack/react-query`: Server state management

### UI & Styling
- `@radix-ui/*`: Headless UI component primitives
- `tailwindcss`: Utility-first CSS framework
- `class-variance-authority`: Component variant management
- `lucide-react`: Icon library

### Development Tools
- `vite`: Build tool and development server
- `typescript`: Type checking
- `tsx`: TypeScript execution for development

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend development
- TSX for running TypeScript server code directly
- PostgreSQL database (local or Neon serverless)
- Replit-specific configurations for cloud development

### Production Build
- Vite builds the frontend to `dist/public`
- ESBuild bundles the server code to `dist/index.js`
- Express serves static files and API routes
- Database migrations managed through Drizzle Kit

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment mode (development/production)
- Port configuration: 5000 (configurable via environment)

## Changelog

```
Changelog:
- June 20, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```