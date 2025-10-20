# Berry Quality Inspector

## Overview

Berry Quality Inspector is a mobile-first field evaluation system designed for berry quality inspection with role-based access control. It enables field promoters to conduct evaluations at retail stores and provides supervisors, analysts, and administrators with tools for monitoring, analysis, and system configuration. The application focuses on quick data entry and comprehensive reporting, aiming to enhance the efficiency and accuracy of quality assessments in the field.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend uses React with TypeScript, Vite, Wouter for routing, TanStack Query for server state, and Tailwind CSS for styling. It features a custom design system with a purple accent, built with Radix UI and shadcn/ui components, optimized for mobile-first responsiveness and rapid data entry in field conditions. State management combines React Query for server state, local React state for UI, and React Hook Form with Zod for form handling and validation. The application includes a comprehensive 5-step evaluation workflow with dynamic validation, geolocation integration, and conditional UI rendering.

### Backend

The backend is built with Express.js on Node.js and TypeScript, using an ESM module system. It implements session-based authentication with `passport.js` and `scrypt`-based password hashing, supporting four role levels: admin, supervisor, analyst, and promoter. The RESTful API provides CRUD operations for core entities like users, chains, stores, products, and evaluations, with role-specific data filtering and structured error handling. Drizzle ORM is used for type-safe database interactions with Neon serverless PostgreSQL, following a schema-driven development approach with shared TypeScript schema definitions between frontend and backend.

### Data Models

Core entities include Users, Chains, Zones, Stores, Products, Store Assignments, Evaluations, and Incidents. The data model supports a hierarchical relationship from Chains to Zones to Stores and Evaluations, with a many-to-many relationship for Store Assignments between promoters and stores. Evaluations and Incidents are separated to allow flexible incident reporting without bloating evaluation records, ensuring a normalized data structure for better reporting and analytics.

### System Features

Key features include:
- A 5-step evaluation system with geolocation, product selection, availability, quality assessment, pricing, and incident reporting.
- Role-based access control (RBAC) with dynamic sidebar navigation and permissions.
- Enhanced reports and analytics module with multi-level filtering.
- Multi-store assignment functionality for promoters.
- Database table viewer and password-protected database structure backup for administrators.
- Comprehensive form validation and conditional field rendering.

## External Dependencies

### Database
- **Neon Serverless PostgreSQL:** Cloud-hosted PostgreSQL with WebSocket support for serverless compatibility.
- **Drizzle ORM:** Used for type-safe database interactions and schema management.

### Third-Party Services
- **`passport.js`:** For authentication strategies.
- **`Zod`:** For schema validation and type inference.
- **`Recharts`:** For data visualization in reports.
- **`React Hook Form`:** For form management.
- **`Lucide React`:** For iconography.
- **`memorystore` / `connect-pg-simple`:** For session storage (in-memory for dev, PostgreSQL for prod).

### Build & Development Tools
- **Vite:** Frontend build tool.
- **ESBuild:** Backend bundling.
- **TypeScript:** For type checking across the stack.
- **PostCSS with Tailwind CSS:** For styling.