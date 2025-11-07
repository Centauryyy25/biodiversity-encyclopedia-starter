# Frontend Guideline Document for FloraFauna Encyclopedia

This document lays out how we build and maintain the frontend of the FloraFauna Encyclopedia. It’s written in everyday language so anyone—designer, developer, or stakeholder—can understand the setup, choices, and best practices.

## 1. Frontend Architecture

### 1.1 Core Frameworks and Libraries
- **Next.js 14 (App Router)**: Handles routing, server-side rendering (SSR), static site generation (SSG), and API routes.  
- **React**: Powers our interactive components and client-side logic.  
- **TypeScript**: Provides type safety and clear contracts for props, state, and API data.  
- **Tailwind CSS**: Utility-first styling framework for fast, consistent UI building.  
- **Shadcn/ui**: A pre-built, accessible component library that plugs into Tailwind.  
- **TanStack React Query**: Fetches, caches, and updates server data, giving us smooth loading states and automatic re-fetches.  
- **Clerk**: Manages user authentication, sign-up, login, and profile sessions.  
- **Supabase**: Hosts our PostgreSQL database and storage (for images, media).  
- **Framer Motion**: Adds subtle animations and interactive effects.  
- **Lucide React**: Provides a set of minimal, outline-style icons.  

### 1.2 Scalability, Maintainability & Performance
- **Server vs. Client Components**: Static, content-heavy pages (like species detail or article pages) run on the server for SEO and speed. Interactive parts (maps, quizzes, AI tool) run in the browser.  
- **File-based Routing**: Next.js App Router groups pages and layouts in a logical folder structure under `app/`.  
- **Data Layer**: React Query centralizes data fetching and caching, so new pages can tap into existing hooks without duplicating logic.  
- **Modular Design**: Clear separation between UI components, hooks, utilities, and domain-specific code makes it easy to onboard new developers.

## 2. Design Principles

### 2.1 Usability
- **Clear calls to action**: Buttons and links are styled consistently and labeled clearly (e.g., “Submit Species,” “Start Quiz”).  
- **Progressive Enhancement**: Basic functionality works without JavaScript; rich interactions layer on top.

### 2.2 Accessibility (a11y)
- **WCAG Compliance**: Color contrast ratios, focus outlines, screen-reader labels.  
- **Semantic HTML**: Proper use of headings, lists, landmarks.  
- **Keyboard Navigation**: All interactive elements reachable and operable by keyboard.

### 2.3 Responsiveness
- **Mobile-First**: Layouts scale from small screens to large desktops.  
- **Fluid Grids & Utilities**: Tailwind’s responsive classes (`sm:`, `md:`, `lg:`) adapt components across breakpoints.

## 3. Styling and Theming

### 3.1 Styling Approach
- **Tailwind CSS**: We use utility classes for spacing, typography, color, and layout.  
- **Shadcn/ui**: Provides base components (buttons, cards, form fields) that we customize via Tailwind’s theme.

### 3.2 Theming & Consistency
- **Custom Tailwind Config** (`tailwind.config.ts`): Defines our color palette, fonts, border-radius, shadows, and spacing scale.  
- **Light/Dark Mode**: Handled by `next-themes` and Tailwind’s `dark:` variants.  

### 3.3 Visual Style
- **Overall Style**: Modern flat design with soft shadows and gentle gradients to evoke a calm academic feel.  
- **Color Palette**:  
  • Primary:  
    – Dark Green: #2F5233  
    – Medium Green: #A3B18A  
    – Light Green: #E9F1E8  
  • Secondary & Neutral:  
    – Charcoal: #333333  
    – Gray: #666666  
    – Light Gray: #F5F5F5  
  • Accent:  
    – Golden Mustard: #F2CC8F  
    – Terracotta: #F28482  
- **Typography**:  
  • Headings: Playfair Display (serif)  
  • Body Text: Inter (sans-serif)  
  • System fallback: `system-ui, -apple-system, BlinkMacSystemFont`

## 4. Component Structure

