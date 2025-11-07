# Tech Stack Document for FloraFauna Encyclopedia

This document explains in simple terms the technologies chosen to build the FloraFauna Encyclopedia. Each section shows what tools we’re using and why, so you can understand how they work together to deliver a fast, reliable, and engaging experience.

## 1. Frontend Technologies
These tools power everything you see and interact with in your browser.

- Next.js (version 14)
  • A framework built on React that makes pages load quickly and helps with search engine optimization (SEO).  
  • Splits work between the server and the browser, so pages render fast and updates feel snappy.

- React
  • A library for building reusable user interface pieces (like buttons, cards, and forms).  
  • Lets us break the design into small, manageable components.

- TypeScript
  • Adds simple checks to make sure our code is correct before we run it.  
  • Helps avoid bugs and makes the code easier to maintain.

- Tailwind CSS
  • A utility-first styling tool that provides ready-made classes (e.g., `bg-green-500`, `text-xl`) to speed up design work.  
  • Ensures a consistent look by using the same color palette, fonts, and spacing throughout.

- Shadcn/ui
  • A library of pre-built, accessible UI components (like modals, dropdowns, and tables) that match our design system.  
  • Saves time and ensures a polished, cohesive appearance.

- Framer Motion
  • A simple way to add smooth animations and transitions (fading, sliding, scaling) that make the interface feel more engaging.

- Lucide React
  • A set of lightweight, outline-style icons used throughout the site for clear visual cues (e.g., search, map pin, edit).

- TanStack React Query
  • Manages data fetching and caching behind the scenes, so pages update automatically when data changes without unnecessary reloads.

- LeafletJS (in a client component)
  • A mapping library that renders an interactive world map, allowing users to explore species distributions by zooming, panning, and toggling layers.

- next-themes
  • A small helper for letting users switch between light and dark mode, storing their preference and applying the correct styles instantly.

- Progressive Web App (PWA) support
  • Enables offline access to core content by caching pages and images, making the site reliable even in low-connectivity situations.

## 2. Backend Technologies
These systems handle data storage, user management, and behind-the-scenes logic.

- Supabase (PostgreSQL database)
  • A hosted database that stores all species details, articles, user contributions, and quiz questions.  
  • Includes built-in authentication helpers, storage for user-uploaded images, and row-level security to control who can read or update data.

- Clerk (Authentication)
  • Manages user sign-up, login, password recovery, and profile settings.  
  • Integrates seamlessly with Supabase security rules to protect contributor-only areas.

- Next.js API Routes
  • Serverless functions that connect the frontend to Supabase (and other services) for actions like submitting new species entries or fetching quiz data.

- HuggingFace Model (AI Recognition Tool)
  • A custom image recognition model that compares user-uploaded photos of plants or animals against known species.  
  • Returns suggestions with confidence scores and links back to the detailed species pages.

## 3. Infrastructure and Deployment
These choices make sure the application is reliable, easy to update, and scales as traffic grows.

- Vercel Hosting
  • The platform where the app is deployed. Automatically builds and publishes changes when code is merged, providing instant previews for testing.

- Git and GitHub
  • Version control for tracking changes, collaborating on code, and reviewing pull requests.  
  • Allows us to go back in time if something needs to be fixed.

- Continuous Integration / Continuous Deployment (CI/CD)
  • Automated checks (tests, linting) run on every code change.  
  • If everything passes, the update is deployed to Vercel without manual steps.

- Supabase Migrations
  • A structured way to evolve the database schema (adding or changing tables and fields) in a trackable manner, ensuring everyone’s database stays in sync.

## 4. Third-Party Integrations
These services add specialized features without rebuilding them from scratch.

- Stripe (optional)
  • Although originally included for payment handling, it can be removed or repurposed if no subscription or donation feature is needed.

- OpenAI (reference pattern)
  • Provides examples for interacting with AI APIs, which is helpful when building out the HuggingFace integration.

- Cloudinary or Supabase Storage
  • Used for hosting user-uploaded images (species photos, AI recognition uploads) in a scalable, secure way.

- Analytics & Logging (you can choose tools like Google Analytics or Plausible)
  • Tracks user behavior, page views, and errors, giving insights into how people use the site and where improvements are needed.

## 5. Security and Performance Considerations
Measures to keep the site safe and running smoothly.

- Authentication & Row-Level Security (RLS)
  • Clerk handles user identity, while Supabase’s RLS ensures users can only modify their own drafts or approved content matches their role (contributor vs. moderator).

- HTTPS Everywhere
  • All data is encrypted in transit, keeping personal and contribution data secure.

- Caching & Data Fetching
  • React Query caches requests and reuses data, reducing server load and speeding up page updates.

- Image & Asset Optimization
  • Next.js automatically optimizes images and serves them in modern formats when possible, reducing load time.

- Accessibility Audits
  • Regular checks against WCAG standards (keyboard navigation, proper color contrast, focus management) ensure the site is usable for everyone.

- Testing Strategy
  • Unit tests for core functions, integration tests for workflows (e.g., submitting a species entry), and visual tests for UI components help catch issues early.

## 6. Conclusion and Overall Tech Stack Summary
**Recap:**  
We’ve chosen a modern, cohesive set of tools that balance developer productivity with user experience.  

• Frontend: Next.js + React + TypeScript + Tailwind CSS for fast, maintainable, and visually consistent pages  
• Backend: Supabase + Clerk for secure, scalable data management and user authentication  
• Infrastructure: Vercel + GitHub for seamless deployments and collaborative development  
• Integrations: HuggingFace, LeafletJS, Cloudinary, and optional services like Stripe and analytics for specialized features  
• Security & Performance: RLS, HTTPS, caching, image optimization, accessibility, and a robust testing setup

These choices align perfectly with your goals: a performant, SEO-friendly, interactive, and community-driven encyclopedia of flora and fauna. By leveraging pre-built services and libraries, the team can focus on adding unique content and features—like AI-driven identification, interactive maps, and educational quizzes—without reinventing the wheel.

**Unique Aspects:**  
• AI Recognition Tool powered by a custom HuggingFace model  
• Interactive biodiversity map with LeafletJS  
• Contributor portal secured by Clerk + Supabase RLS  
• PWA support for offline access in the field  

Together, this stack provides a solid, future-proof foundation that scales with your community and content. Feel confident that each technology has been chosen for clear benefits: speed, security, accessibility, and a delightful user experience.