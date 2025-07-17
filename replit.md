# Sprint Management Dashboard

## Overview

This is a full-stack web application for managing sprint items and team workflows. It combines a React frontend with an Express backend, using PostgreSQL for data persistence and a comprehensive UI component library for a polished user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Management**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **API Pattern**: RESTful API with CRUD operations
- **Validation**: Zod schemas for request/response validation

### Development Architecture
- **Monorepo Structure**: Shared schema and types between client/server
- **Module Resolution**: ESM modules throughout
- **Development Server**: Vite dev server with Express API proxy
- **Build Process**: Separate client and server builds

## Key Components

### Database Schema
- **Sprint Items**: Core entity with status tracking, refinement workflow, and time management
- **Users**: Simple user management with username, name, and initials
- **Enums**: Status and refinement status enums for type safety

### API Endpoints
- `GET /api/sprint-items` - Retrieve all sprint items
- `GET /api/sprint-items/:id` - Retrieve specific sprint item
- `POST /api/sprint-items` - Create new sprint item
- `PUT /api/sprint-items/:id` - Update existing sprint item
- `DELETE /api/sprint-items/:id` - Delete sprint item
- `GET /api/users` - Retrieve all users

### UI Components
- **Dashboard Tabs**: Sprint, Refinement, Backlog, and Reports views
- **Data Tables**: Sortable, filterable tables for item management
- **Modal Forms**: Create/edit sprint items with validation
- **Filter Controls**: Sprint and assignee filtering
- **Summary Statistics**: Real-time stats display

### Storage Layer
- **Interface**: IStorage interface for data operations
- **Implementation**: MemStorage for development (in-memory)
- **Future**: Database implementation planned for production

## Data Flow

1. **Client Request**: React components trigger API calls through TanStack Query
2. **API Processing**: Express routes handle requests, validate with Zod schemas
3. **Data Access**: Storage layer (currently in-memory) manages data persistence
4. **Response**: JSON responses returned to client with proper error handling
5. **UI Updates**: React Query automatically updates UI on data changes

## External Dependencies

### Core Framework Dependencies
- React ecosystem (react, react-dom, react-hook-form)
- Express.js with TypeScript support
- Vite for build tooling

### UI and Styling
- Tailwind CSS for utility-first styling
- Radix UI primitives for accessible components
- Lucide React for icons
- shadcn/ui component library

### Database and Validation
- Drizzle ORM for type-safe database operations
- Neon Database for serverless PostgreSQL
- Zod for schema validation

### Development Tools
- TypeScript for type safety
- ESBuild for server bundling
- TSX for TypeScript execution

## Deployment Strategy

### Development
- **Client**: Vite dev server on default port
- **Server**: Express server with tsx for TypeScript execution
- **Database**: PostgreSQL via Neon Database connection
- **Hot Reload**: Vite HMR for client, tsx watch mode for server

### Production Build
- **Client**: Vite build outputs to `dist/public`
- **Server**: ESBuild bundles server code to `dist/index.js`
- **Static Assets**: Client build serves static files in production
- **Database**: Production PostgreSQL database via DATABASE_URL

### Environment Configuration
- **Development**: NODE_ENV=development, Vite dev server
- **Production**: NODE_ENV=production, static file serving
- **Database**: DATABASE_URL environment variable required
- **Replit Integration**: Special handling for Replit environment variables

The application is designed to be easily deployable on platforms like Replit, with automatic detection of the environment and appropriate configuration for development vs production modes.