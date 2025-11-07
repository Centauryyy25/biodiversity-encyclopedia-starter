# Backend Structure Document

This document outlines the backend design for the **FloraFauna Encyclopedia** platform. It covers architecture, data storage, APIs, hosting, infrastructure, security, monitoring, and overall summary—presented in clear, everyday language to ensure everyone can understand the backend setup.

## 1. Backend Architecture

### Overall Design
- We use a **hybrid serverless architecture**: Next.js on Vercel handles web pages, API routes, and server-side rendering while Supabase (PostgreSQL) takes care of data storage and real-time updates.
- **Design patterns**:
  • **Model-View-Controller (MVC)** at a high level: Next.js pages (View), API routes (Controller), Supabase or migration files (Model).  
  • **Server Components vs. Client Components**: Static or SEO-critical pages (Species, Articles) render on the server; interactive elements (maps, quizzes, AI tool) run on the client.

### Scalability, Maintainability, Performance
- **Auto-scaling** through Vercel and Supabase managed services.
- **Clear separation of concerns**: Frontend logic in Next.js directories (`app/`, `components/`), data logic in `utils/supabase/` and Supabase migrations.
- **Caching and incremental builds**: Next.js ISR and TanStack React Query minimize repeated calls, improving response times.

## 2. Database Management

### Technologies Used
- Supabase (PostgreSQL) for relational data.
- Supabase Storage for media assets (species photos, user uploads).
- Supabase Edge Functions for serverless functions (optional, as needed).

### Data Organization
- **Tables** represent core entities: Users, Species, Taxonomy, Habitats, Articles, Contributions, Quizzes.
- **Row Level Security (RLS)** ensures contributors can only edit their own drafts; moderators have elevated privileges.
- **Migrations** track schema changes over time, stored in the `supabase/migrations/` folder.

### Access Patterns
- Read-heavy operations (search, browsing) use **cached queries** via TanStack React Query.
- Write operations (contributions, article submissions) go through secure API routes or Supabase functions with proper authentication.

## 3. Database Schema

Below is a human-readable overview of the main tables followed by SQL definitions in PostgreSQL syntax.

### Tables Overview
- **users**: profiles linked to Clerk authentication, storing display name and role (contributor, moderator).
- **species**: core encyclopedia entries (scientific name, common name, description, taxonomy_id, habitat_id, conservation status).
- **taxonomy**: hierarchical classification (kingdom, phylum, class, order, family, genus).
- **habitats**: environment details (type, region, description).
- **articles**: editorial posts (title, content, author_id, tags, published_at).
- **contributions**: draft submissions from users (species_id or article_id reference, status, reviewer_id).
- **quizzes**: quiz sets (title, description).
- **quiz_questions**: individual questions (quiz_id, question_text, correct_answer).
- **quiz_answers**: user responses (question_id, user_id, selected_option, is_correct).

### PostgreSQL Schema
```sql
-- Users table (linked to Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'contributor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Taxonomy table
CREATE TABLE taxonomy (
  id SERIAL PRIMARY KEY,
  kingdom TEXT,
  phylum TEXT,
  class TEXT,
  "order" TEXT,
  family TEXT,
  genus TEXT
);

-- Habitats table
CREATE TABLE habitats (
  id SERIAL PRIMARY KEY,
  type TEXT,
  region TEXT,
  description TEXT
);

-- Species table
CREATE TABLE species (
  id SERIAL PRIMARY KEY,
  scientific_name TEXT UNIQUE NOT NULL,
  common_name TEXT,
  description TEXT,
  taxonomy_id INTEGER REFERENCES taxonomy(id),
  habitat_id INTEGER REFERENCES habitats(id),
  conservation_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  tags TEXT[],
  published_at TIMESTAMP WITH TIME ZONE
);

-- Contributions table (drafts)
CREATE TABLE contributions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  species_id INTEGER REFERENCES species(id),
  article_id INTEGER REFERENCES articles(id),
  status TEXT DEFAULT 'pending',
  reviewer_id UUID REFERENCES users(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quizzes and questions
CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT
);

CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id),
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL
);

CREATE TABLE quiz_answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES quiz_questions(id),
  user_id UUID REFERENCES users(id),
  selected_option TEXT,
  is_correct BOOLEAN,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
``` 

