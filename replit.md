# Berry Quality Inspector

## Overview

Berry Quality Inspector is a mobile-first field evaluation system designed for berry quality inspection with role-based access control. It enables field promoters to conduct evaluations at retail stores and provides supervisors, analysts, and administrators with tools for monitoring, analysis, and system configuration. The application focuses on quick data entry and comprehensive reporting, aiming to enhance the efficiency and accuracy of quality assessments in the field.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 20, 2025)

### Evaluation Fields Configuration System
- **Feature:** Admin-configurable evaluation field system for customizable workflow forms
- **Access:** Configuration viewing available to all roles; modification restricted to Admins only
- **Implementation:**
  - New `evaluation_fields` database table with full CRUD operations
  - RESTful API endpoints: GET, POST, PUT, DELETE `/api/evaluation-fields`
  - Configuration → Evaluaciones tab with 5 subtabs (Availability, Quality, Prices, Incidents, Custom Fields)
  - Each subtab displays fields specific to that evaluation step
  - Field properties: technicalName (camelCase), label, fieldType, options, required, order, active
- **Field Types Supported:**
  - text, number, select, multiselect, checkbox, textarea, photo
- **UI Features:**
  - Add/Edit/Delete field functionality with dialog forms
  - Activate/Deactivate toggle for individual fields
  - Real-time validation (technicalName must be camelCase, unique)
  - Options configuration for select/multiselect types (comma-separated)
  - Drag-and-drop order configuration
  - Visual badges showing field status (Active/Inactive, Required, Field Type)
- **Integration:**
  - Fields stored in database for persistence across sessions
  - Ready for integration into New Visit workflow for dynamic form rendering
  - Supports future custom field requirements without code changes
- **Use Cases:**
  - Customize evaluation criteria per business needs
  - Add region-specific or product-specific fields
  - Enable/disable fields without deleting historical data
  - Maintain field order for consistent UX

### Configurable Geofence Radius
- **Feature:** Store-specific geofence radius configuration for GPS validation
- **Access:** Supervisors and Administrators only
- **Implementation:**
  - Added `geofenceRadius` field to stores table (integer, default: 100 meters)
  - Configuration → Tiendas form includes "Radio de geovalla (metros)" field
  - Available in both create and edit store dialogs
  - Helper text guides users on purpose and default value
- **GPS Validation Logic:**
  - New Visit workflow uses dynamic `store.geofenceRadius` value
  - Falls back to 100 meters if not configured
  - Distance check: `inRange = distance <= (store.geofenceRadius || 100)`
- **Use Cases:**
  - Urban stores: Smaller radius (50-100m) for precise validation
  - Rural stores: Larger radius (200-500m) for flexibility
  - Custom scenarios: Adjustable per store needs

### Camera Photo Input Enhancement
- **Feature:** Added camera buttons to all photo fields in the evaluation workflow
- **Implementation:** New `CameraPhotoInput` component with:
  - Camera icon button that triggers device camera (mobile) or file picker (desktop)
  - Manual URL input option as alternative
  - Image preview with thumbnail display
  - Clear button to remove selected photos
  - Base64 encoding for captured images
  - HTML5 file input with `capture="environment"` for rear camera access
- **Affected Steps:**
  - Step 2 (Availability): Area Photo field
  - Step 3 (Quality): Product Photo field
  - Step 4 (Prices): Price Tag Photo field
- **UX Improvements:**
  - All photos remain optional
  - Users can choose between camera capture or URL entry
  - Instant preview of captured/selected images
  - Mobile-optimized for field work

### Previous Updates
- Evaluation completion bug fixes (apiRequest parameter order, data type validation)
- Incidents logic enhancement with "No incidents / Everything OK" mutual exclusion
- Location options expanded (added "Bodega" and "Góndola")
- Form state cleanup (removed deprecated POP material fields)

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