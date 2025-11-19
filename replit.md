# Trust Score for AI Output

## Overview

A web application that analyzes text (particularly AI-generated content) and provides a comprehensive Trust Score (0-100) based on claim verification. The system extracts individual claims from input text, searches for supporting evidence, and assigns verification statuses (Supported/Unclear/Contradicted) to each claim, culminating in an overall trust score with human-readable explanations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Library**: Shadcn UI components built on Radix UI primitives with Tailwind CSS for styling

**Animation**: Framer Motion for micro-interactions and state transitions, aligned with design guidelines emphasizing smooth visual feedback

**State Management**: TanStack Query (React Query) for server state management with optimistic updates and caching

**Routing**: Wouter for lightweight client-side routing

**Design System**:
- Typography: Inter for UI text, JetBrains Mono for technical/claim content
- Dual theme support (light/dark mode) with HSL-based color system
- Spacing follows Tailwind's 4px scale (2, 4, 6, 8, 12, 16, 20, 24 units)
- Responsive grid: single column mobile, 2/3 results + 1/3 history sidebar on desktop

**Key Components**:
- `AnalysisInput`: Text input with validation and character counting
- `AnalysisResults`: Trust score visualization with explanation
- `TrustScoreGauge`: SVG-based circular gauge with animated fill
- `ClaimCard`: Collapsible cards showing individual claim verification
- `AnalysisHistory`: Sidebar displaying past analyses

### Backend Architecture

**Framework**: Express.js with TypeScript

**API Design**: RESTful endpoints
- `POST /api/analyze`: Accepts text, returns trust score analysis
- `GET /api/history`: Retrieves all past analyses

**Claim Processing Pipeline**:
1. **Extraction**: Sentence splitting with filtering (10+ chars, exclude metadata/greetings)
2. **Verification**: Mock search simulation generating evidence snippets with relevance scores
3. **Scoring**: Aggregated trust score calculation from individual claim scores
4. **Limit**: Maximum 8 claims per analysis for manageability

**Data Flow**:
- Request validation using Zod schemas
- In-memory storage (MemStorage class) for MVP - designed for easy database swap
- UUID-based analysis identification

### Data Storage

**Current Implementation**: In-memory Map-based storage via `MemStorage` class

**Schema Design**: Prepared for PostgreSQL with Drizzle ORM
- Database schema defined in `shared/schema.ts`
- Configured for Neon serverless Postgres via `drizzle.config.ts`
- Analysis model includes: id, inputText, trustScore, statusText, explanation, claims (JSONB), createdAt

**Migration Strategy**: Database URL environment variable required, schema ready for `drizzle-kit push`

**Data Models**:
- `Analysis`: Complete analysis record with metadata
- `Claim`: Individual claim with text, score (0-100), status enum, evidence array
- `EvidenceSnippet`: Title, snippet text, URL, relevance score (0-100)

### External Dependencies

**UI Framework**: Radix UI headless components for accessibility (accordions, dialogs, dropdowns, tooltips, etc.)

**Styling**: Tailwind CSS with custom design tokens and New York style variant from Shadcn

**Database (Configured)**: 
- Neon Serverless PostgreSQL (via `@neondatabase/serverless`)
- Drizzle ORM for type-safe queries and schema management

**Fonts**: Google Fonts (Inter, JetBrains Mono) loaded via CDN

**Build Tools**:
- Vite for frontend bundling with React plugin
- esbuild for backend compilation
- TypeScript for type safety across full stack

**Development Tools**:
- Replit-specific plugins (cartographer, dev banner, runtime error overlay)
- Hot module replacement (HMR) for development workflow

**Planned Integrations** (per design doc):
- Search API (SerpAPI, Bing Search API) for real evidence retrieval
- Currently using mock search function as placeholder