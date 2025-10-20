# Berry Quality Inspector

## Overview

Berry Quality Inspector is a field evaluation system designed for berry quality inspection with role-based access control. The application serves field promoters who conduct quality evaluations at retail stores, as well as supervisors, analysts, and administrators who monitor and analyze the collected data. The system is mobile-first, optimized for quick data entry in field conditions, with comprehensive reporting and configuration capabilities for administrative users.

## Recent Changes

### October 2025 - Major System Enhancements (Three-Part Update)

#### 1. Reports and Analytics Module Update
- **Enhanced Filters:** Expanded from 3 to 6 filters with hierarchical dependencies
  - Date Range (first position, editable input field)
  - Chain (dropdown, updates zones dynamically)
  - Zone (dropdown, depends on selected chain)
  - Store (dropdown, depends on selected zone/chain)
  - User (dropdown, locked for promoters to their own user)
  - Product (dropdown, standard selection)
- **Layout:** Redesigned to 3-row grid layout (Date Range | Chain | Zone // Store | User | Product // Apply | Clear buttons)
- **Filter Dependencies:** Chain selection updates available zones → Zone selection updates available stores → Dynamic filtering without page reload
- **User Controls:** "Aplicar Filtros" (purple primary button) and "Limpiar Filtros" (gray outline button)
- **Role-Aware Behavior:** Promoters see their own user locked in the User filter; Analysts/Supervisors/Admins can select any promoter

#### 2. Database Tab Enhancement
- **New Section:** "Tablas de la Base de Datos" card displaying all PostgreSQL public schema tables
- **Table Information:** Shows table name (monospace font), schema, and owner for each table
- **Search Functionality:** Real-time search/filter by table name with case-insensitive matching
- **Data Source:** Fetches from pg_catalog.pg_tables via new GET /api/database/tables endpoint
- **UI Features:**
  - Alternating row colors for readability
  - Empty state when no tables found
  - "No se encontraron tablas" message when search returns no results
  - Clean table layout with emoji icon (🗂️) in header
- **Access Control:** Visible only for admin and supervisor roles

#### 3. Role-Based Navigation and Permissions
- **Sidebar Navigation:** Dynamic menu items based on user role
  - **Promoter:** Home, Visits only
  - **Analyst:** Home, Visits, Reports
  - **Supervisor:** Home, Visits, Reports, Configuration
  - **Administrator:** Home, Visits, Reports, Configuration
- **Implementation:** Menu items filtered by roles array in AppSidebar component
- **Progressive Access:** Clear hierarchy (Promoter → Analyst → Supervisor → Administrator) with each level adding more capabilities
- **Configuration Access:** Data Base tab within Configuration remains exclusive to admin/supervisor roles

### October 2025 - Multi-Store Assignment Feature
- **Feature:** Bulk store assignment for promoters with checkbox-based selection
- **Implementation:** Replaced single-store Select dropdown with scrollable checkbox list
- **UX Enhancements:**
  - "Seleccionar todas" (Select All) and "Limpiar" (Clear) buttons for bulk operations
  - Pre-checking of existing assignments when user is selected
  - Real-time counter showing number of selected stores
  - Wider dialog (max-w-2xl) with scrollable store list (max-height 300px)
- **Backend Logic:** Calculates delta between existing and new selections to add/remove assignments in one action
- **Validation:** Case-insensitive duplicate detection across all configuration modules (Users, Chains, Zones, Stores, Products) using PostgreSQL `ilike` operator

### October 2025 - Database Backup Feature
- **Feature:** Password-protected database structure backup for administrators
- **Access Control:** Exclusive to admin and supervisor roles
- **Security:** Password-protected (Cari2230*) backup generation
- **Backup Content:** Database structure only (schema, tables, columns) - no sensitive data
- **Implementation:**
  - "Data Base" tab in Configuration (conditionally rendered based on user role)
  - Password validation dialog before backup generation
  - SQL file generation using information_schema queries
  - Automatic backup logging in backup_logs table
  - Backup history display with filename, admin user, and timestamp
- **Backend:** SQL structure extraction via PostgreSQL information_schema with CREATE TABLE statement generation

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework Stack:**
- React with TypeScript for type safety and component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching
- Tailwind CSS for utility-first styling

**UI Component System:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library (New York style variant) for pre-built UI components
- Custom design system based on a purple/blue/green gradient palette
- CSS variables for theme customization supporting both light and dark modes
- Mobile-first responsive design with compact spacing for field usability

**State Management:**
- React Query for server state with infinite stale time and disabled auto-refetching
- Session-based authentication with passport.js
- Local React state for UI interactions and form handling
- React Hook Form with Zod validation for form management

**Key Design Decisions:**
- **Problem:** Need for rapid data entry in field conditions
- **Solution:** Compact, utility-focused UI with role-adaptive interfaces
- **Rationale:** Primary users are field promoters on mobile devices requiring quick, efficient workflows

### Backend Architecture

**Server Framework:**
- Express.js on Node.js with TypeScript
- ESM module system throughout
- Session-based authentication using passport-local strategy
- Memory store for development sessions (with plans for PostgreSQL session store via connect-pg-simple)

**Authentication & Authorization:**
- Scrypt-based password hashing with salt for security
- Role-based access control with four levels: admin, supervisor, analyst, promoter
- Session middleware with secure cookie configuration
- Route-level authorization using requireAuth and requireRole middleware

**API Design:**
- RESTful API endpoints under `/api` prefix
- CRUD operations for: users, chains, zones, stores, products, evaluations, incidents
- Role-specific data filtering (promoters see only their assignments)
- Structured error handling with status codes and descriptive messages

**Database Layer:**
- Drizzle ORM for type-safe database operations
- Neon serverless PostgreSQL via WebSocket connections
- Schema-driven development with automatic TypeScript type inference
- Migration support through drizzle-kit

**Key Design Decisions:**
- **Problem:** Need for type safety across client and server
- **Solution:** Shared TypeScript schema definitions in `/shared` directory
- **Rationale:** Single source of truth for data models prevents type mismatches
- **Alternatives:** Separate schema definitions, GraphQL
- **Pros:** Simpler architecture, better IDE support, reduced code duplication
- **Cons:** Tighter coupling between frontend and backend

### Data Models

**Core Entities:**
- **Users:** Username, email, password (hashed), name, role, active status
- **Chains:** Retail chain information (HEB, La Comer, etc.)
- **Zones:** Geographic zones within chains
- **Stores:** Individual store locations with city and address
- **Products:** Berry products with icons and colors for visual identification
- **Store Assignments:** Many-to-many relationship between promoters and stores
- **Evaluations:** Quality inspection records with stock, freshness, appearance data
- **Incidents:** Issue reports (expired products, incorrect pricing, etc.)

**Relationship Hierarchy:**
- Chains → Zones → Stores → Evaluations
- Users (promoters) ← Store Assignments → Stores
- Evaluations → Incidents (one-to-many)

**Key Design Decisions:**
- **Problem:** Need for multi-step evaluation workflow
- **Solution:** Separate tables for evaluations and incidents with foreign key relationships
- **Rationale:** Allows flexible incident reporting without bloating evaluation records
- **Pros:** Normalized data structure, easier reporting and analytics
- **Cons:** More complex queries for complete evaluation data

## External Dependencies

### Database
- **Neon Serverless PostgreSQL:** Cloud-hosted PostgreSQL database with WebSocket support
- **Connection:** Via `@neondatabase/serverless` package with connection pooling
- **Schema Management:** Drizzle ORM with migration support
- **Environment Variable:** `DATABASE_URL` (required)

### Third-Party Services
- **Session Storage:** Currently using in-memory store (memorystore), with support for PostgreSQL session store (connect-pg-simple) for production
- **Development Tools:** Replit-specific plugins for runtime error overlay, cartographer, and dev banner

### Key External Libraries
- **Authentication:** passport.js with local strategy for username/password authentication
- **Validation:** Zod for schema validation and type inference
- **Data Visualization:** Recharts for charts and analytics in reports
- **Form Management:** React Hook Form with @hookform/resolvers for validation integration
- **Password Hashing:** Node.js native crypto (scrypt) with bcryptjs as fallback
- **Icons:** Lucide React for consistent icon system

### Build & Development
- **TypeScript:** Strict type checking with path aliases (@, @shared, @assets)
- **PostCSS:** With Tailwind CSS and Autoprefixer
- **ESBuild:** For server-side bundling in production
- **TSX:** For running TypeScript files in development

**Key Design Decisions:**
- **Problem:** Need for serverless-compatible database connections
- **Solution:** Neon serverless PostgreSQL with WebSocket support
- **Rationale:** Avoids connection pool exhaustion in serverless environments
- **Alternatives:** Traditional PostgreSQL with connection pooling
- **Pros:** Better scalability, managed infrastructure, automatic connection management
- **Cons:** WebSocket dependency, vendor lock-in considerations