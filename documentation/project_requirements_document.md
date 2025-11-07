# Project Requirements Document (PRD): FloraFauna Encyclopedia

## 1. Project Overview

The FloraFauna Encyclopedia is a modern, web-based platform designed to catalog and share detailed information about plant and animal species. It solves the problem of scattered or outdated biodiversity data by providing a single, interactive hub where experts and enthusiasts can view taxonomy, morphology, habitat maps, and conservation status. More than just a static reference, it includes AI-assisted species recognition, smart search and filtering, and community-driven contributions to keep the encyclopedia up to date.

This platform is being built to foster a global community of contributors and learners. Key objectives include delivering a responsive species catalog with SEO-friendly pages, a secure contributor system for adding or editing entries, a machine-learning–powered image recognition tool, and an educational module with quizzes and flashcards. Success will be measured by user engagement (sign-ups, contributions), search performance (sub-300 ms response), AI recognition accuracy (target >80% on common species), and overall platform availability (99.9% uptime).

## 2. In-Scope vs. Out-of-Scope

**In-Scope (Version 1):**
- Species Encyclopedia pages rendered via Next.js Server Components
- Secure sign-up/sign-in and contributor portal using Clerk
- Supabase database with Row-Level Security (RLS) for storing species, articles, and user contributions
- Smart Search & Filter with real-time suggestions, faceted filters, and debouncing (TanStack React Query)
- AI Recognition Tool powered by a HuggingFace image classification model
- Interactive world map (LeafletJS) showing species distributions and habitat overlays
- Educational Module: dynamic quizzes, flashcards, progress tracking, and achievement badges
- Article & Blog Section: rich text editor, image embedding, tagging, server-side rendering for SEO
- Platform enhancements: Progressive Web App (PWA) support, light/dark mode toggle, WCAG 2.1 AA accessibility compliance

**Out-of-Scope (Later Phases):**
- Payment or donation processing (Stripe integration)
- Real-time chat or collaborative editing
- Native mobile apps (iOS/Android) beyond PWA
- Multi-language support or localization
- Advanced analytics dashboard for administrators
- Social network features (followers, feeds)

## 3. User Flow

A new visitor lands on the homepage and sees a prominent search bar, featured species cards, and navigation links (Species, Learn, Contribute, Articles). They enter a query—for example, “oak tree” or “Panthera leo”—and receive instant suggestions. Clicking a suggestion brings up a detailed species page with taxonomy details, high-resolution photos, habitat map, and conservation status. From there, users can explore quizzes under the Learn section or read related articles in the Blog.

A returning user clicks “Sign In” to authenticate via Clerk, then accesses the Contributor Dashboard. They choose “Add New Species,” fill out a multi-step form (name, taxonomy, description, images), and submit a draft. A moderator receives a notification, reviews the submission through Supabase’s RLS policies, and either approves it (publishing the entry) or requests changes. Meanwhile, all users can upload a photo to the AI Recognition Tool, which returns likely species matches and links to their pages.

## 4. Core Features

- **Authentication & Contributor Portal**: Clerk-based login, role-based access (contributor vs. moderator), profile management, submission workflow, draft approval/rejection.
- **Species Encyclopedia**: Server-rendered pages with taxonomy, morphology, habitat, conservation status, image galleries, expandable detail sections.
- **Smart Search & Filter**: Live autocomplete, faceted filters (habitat, region, status), synonym matching, debounced and cached queries via React Query.
- **AI Recognition Tool**: Image upload interface, HuggingFace model inference, confidence scores, error handling, usage logging.
- **Interactive Map**: LeafletJS client component, species distribution layers, pan/zoom controls, filter overlays (protected areas, climate zones), tooltips.
- **Educational Module**: Quiz generator (multiple choice, image ID, drag-and-drop), flashcards, progress indicators, badges, dynamic question sourcing from the database.
- **Article & Blog Section**: Rich text editor, image/media embedding, tagging, related article recommendations, server-side rendered pages for SEO.
- **Platform Enhancements**: PWA offline caching, light/dark theme toggle, accessible UI components (ARIA, keyboard navigation), Tailwind-based design system.

## 5. Tech Stack & Tools

**Frontend:**
- Next.js 14 (App Router) for SSR and static rendering
- React + TypeScript for UI components
- Tailwind CSS + Shadcn/ui for styling and design system
- TanStack React Query for data fetching and caching
- Framer Motion for animations
- Lucide React for icons
- LeafletJS for the interactive map

**Backend & Database:**
- Supabase (PostgreSQL) with Row-Level Security for data storage and API
- Supabase Storage for image uploads
- Clerk for authentication and user management

**AI & Integrations:**
- HuggingFace model for image classification (via custom `utils/ai/huggingface.ts`)
- Potential future support for other AI models (OpenAI, GPT-4)

**Developer Tools:**
- VS Code with Tailwind CSS IntelliSense, ESLint, Prettier
- React Query Devtools
- Optional AI-assisted coding tools: Cursor or Windsurf plugins

## 6. Non-Functional Requirements

- **Performance:** First contentful paint <2 s on 3G, API calls <300 ms, search response ~100 ms
- **Scalability:** Serverless or edge functions, database connection pooling
- **Security:** HTTPS, JWT sessions, Supabase RLS policies, input validation, CSRF/XSS protection
- **Accessibility:** WCAG 2.1 AA compliance, ARIA labels, keyboard navigation, color contrast
- **Reliability:** 99.9% uptime, automated backups of the Supabase database, PWA offline fallbacks
- **Usability:** Responsive across devices, intuitive UI patterns, consistent design system

## 7. Constraints & Assumptions

- Supabase account must support custom RLS and storage buckets
- HuggingFace model endpoint must have sufficient throughput and a predictable billing plan
- Hosting on Vercel or equivalent with Node.js 18+ environment
- Users have modern browsers that support PWA and ESModules
- Contributor moderation workflow assumes at least one active moderator at launch
- Design assets (logos, color palette, typography) are finalized before UI implementation

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits:** HuggingFace and Supabase have quotas—implement caching and exponential backoff.
- **Large Image Uploads:** Enforce client-side size limits (e.g., 5 MB) and image optimization on upload.
- **Map Performance on Mobile:** Use tile clustering or lazy-load layers to prevent slow rendering.
- **Search Synonym Coverage:** Requires ongoing manual updates to synonym lists or integration with a thesaurus API.
- **Accessibility Gaps:** Initial Shadcn/ui components are accessible, but custom components need manual ARIA checks.

*Mitigations:* Leverage React Query caching, implement input validation, optimize and compress images, audit accessibility iteratively, monitor error logs, and set up alerts for API failures.