### 4.1 Organization
- `app/`: Page routes, layouts, and global UI wrappers.  
- `components/ui/`: Reusable, styled components from Shadcn/ui (Button, Card, Modal).  
- `components/domain/`: Project-specific pieces (SpeciesCard, ArticlePreview, InteractiveMap, AIToolUploader, QuizCard).  
- `hooks/`: Custom React hooks (e.g., `useSpeciesSearch`, `useThemeSwitcher`).  
- `utils/`: Helper functions (API clients, string formatters, `cn` for conditional classes).  
- `supabase/`: Database migrations and policies for RLS (Row Level Security).

### 4.2 Reusability & Maintainability
- **Single Responsibility**: Each component does one job (e.g., a map component only renders maps).  
- **Props-Driven**: Components receive data and callbacks via props—no hidden dependencies.  
- **Atomic Design**: Start with small “atoms” (buttons, inputs), build up to “molecules” (form groups), then “organisms” (search bar + results list).

## 5. State Management

### 5.1 Server Data (Remote State)
- **TanStack React Query**:  
  • `useQuery` for fetching species, articles, map data.  
  • Built-in caching, background re-fetch, pagination support.  

### 5.2 Local UI State
- **React Context**: Light use for global settings (theme mode, user session info).  
- **useState / useReducer**: For component-level states like form inputs, quiz progress, and map filters.

## 6. Routing and Navigation

- **Next.js App Router**: File system routing under `app/`.  
- **Layouts**: `app/layout.tsx` defines shared shells (header, footer, navigation).  
- **Dynamic Routes**:  
  • `/species/[slug]/page.tsx` for species detail pages  
  • `/learn/quiz/[id]` for quizzes  
- **Protected Routes**: Middleware checks Clerk session to restrict contributor pages.  
- **Link**: Use `next/link` for in-app navigation; external links use `<a>` with `rel="noopener noreferrer"`.

## 7. Performance Optimization

- **Server Components**: Render static content on the server to reduce client bundle size.  
- **Static Site Generation (SSG)**: Pre-render species and article pages at build time where possible.  
- **Incremental Static Regeneration (ISR)**: Update pages in the background when content changes.  
- **Code Splitting & Lazy Loading**:  
  • Dynamic `import()` for heavy modules (LeafletJS, AI tool)  
  • `next/dynamic` to load interactive widgets only when needed.  
- **Image Optimization**: Next.js `<Image>` for automatic resizing and format switching (WebP).  
- **Caching**: HTTP caching headers via Next.js, and React Query’s in-memory cache.  
- **PWA Support**: Offline caching of core assets and pages for field use.

## 8. Testing and Quality Assurance

### 8.1 Unit and Integration Tests
- **Jest** + **React Testing Library**: For component tests, hook tests, and utility functions.  
- **msw (Mock Service Worker)**: Simulates Supabase and external API responses.

### 8.2 End-to-End (E2E) Tests
- **Cypress** or **Playwright**: Automate user flows—sign up, contribution submission, AI tool usage, map exploration.

### 8.3 Accessibility & Performance Audits
- **axe-core**: Automated accessibility checks in tests.  
- **Lighthouse**: Performance, accessibility, SEO, and best practice scoring in CI.

### 8.4 Continuous Integration
- GitHub Actions pipeline runs linting (ESLint), formatting (Prettier), type checks, and all tests on each pull request.

## 9. Conclusion and Overall Frontend Summary

We’ve built the FloraFauna Encyclopedia frontend on a rock-solid, modern stack: Next.js for routing and rendering, React for interactivity, TypeScript for safety, Tailwind for styling, and Supabase + Clerk for data and auth. The design focuses on usability, accessibility, and responsiveness, with clear theming and a calm, natural style. Components are organized for easy reuse, data is managed efficiently with React Query, and performance is optimized via SSR, SSG, code splitting, and caching. A full suite of tests and CI processes ensures reliability as the project grows.  

This guideline should serve as your reference for any new feature or enhancement—keeping the code maintainable, the UI consistent, and the user experience top-notch.