[![CodeGuide](/codeguide-backdrop.svg)](https://codeguide.dev)


# CodeGuide Starter Pro

A modern web application starter template built with Next.js 14, featuring authentication, database integration, and payment processing capabilities.

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Authentication:** [Clerk](https://clerk.com/)
- **Database:** [Supabase](https://supabase.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Payments:** [Stripe](https://stripe.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)

## Prerequisites

Before you begin, ensure you have the following:
- Node.js 18+ installed
- A [Clerk](https://clerk.com/) account for authentication
- A [Supabase](https://supabase.com/) account for database
- A [Stripe](https://stripe.com/) account for payments (optional)
- Generated project documents from [CodeGuide](https://codeguide.dev/) for best development experience

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd codeguide-starter-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Database Setup**
   - 📋 **Important**: This project uses Supabase for database management
   - Follow the complete database setup guide in [DATABASE_GUIDE.md](./DATABASE_GUIDE.md)
   - Quick setup:
     ```bash
     # Install Supabase CLI
     npm install -g supabase

     # Start local database
     supabase start

     # Setup environment variables
     cp .env.example .env
     # Update .env with keys from 'supabase start' output

     # Seed database with sample data
     supabase db reset
     ```

4. **Environment Variables Setup**
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Fill in the environment variables in `.env` (see Configuration section below)
   - 📖 **Detailed setup instructions**: See [Database Setup Guide](./DATABASE_GUIDE.md#environment-variables-setup)

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.**

7. **Explore the Database**
   - Open Supabase Studio: [http://localhost:54323](http://localhost:54323)
   - View sample species data and database schema
   - Test API endpoints and database queries

## Configuration

### Clerk Setup
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Go to API Keys
4. Copy the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

### Supabase Setup
1. 📖 **Complete Guide**: See [Database Setup Guide](./DATABASE_GUIDE.md) for detailed instructions
2. **Quick Setup** (for local development):
   ```bash
   # Start local Supabase instance
   supabase start

   # Get keys from output and update .env
   supabase status
   ```
3. **Production Setup**:
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Create a new project
   - Go to Project Settings > API
   - Copy the `Project URL` as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the `anon` public key as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 📋 **Migration workflow**: See [Migration Guide](./DATABASE_GUIDE.md#database-migration-workflow)

### Stripe Setup (Optional)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from the Developers section
3. Add the required keys to your `.env` file

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Features

- 🔐 Authentication with Clerk
- 📦 Supabase Database
- 💳 Stripe Payments Integration
- 🎨 Modern UI with Tailwind CSS
- 🚀 App Router Ready
- 🔄 Real-time Updates
- 📱 Responsive Design

## Project Structure

```
codeguide-starter/
├── app/                # Next.js app router pages
├── components/         # React components
├── utils/             # Utility functions
├── public/            # Static assets
├── styles/            # Global styles
├── documentation/     # Generated documentation from CodeGuide
├── supabase/          # Supabase configurations and migrations
└── DATABASE_GUIDE.md  # 📋 Complete database setup and management guide
```

## Database & Documentation

### 📋 Database Setup Guide
- **[DATABASE_GUIDE.md](./DATABASE_GUIDE.md)** - Complete documentation for:
  - Local database setup with Docker
  - Migration workflows and best practices
  - Environment variable management
  - Multi-environment deployment (dev/staging/prod)
  - Backup and security procedures
  - Quick reference commands

### Key Database Features
- **Local Development**: Full PostgreSQL instance via Docker
- **Migrations**: Version-controlled schema changes
- **Seeding**: Sample data for development and testing
- **Row Level Security**: Built-in data protection
- **Real-time**: Live data synchronization
- **Studio**: Visual database management interface

## Documentation Setup

To implement the generated documentation from CodeGuide:

1. Create a `documentation` folder in the root directory:
   ```bash
   mkdir documentation
   ```

2. Place all generated markdown files from CodeGuide in this directory:
   ```bash
   # Example structure
   documentation/
   ├── project_requirements_document.md             
   ├── app_flow_document.md
   ├── frontend_guideline_document.md
   └── backend_structure_document.md
   ```

3. These documentation files will be automatically tracked by git and can be used as a reference for your project's features and implementation details.

## Quick Database Commands

```bash
# Start database services
supabase start

# Reset database with sample data
supabase db reset

# Open database management interface
# http://localhost:54323

# Check all services status
supabase status
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow
1. Follow the [Database Guide](./DATABASE_GUIDE.md) for setup
2. Test database changes locally first
3. Use migrations for schema changes
4. Include documentation updates for new features

### Database Changes
- Always test migrations locally
- Use `supabase db reset` to verify seed data
- Check [Migration Best Practices](./DATABASE_GUIDE.md#best-practices-migration-sql)
- Include rollback plans for production changes