## 4. API Design and Endpoints

We follow a **RESTful** approach, with clear, predictable endpoints.

### Authentication
- `POST /api/auth/login` & `POST /api/auth/signup`: Handled by Clerk; tokens passed in headers.
- Middleware (`middleware.ts`) protects routes based on user role.

### Species Endpoints
- `GET  /api/species`: List all species (supports filters: name, habitat, status).
- `GET  /api/species/:id`: Detail view for one species.
- `POST /api/species`: Create new species (protected: contributor+).
- `PUT  /api/species/:id`: Update species (protected, with RLS).

### Article Endpoints
- `GET  /api/articles`: List published articles.
- `GET  /api/articles/:id`: Detail for one article.
- `POST /api/articles`: Submit new article draft.
- `PUT  /api/articles/:id`: Update or publish article.

### Contribution Management
- `GET  /api/contributions`: Moderation queue.
- `POST /api/contributions/:id/approve`: Approve submission (moderator only).
- `POST /api/contributions/:id/reject`: Reject or request changes.

### Search & Filters
- `GET /api/search?query=...`: Unified search across species, articles.
- Supports auto-complete, faceting, synonym matching.

### AI Recognition Tool
- `POST /api/ai/recognize`: Upload image; returns species matches and confidence.

### Map Data
- `GET /api/map/data`: Returns geo coordinates and species counts for map overlays.

## 5. Hosting Solutions

### Vercel (Frontend & API)
- **Global CDN** for static assets and serverless functions.  
- **Automatic scaling** based on traffic.
- **Preview deployments** for every branch.

### Supabase (Database & Auth)
- Managed PostgreSQL with automatic backups and replication.
- Built-in authentication via Clerk integration or Supabase Auth.
- **Storage buckets** for images and media, served via secure URLs or CDN.

## 6. Infrastructure Components

- **Load Balancer**: Vercel’s edge network distributes incoming requests globally.
- **CDN**: Vercel’s built-in CDN caches static assets, Supabase Storage uses a CDN layer.
- **Cache layer**:
  • Next.js Incremental Static Regeneration (ISR) for page caching.
  • TanStack React Query on client for data caching.
- **Deployment pipeline**: GitHub Actions or Vercel CI triggers linting, tests, and migrations.

## 7. Security Measures

- **Authentication & Authorization**:
  • Clerk handles sign-up, login, MFA.  
  • Supabase RLS policies enforce row-level permissions.  
  • Middleware blocks unauthorized API access.
- **Encryption**:
  • TLS/HTTPS for all traffic.  
  • Data-at-rest encryption in Supabase.
- **Secrets management**:
  • Environment variables stored securely in Vercel and Supabase dashboards.
- **Input validation & sanitization** on API routes to prevent injection attacks.
- **Content Security Policy (CSP)** and security headers via Next.js configuration.

## 8. Monitoring and Maintenance

- **Performance Monitoring**: Vercel Analytics and Supabase logs track request latency, error rates.
- **Error Tracking**: Sentry or similar captures runtime exceptions in API routes and client code.
- **Uptime & Alerts**: Pingdom or UptimeRobot checks availability; team notified on downtime.
- **Database Health**: Supabase dashboard monitors query performance and replication lag.
- **Backup & Recovery**: Automatic daily backups in Supabase; manual snapshot on major releases.
- **Routine Maintenance**:
  • Apply schema migrations via CI/CD.  
  • Regular dependency audits and security patching.  
  • Quarterly performance reviews to adjust indexing or caching strategies.

## 9. Conclusion and Overall Backend Summary

The backend for FloraFauna Encyclopedia is built on a modern, serverless-friendly stack that emphasizes performance, security, and ease of maintenance. By combining Next.js on Vercel with Supabase’s managed database and storage, we ensure reliable scaling and a straightforward development workflow. Our RESTful APIs, robust security measures, and monitoring setup align perfectly with the goals of delivering an interactive, AI-assisted, and community-driven encyclopedia. This structure provides a solid foundation, enabling contributors to add rich biodiversity content while giving end users a fast and engaging experience.