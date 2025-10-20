# Berry Quality Inspector

## Overview

Berry Quality Inspector is a field evaluation system designed for quality inspection of berry products across retail chains. The application enables promoters to conduct on-site evaluations of product quality, availability, and display conditions while providing administrators with comprehensive analytics and reporting capabilities. The system follows a mobile-first design approach, optimized for field workers using smartphones and tablets.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query for server state management and data fetching
- Tailwind CSS with shadcn/ui component library for styling

**Design System**
- Utility-focused, mobile-first approach optimized for field data collection
- Role-adaptive interface that adjusts based on user permissions (Admin, Supervisor, Analyst, Promoter)
- Custom theme system supporting light/dark modes with HSL-based color tokens
- Compact spacing and layout to maximize visible content on mobile devices
- Gradient accents on key metric displays (purple-blue gradient from hsl(250,84%,54%) to hsl(217,91%,60%))

**Component Organization**
- Reusable UI components in `/client/src/components/ui/` (shadcn/ui primitives)
- Custom business components like MetricCard, BerryCard, ProgressSteps, StatsCard
- Page-level components in `/client/src/pages/` (Dashboard, Visits, Reports, Configuration, Login)
- AppSidebar for navigation with role-based menu items

**State Management Strategy**
- TanStack Query for all server data with `queryClient` configuration
- Custom `apiRequest` helper for standardized API calls with credential inclusion
- Local state with React hooks for UI-specific interactions
- Session-based authentication state managed through query invalidation

### Backend Architecture

**Technology Stack**
- Express.js for HTTP server and API routing
- TypeScript for type safety across the stack
- Drizzle ORM for database interactions
- Passport.js with Local Strategy for authentication
- Express-session with configurable store (memory store in development)

**Authentication & Authorization**
- Session-based authentication using secure password hashing (scrypt with random salt)
- Role-based access control with middleware (`requireAuth`, `requireRole`)
- Four user roles: admin, supervisor, analyst, promotor
- Password hashing utility separates hash and salt with dot notation

**API Design**
- RESTful endpoints under `/api` namespace
- Auth routes: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- Resource routes for users, chains, zones, stores, products, evaluations, incidents
- Role-based endpoint protection (e.g., user management requires admin/supervisor)
- Request/response logging middleware for API debugging

**Code Organization**
- `/server/routes.ts` - API route definitions and handlers
- `/server/auth.ts` - Authentication configuration and utilities
- `/server/storage.ts` - Database abstraction layer with IStorage interface
- `/server/db.ts` - Database connection and Drizzle instance
- `/server/vite.ts` - Development server integration

### Data Storage

**Database Solution**
- PostgreSQL via Neon serverless driver with WebSocket support
- Drizzle ORM for type-safe schema definitions and queries
- Schema defined in `/shared/schema.ts` for sharing types between frontend and backend

**Database Schema**
- **users**: id, username, password, email, name, role, active, createdAt
- **chains**: id, name, description, createdAt (retail chain entities)
- **zones**: id, chainId, name, description, createdAt (geographic zones within chains)
- **stores**: id, zoneId, name, city, address, active, createdAt
- **products**: id, name, icon, color, active, createdAt (berry products being evaluated)
- **storeAssignments**: id, storeId, userId, assignedAt (promoter-to-store assignments)
- **evaluations**: id, storeId, userId, productId, visitDate, stock, location, displayCondition, freshness, appearance, packageCondition, priceCorrect, priceIssueDescription, photos, comments, completedAt
- **incidents**: id, evaluationId, incidentType, description, severity, resolvedAt, createdAt

**Schema Validation**
- Zod schemas generated from Drizzle tables using `drizzle-zod`
- Shared validation schemas for insert operations (InsertUser, InsertChain, etc.)
- Type inference for both select and insert operations

**Migration Strategy**
- Drizzle Kit for schema migrations
- Migration files stored in `/migrations` directory
- `db:push` npm script for applying schema changes

### External Dependencies

**Third-Party UI Libraries**
- Radix UI primitives for accessible, unstyled components (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, label, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, tooltip)
- Recharts for data visualization (bar charts, pie charts, line charts)
- date-fns for date formatting and manipulation
- cmdk for command palette functionality
- lucide-react for icon library

**Development Tools**
- @replit/vite-plugin-runtime-error-modal for error overlay in development
- @replit/vite-plugin-cartographer for Replit integration
- tsx for running TypeScript directly in development
- esbuild for production server bundle

**Database & Session**
- @neondatabase/serverless for PostgreSQL connection
- connect-pg-simple for PostgreSQL session store (configured but using memory store)
- ws for WebSocket support in Neon driver

**Security & Validation**
- bcryptjs for password hashing (alternative to native crypto scrypt)
- zod for schema validation
- @hookform/resolvers for form validation integration

**Routing & State**
- wouter for lightweight routing (alternative to react-router)
- @tanstack/react-query for server state management