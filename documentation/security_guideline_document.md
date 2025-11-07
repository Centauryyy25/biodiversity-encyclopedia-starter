# Security Guidelines for FloraFauna Encyclopedia

This document provides actionable security guidance for the **FloraFauna Encyclopedia** codebase (`biodiversity-encyclopedia-starter`). It aligns with industry best practices and the project’s tech stack (Next.js 14, Clerk, Supabase, React Query, Tailwind CSS, Shadcn/ui, PWA, LeafletJS, HuggingFace, Vercel).

## 1. Security by Design
- Treat security as a core requirement, not an afterthought.  
- Perform threat modeling for new features (e.g., AI Recognition Tool, file uploads, contributor workflows).  
- Adopt a “fail secure” approach: default to denying access or failing operations when errors occur.

## 2. Authentication & Access Control
- **Clerk Integration**  
  • Enforce strong password policies via Clerk (min. 12 characters, complexity rules).  
  • Enable multi-factor authentication (MFA) for moderator and admin roles.  
  • Configure session timeouts and secure cookies (`HttpOnly`, `Secure`, `SameSite=Strict`).
- **Role-Based Access Control (RBAC)**  
  • Define roles: contributor, moderator, admin, public.  
  • Enforce server-side checks for every protected API route or page (`middleware.ts`).  
  • Use Supabase Row Level Security (RLS) policies to ensure users only edit their own drafts and moderators approve submissions.
- **Least Privilege**  
  • Limit API keys and service accounts.  
  • Ensure serverless functions and database roles have only necessary permissions.

## 3. Input Handling & Processing
- **Data Validation**  
  • Validate all incoming JSON payloads against schemas (e.g., `zod`, `yup`).  
  • On the server, enforce type checks for species data, articles, user profiles, and quiz submissions.
- **Prevent Injection Attacks**  
  • Use Supabase’s parameterized queries or ORM methods—never string‐concatenate SQL.  
  • Sanitize user-provided rich text (articles) with a secure HTML sanitizer (e.g., `DOMPurify`).
- **File Upload Security**  
  • Restrict allowed file types (`.jpg`, `.png`, `.webp`) and enforce size limits.  
  • Scan uploads for malware using a third‐party service.  
  • Store uploads outside the public webroot (use Supabase Storage with private buckets and pre-signed URLs).
- **XSS Mitigation**  
  • Perform context-aware encoding of data in React components.  
  • Set a strict Content Security Policy (CSP) to allow only approved scripts and styles.

## 4. Data Protection & Privacy
- **Encryption in Transit & at Rest**  
  • Enforce HTTPS with TLS 1.2+ via Vercel.  
  • Supabase uses TLS for database connections and at-rest encryption—confirm configuration.
- **Secret Management**  
  • Store Clerk, Supabase, and HuggingFace API keys in environment variables or a secrets manager (e.g., Vercel Encrypted Environment).  
  • Do not commit `.env` or secrets to source control.
- **PII Handling**  
  • Minimize collected PII (e.g., only store display name, email).  
  • Mask or redact sensitive fields in logs and stack traces.

## 5. API & Service Security
- **Next.js API Routes**  
  • Protect every route with authentication middleware.  
  • Validate HTTP methods and reject invalid verbs (e.g., disallow `GET` on write endpoints).
- **Rate Limiting & Throttling**  
  • Implement per-IP or per-user rate limits for heavy operations (image recognition, map tile fetches, search queries).  
  • Use a middleware (e.g., `express-rate-limit` on custom servers or Vercel edge functions).
- **CORS Configuration**  
  • Restrict to trusted origins (your production domain, localhost for dev).  
  • Disallow wildcard `*` in production.
- **API Versioning**  
  • Prefix routes with `/api/v1/`, planning migration paths for future changes.

## 6. Web Application Security Hygiene
- **Security Headers**  
  • `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`  
  • `X-Frame-Options: DENY`  
  • `X-Content-Type-Options: nosniff`  
  • `Referrer-Policy: no-referrer-when-downgrade`  
  • CSP: define scripts, styles, images, and fonts from self and trusted CDNs only.
- **CSRF Protection**  
  • Use Next.js built-in CSRF tokens for form submissions and state‐changing actions.  
  • Double‐submit cookies pattern or synchronizer tokens for API calls.
- **Secure Cookies**  
  • Set `HttpOnly`, `Secure`, and `SameSite=Strict` on session cookies.

## 7. Infrastructure & Configuration Management
- **Production Hardening**  
  • Disable Next.js debug mode and detailed errors in production.  
  • Remove unused routes and pages before deployment.
- **TLS/SSL**  
  • Enforce modern cipher suites (ECDHE, AES-256) via Vercel.  
  • Disable legacy protocols (SSLv3, TLS 1.0/1.1).
- **Environment Separation**  
  • Use distinct projects or databases for dev, staging, and production in Supabase.  
  • Rotate credentials on a schedule and after personnel changes.

## 8. Dependency Management
- **Secure Dependencies**  
  • Review and vet new packages; prefer well-maintained libraries.  
  • Lockfile (`package-lock.json`) in version control to prevent unexpected upgrades.
- **Vulnerability Scanning**  
  • Integrate SCA tools (e.g., GitHub Dependabot, Snyk, npm audit) in CI/CD pipelines.  
  • Remediate critical and high vulnerabilities within defined SLAs.

## 9. Testing & Monitoring
- **Security Testing**  
  • Write integration tests for authentication flows, RLS policies, file uploads, and rate limits.  
  • Perform periodic penetration testing, focusing on image upload, search endpoints, and contributor workflows.
- **Logging & Alerting**  
  • Log authentication failures, RLS policy violations, rate-limit breaches, and suspicious API usage.  
  • Forward logs to a centralized SIEM or monitoring service (e.g., Datadog, LogDNA).  
  • Configure alerts for anomaly detection (e.g., spike in failed logins, upload errors).

---
By following these guidelines, the **FloraFauna Encyclopedia** will maintain a robust security posture while delivering a rich, interactive experience to contributors and readers alike.