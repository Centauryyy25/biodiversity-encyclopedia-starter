# Database Setup Guide

Panduan komprehensif untuk setup database Supabase dan migrasi data proyek Biodiversity Encyclopedia.

## Daftar Isi

1. [Prasyarat](#prasyarat)
2. [Instalasi Supabase CLI](#instalasi-supabase-cli)
3. [Setup Database Lokal](#setup-database-lokal)
4. [Konfigurasi Environment Variables](#konfigurasi-environment-variables)
5. [Menghubungkan Next.js dengan Database](#menghubungkan-nextjs-dengan-database)
6. [Troubleshooting](#troubleshooting)

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstall:

### Docker
- **Docker Desktop** (Windows/Mac) atau **Docker Engine** (Linux)
- Minimal versi Docker 20.10+
- Minimal 4GB RAM tersedia
- Pastikan Docker sedang berjalan

### Node.js
- Node.js versi 18+
- npm atau yarn package manager

### Git
- Git untuk version control

### Verifikasi Instalasi
```bash
# Cek versi Docker
docker --version

# Cek versi Node.js
node --version

# Cek versi npm
npm --version
```

## Instalasi Supabase CLI

### Metode 1: NPM (Direkomendasikan)
```bash
# Install globally via npm
npm install -g supabase

# Verifikasi instalasi
supabase --version
```

### Metode 2: Binary Download
```bash
# Linux/macOS
curl -L https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar xz
sudo mv supabase /usr/local/bin/

# Atau untuk macOS dengan Homebrew
brew install supabase/tap/supabase
```

### Metode 3: Package Manager
```bash
# macOS dengan Homebrew
brew install supabase/tap/supabase

# Ubuntu/Debian
sudo apt-get install -y curl
curl -L https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar xz
sudo mv supabase /usr/local/bin/
```

## Setup Database Lokal

### 1. Inisialisasi Supabase Project
```bash
# Clone repository
git clone <repository-url>
cd biodiversity-encyclopedia-starter

# Jika belum ada folder supabase
supabase init

# Struktur folder yang akan dibuat:
# supabase/
# ├── config.toml          # Konfigurasi lokal
# ├── migrations/          # File migrasi database
# ├── seed.sql            # Data contoh untuk development
# └── functions/          # Edge functions (jika ada)
```

### 2. Start Local Supabase Services
```bash
# Start semua layanan Supabase
supabase start

# Output yang diharapkan:
# Starting database...
# Starting local development setup...
#
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# Inbucket URL: http://localhost:54324
#
# anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Verifikasi Services Berjalan
```bash
# Cek status semua services
supabase status

# Test koneksi database
supabase db shell --command "SELECT version();"

# Buka Supabase Studio di browser
# http://localhost:54323
```

### 4. Apply Migrations dan Seed Data
```bash
# Reset database dengan seed data
supabase db reset

# Atau apply migrasi satu per satu
supabase db push

# Verifikasi data telah terisi
supabase db shell --command "SELECT COUNT(*) FROM species;"
```

## Konfigurasi Environment Variables

### 1. Buat File .env
```bash
# Copy template environment variables
cp .env.example .env
```

### 2. Isi Environment Variables
Edit file `.env` dengan konfigurasi berikut:

```env
# Supabase Configuration (Local Development)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_supabase_start
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase_start

# Database Configuration (untuk server-side operations)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Supabase CLI Configuration
SUPABASE_PROJECT_ID=your_local_project_id
SUPABASE_ACCESS_TOKEN=your_access_token

# Optional: OpenAI API untuk AI features
OPENAI_API_KEY=your_openai_api_key_if_needed
```

### 3. Mendapatkan API Keys
Dapatkan keys dari output `supabase start`:

```bash
# Jalankan lagi untuk melihat keys
supabase start

# Atau check status
supabase status
```

Copy keys yang muncul:
- `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

## Menghubungkan Next.js dengan Database

### 1. Install Dependencies
Dependencies sudah terinstall di package.json:

```json
{
  "@supabase/supabase-js": "^2.48.1"
}
```

### 2. Create Supabase Client
Buat file `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. Create Server-side Client (Opsional)
Buat file `lib/supabase-server.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const createServerClient = async () => {
  const cookieStore = cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

### 4. Test Koneksi Database
Buat file testing atau tambahkan di existing API route:

```typescript
// app/api/test-db/route.ts
import { createServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Test koneksi dengan query sederhana
    const { data, error } = await supabase
      .from('species')
      .select('count')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Database connection successful!',
      speciesCount: data
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to connect to database'
    }, { status: 500 })
  }
}
```

### 5. Testing Connection
```bash
# Start development server
npm run dev

# Test endpoint di browser atau curl
curl http://localhost:3000/api/test-db
```

## Troubleshooting

### Port Conflicts
**Problem**: Port sudah digunakan

**Error**:
```
Error: listen EADDRINUSE :::54321
```

**Solution**:
```bash
# Kill proses yang menggunakan port
sudo lsof -i :54321
kill -9 <PID>

# Atau ubah port di supabase/config.toml
# [api]
# port = 54325  # ganti ke port lain
```

### Docker Issues
**Problem**: Docker tidak berjalan

**Error**:
```
Cannot connect to the Docker daemon
```

**Solution**:
```bash
# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Untuk Docker Desktop, pastikan aplikasi berjalan
```

### Database Connection Issues
**Problem**: Tidak bisa konek ke database

**Error**:
```
Connection refused
```

**Solution**:
```bash
# Check status Supabase
supabase status

# Restart services
supabase stop
supabase start

# Reset database
supabase db reset
```

### Permission Issues
**Problem**: Permission denied error

**Solution**:
```bash
# Fix folder permissions
sudo chown -R $USER:$USER .supabase
chmod -R 755 .supabase
```

### Migration Issues
**Problem**: Migrasi gagal

**Solution**:
```bash
# Check migrasi status
supabase migration list

# Apply migrasi secara manual
supabase db push

# Reset database (HATI-HATI: akan menghapus semua data)
supabase db reset
```

### Environment Variables Issues
**Problem**: Environment variables tidak terbaca

**Solution**:
```bash
# Verifikasi file .env
cat .env

# Restart development server setelah mengubah .env
npm run dev

# Untuk Next.js, pastikan variable dimulai dengan NEXT_PUBLIC_ untuk client-side
```

### Memory Issues
**Problem**: Docker kehabisan memory

**Error**:
```
Container killed due to memory limit
```

**Solution**:
```bash
# Alokasikan lebih banyak RAM ke Docker (Docker Desktop settings)
# Minimal 4GB direkomendasikan

# Atau hapus containers yang tidak digunakan
docker system prune -a
```

### Version Compatibility
**Problem**: Versi PostgreSQL tidak cocok

**Solution**:
```bash
# Check versi PostgreSQL di config.toml
# [db]
# major_version = 15

# Pastikan versi sama dengan production database
```

## Quick Reference Commands

```bash
# Start/Stop Supabase
supabase start              # Start semua services
supabase stop               # Stop semua services
supabase stop --backup      # Stop dengan backup

# Database Operations
supabase db reset           # Reset database dengan seed
supabase db push            # Apply migrasi ke remote
supabase db shell           # Buka database shell
supabase db diff            # Generate migrasi dari perubahan

# Migration Management
supabase migration new      # Buat migrasi baru
supabase migration list     # List semua migrasi
supabase migration apply    # Apply migrasi

# Status dan Logs
supabase status             # Check status services
supabase logs               # View logs
supabase logs db            # Database logs saja

# Link ke Remote Project
supabase link               # Link ke project Supabase
supabase unlink             # Unlink dari project
```

## Next Steps

Setelah database setup selesai:

1. **Explore Schema**: Buka Supabase Studio di http://localhost:54323
2. **Review Data**: Check sample data di table `species`
3. **Test API**: Test koneksi dari aplikasi Next.js
4. **Deploy**: Link ke remote Supabase project untuk production

# Database Migration Workflow

Panduan lengkap untuk membuat dan mengelola migrasi database Supabase untuk development dan production.

## Daftar Isi

1. [Konsep Dasar Migrasi](#konsep-dasar-migrasi)
2. [Membuat Migration Baru](#membuat-migration-baru)
3. [Best Practices Migration SQL](#best-practices-migration-sql)
4. [Applying Migrations](#applying-migrations)
5. [Managing Migration Conflicts](#managing-migration-conflicts)
6. [Schema Versioning dan Naming Conventions](#schema-versioning-dan-naming-conventions)
7. [Production Deployment Workflow](#production-deployment-workflow)
8. [Common Migration Patterns](#common-migration-patterns)

## Konsep Dasar Migrasi

### Apa itu Database Migration?
Database migration adalah kode yang mengubah struktur database dari satu versi ke versi lain. Migrasi memungkinkan:

- **Version Control**: Tracking perubahan schema
- **Team Collaboration**: Developer bisa bekerja bersama
- **Reproducible Setup**: Environment yang konsisten
- **Rollback Capability**: Kembali ke versi sebelumnya

### Jenis Migrasi
1. **Schema Migrations**: Perubahan struktur (tabel, kolom, index)
2. **Data Migrations**: Transformasi atau migrasi data
3. **Seed Migrations**: Data awal untuk development

### Workflow Migrasi Supabase
```
Local Changes → Generate Migration → Test Locally → Push to Remote → Deploy to Production
```

## Membuat Migration Baru

### 1. Generate Migration dari Perubahan Lokal
```bash
# Buat perubahan di database lokal
supabase db shell
```

Setelah membuat perubahan:
```bash
# Generate migration dari perubahan yang belum ter-tracked
supabase db diff --schema public -f add_new_table

# Contoh output akan dibuat di:
# supabase/migrations/20251107120000_add_new_table.sql
```

### 2. Buat Migration Manual
```bash
# Buat file migration baru
supabase migration new add_user_profiles

# Output:
# Created new migration at:
# supabase/migrations/20251107120500_add_user_profiles.sql
```

### 3. Template Migration File
```sql
-- Migration: Add user profiles table
-- Description: Creates user_profiles table with relationship to auth.users

-- Create table
CREATE TABLE "public"."user_profiles" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "full_name" text,
    "avatar_url" text,
    "bio" text,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth.users"("id") ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX "user_profiles_user_id_idx" ON "public"."user_profiles" USING btree ("user_id");

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON "public"."user_profiles" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON "public"."user_profiles" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON "public"."user_profiles" TO "authenticated";
GRANT SELECT ON "public"."user_profiles" TO "anon";
```

## Best Practices Migration SQL

### 1. Reversible Migrations
```sql
-- ✅ GOOD: Reversible migration
DO $$
BEGIN
    -- Check if column exists before adding
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='species' AND column_name='lifespan'
    ) THEN
        ALTER TABLE "public"."species" ADD COLUMN "lifespan" integer;
    END IF;
END $$;

-- ❌ BAD: Non-reversible
ALTER TABLE "public"."species" ADD COLUMN "lifespan" integer;
```

### 2. Use Transactions for Complex Changes
```sql
-- ✅ GOOD: Use transactions
BEGIN;

-- Add new column
ALTER TABLE "public"."species" ADD COLUMN "threat_level" text;

-- Update existing data
UPDATE "public"."species" SET "threat_level" = 'Unknown' WHERE "threat_level" IS NULL;

-- Add constraint after data update
ALTER TABLE "public"."species" ADD CONSTRAINT "species_threat_level_check"
    CHECK (threat_level IN ('Low', 'Medium', 'High', 'Critical', 'Unknown'));

COMMIT;
```

### 3. Handle Dependencies Properly
```sql
-- ✅ GOOD: Handle dependencies in correct order
-- First, create the table without foreign key
CREATE TABLE "public"."species_regions" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "species_id" uuid NOT NULL,
    "region_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "species_regions_pkey" PRIMARY KEY ("id")
);

-- Then add foreign key constraints if tables exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'species') THEN
        ALTER TABLE "public"."species_regions"
        ADD CONSTRAINT "species_regions_species_id_fkey"
        FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE CASCADE;
    END IF;
END $$;
```

### 4. Index Creation Strategy
```sql
-- ✅ GOOD: Create indexes after data loading
-- For large tables, create indexes separately
CREATE INDEX CONCURRENTLY "species_description_idx" ON "public"."species" USING gin(to_tsvector('english', description));

-- For composite indexes
CREATE INDEX "species_status_featured_idx" ON "public"."species" (iucn_status, featured) WHERE featured = true;
```

### 5. Safe Data Type Changes
```sql
-- ✅ GOOD: Safe column type changes
-- Step 1: Add new column
ALTER TABLE "public"."species" ADD COLUMN "population_count_new" bigint;

-- Step 2: Migrate data
UPDATE "public"."species" SET "population_count_new" = population_count::bigint WHERE population_count IS NOT NULL;

-- Step 3: Drop old column
ALTER TABLE "public"."species" DROP COLUMN "population_count";

-- Step 4: Rename new column
ALTER TABLE "public"."species" RENAME COLUMN "population_count_new" TO "population_count";
```

## Applying Migrations

### 1. Local Development Workflow
```bash
# Apply pending migrations locally
supabase db push

# Reset database and apply all migrations with seed data
supabase db reset

# Check migration status
supabase migration list

# Apply specific migration
supabase migration apply 20251107120000_add_new_table.sql
```

### 2. Remote Development Workflow
```bash
# Link to remote Supabase project (jika belum)
supabase link --project-ref your-project-ref

# Push migrations to remote/staging
supabase db push

# Check remote migration status
supabase migration list --remote
```

### 3. Production Deployment
```bash
# ⚠️ CAREFUL: Production deployment
# Always test migrations on staging first!

# Deploy to production
supabase db push --linked

# Or use Supabase Dashboard for production deployments
```

### 4. Migration States
- **Applied**: Migration berhasil diaplikasikan
- **Pending**: Migration belum diaplikasikan
- **Failed**: Migration gagal (perlu di-fix)

## Managing Migration Conflicts

### 1. Detecting Conflicts
```bash
# Check for schema differences
supabase db diff --schema public

# Compare with remote
supabase db diff --use-migra --schema public
```

### 2. Resolving Migration Conflicts
```bash
# Scenario: Two developers modified same table

# Developer A: Add column 'height'
# Developer B: Add column 'weight'

# Solution: Create combined migration
supabase migration new add_species_measurements
```

Combined migration content:
```sql
-- Combined migration for species measurements
ALTER TABLE "public"."species" ADD COLUMN "height" numeric;
ALTER TABLE "public"."species" ADD COLUMN "weight" numeric;

-- Add constraints
ALTER TABLE "public"."species" ADD CONSTRAINT "species_height_check" CHECK (height > 0);
ALTER TABLE "public"."species" ADD CONSTRAINT "species_weight_check" CHECK (weight > 0);
```

### 3. Handling Rollbacks
```sql
-- Create rollback migration
supabase migration new rollback_species_height

-- Content: Reverse previous changes
ALTER TABLE "public"."species" DROP COLUMN IF EXISTS "height";
```

### 4. Fixing Failed Migrations
```bash
# Identify failed migration
supabase migration list

# Fix the migration file
# Edit supabase/migrations/failed_migration.sql

# Mark migration as applied manually (DANGEROUS)
supabase db shell
INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES ('20251107120000', 'add_new_table');
```

## Schema Versioning dan Naming Conventions

### 1. Migration Naming Convention
```
Format: YYYYMMDDHHMMSS_descriptive_name.sql

Examples:
- 20251107120000_create_species_table.sql
- 20251107123000_add_user_profiles.sql
- 20251107124500_update_conservation_data.sql
- 20251107130000_remove_deprecated_fields.sql
```

### 2. Version Strategy
```bash
# Feature branch migrations
feature/add-species-images/
├── 20251107120000_add_species_images_table.sql
└── 20251107121000_add_image_processing_functions.sql

# Hotfix migrations
hotfix/fix-taxonomy-foreign-key/
└── 20251107130000_fix_taxonomy_foreign_key.sql
```

### 3. Documentation in Migrations
```sql
-- Migration: Add species images functionality
-- Author: Developer Name
-- Date: 2025-11-07
-- Description:
--   - Creates species_images table
--   - Adds image processing functions
--   - Updates RLS policies
-- Dependencies: species table must exist
-- Impact: Adds new table and functions, no breaking changes
```

### 4. Semantic Versioning
- **Major (X.0.0)**: Breaking changes
- **Minor (0.X.0)**: New features, backward compatible
- **Patch (0.0.X)**: Bug fixes, no API changes

## Production Deployment Workflow

### 1. Pre-deployment Checklist
```bash
# ✅ Test migrations on staging environment
supabase db push --remote staging

# ✅ Review migration impact
supabase db diff --linked

# ✅ Check for performance implications
EXPLAIN ANALYZE SELECT * FROM species WHERE iucn_status = 'EN';

# ✅ Verify rollback plan
# Review rollback migration files
```

### 2. Production Deployment Steps
```bash
# 1. Backup production database (via Dashboard or API)
# 2. Schedule maintenance window if needed
# 3. Deploy migrations during low traffic
supabase db push --remote production

# 4. Verify deployment
supabase migration list --remote

# 5. Test application functionality
# 6. Monitor for issues
```

### 3. Zero-Downtime Deployment Strategy
```sql
-- For schema changes requiring zero downtime:

-- Step 1: Add new column (nullable)
ALTER TABLE "public"."species" ADD COLUMN "new_conservation_status" text;

-- Step 2: Backfill data in batches
UPDATE "public"."species"
SET "new_conservation_status" = "iucn_status"
WHERE "new_conservation_status" IS NULL
LIMIT 1000;

-- Step 3: Update application to use new column
-- Deploy application code change

-- Step 4: Drop old column (after verification)
ALTER TABLE "public"."species" DROP COLUMN "iucn_status";

-- Step 5: Rename new column
ALTER TABLE "public"."species" RENAME COLUMN "new_conservation_status" TO "iucn_status";
```

### 4. Rollback Procedure
```bash
# Emergency rollback
supabase db rollback 20251107120000

# Or manually apply rollback migration
supabase migration apply rollback_species_images.sql
```

## Common Migration Patterns

### 1. Adding New Tables
```sql
-- Standard table creation
CREATE TABLE "public"."blog_posts" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "title" text NOT NULL,
    "slug" text NOT NULL,
    "content" text,
    "author_id" uuid,
    "published" boolean DEFAULT false,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug")
);

-- Enable RLS
ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX "blog_posts_author_id_idx" ON "public"."blog_posts" USING btree ("author_id");
CREATE INDEX "blog_posts_published_idx" ON "public"."blog_posts" USING btree ("published");
CREATE INDEX "blog_posts_published_at_idx" ON "public"."blog_posts" USING btree ("published_at") WHERE published = true;
```

### 2. Adding Columns
```sql
-- Add column with default value
ALTER TABLE "public"."species" ADD COLUMN "discovered_date" timestamp with time zone DEFAULT now();

-- Add nullable column
ALTER TABLE "public"."species" ADD COLUMN "discovered_by" text;

-- Add column with constraint
ALTER TABLE "public"."species" ADD COLUMN "verification_status" text
    DEFAULT 'pending'
    CONSTRAINT "species_verification_status_check"
    CHECK (verification_status IN ('pending', 'verified', 'rejected'));
```

### 3. Creating Indexes
```sql
-- Simple index
CREATE INDEX "species_common_name_idx" ON "public"."species" USING btree ("common_name");

-- Composite index
CREATE INDEX "species_kingdom_status_idx" ON "public"."species" ("kingdom", "iucn_status");

-- Partial index (for frequently queried subsets)
CREATE INDEX "species_featured_idx" ON "public"."species" ("created_at") WHERE "featured" = true;

-- Full-text search index
CREATE INDEX "species_search_idx" ON "public"."species" USING gin(
    to_tsvector('english', coalesce(scientific_name, '') || ' ' || coalesce(common_name, '') || ' ' || coalesce(description, ''))
);

-- Expression index
CREATE INDEX "species_slug_lower_idx" ON "public"."species" USING btree (lower(slug));
```

### 4. Updating RLS Policies
```sql
-- Add new policies
CREATE POLICY "Enable insert for contributors" ON "public"."species"
FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid() AND user_profiles.is_contributor = true
    )
);

-- Update existing policies
DROP POLICY IF EXISTS "Enable update for all authenticated users" ON "public"."species";
CREATE POLICY "Enable update for contributors" ON "public"."species"
FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid() AND user_profiles.is_contributor = true
    )
);
```

### 5. Creating Functions
```sql
-- Simple function
CREATE OR REPLACE FUNCTION "public"."get_species_count"("kingdom_filter" text DEFAULT NULL)
RETURNS integer AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM "public"."species"
        WHERE kingdom_filter IS NULL OR kingdom = kingdom_filter
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function with table return type
CREATE OR REPLACE FUNCTION "public"."search_species_advanced"(
    "search_term" text DEFAULT NULL,
    "kingdom_filter" text DEFAULT NULL,
    "status_filter" text DEFAULT NULL,
    "limit_count" integer DEFAULT 20,
    "offset_count" integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    scientific_name text,
    common_name text,
    kingdom text,
    iucn_status text,
    featured boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.scientific_name,
        s.common_name,
        s.kingdom,
        s.iucn_status,
        s.featured
    FROM "public"."species" s
    WHERE
        (search_term IS NULL OR
         lower(s.scientific_name) LIKE '%' || lower(search_term) || '%' OR
         lower(s.common_name) LIKE '%' || lower(search_term) || '%')
        AND (kingdom_filter IS NULL OR s.kingdom = kingdom_filter)
        AND (status_filter IS NULL OR s.iucn_status = status_filter)
    ORDER BY
        CASE
            WHEN lower(s.scientific_name) = lower(search_term) THEN 1
            WHEN lower(s.common_name) = lower(search_term) THEN 2
            WHEN lower(s.scientific_name) LIKE lower(search_term) || '%' THEN 3
            WHEN lower(s.common_name) LIKE lower(search_term) || '%' THEN 4
            ELSE 5
        END,
        s.scientific_name ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;
```

### 6. Creating Triggers
```sql
-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION "public"."handle_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to table
CREATE TRIGGER "handle_species_updated_at"
BEFORE UPDATE ON "public"."species"
FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();

-- Auto-slug creation trigger
CREATE OR REPLACE FUNCTION "public"."generate_species_slug"()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = regexp_replace(
            lower(regexp_replace(
                coalesce(NEW.scientific_name, ''),
                '[^a-zA-Z0-9\s-]', '', 'g'
            )),
            '\s+', '-', 'g'
        );

        -- Ensure uniqueness
        NEW.slug := NEW.slug || '-' || substr(md5(NEW.id::text), 1, 8);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "generate_species_slug_trigger"
BEFORE INSERT ON "public"."species"
FOR EACH ROW EXECUTE FUNCTION "public"."generate_species_slug"();
```

## Quick Reference Migration Commands

```bash
# Migration Management
supabase migration new <name>              # Create new migration
supabase migration list                   # List all migrations
supabase migration apply <version>        # Apply specific migration
supabase migration sync                   # Sync migrations with remote

# Schema Operations
supabase db diff                          # Show schema differences
supabase db diff --schema public          # Diff specific schema
supabase db diff --use-migra              # Use migra for advanced diff
supabase db push                          # Apply migrations to linked remote
supabase db reset                        # Reset and reapply all migrations

# Database Operations
supabase db shell                         # Open database shell
supabase db dump                          # Dump database schema
supabase db restore <file>               # Restore from dump

# Project Management
supabase link                             # Link to remote project
supabase unlink                           # Unlink from project
supabase status                           # Show local services status
```

# Data Seeding and Environment Management

Panduan lengkap untuk mengelola data seeding, environment variables, dan multi-environment setup untuk proyek Biodiversity Encyclopedia.

## Daftar Isi

1. [Data Seeding Overview](#data-seeding-overview)
2. [Seed File Structure dan Best Practices](#seed-file-structure-dan-best-practices)
3. [Environment Variable Management](#environment-variable-management)
4. [Multi-Environment Setup](#multi-environment-setup)
5. [Linking Local ke Remote Projects](#linking-local-ke-remote-projects)
6. [Security Considerations](#security-considerations)
7. [Backup dan Restore Procedures](#backup-dan-restore-procedures)

## Data Seeding Overview

### Apa itu Data Seeding?
Data seeding adalah proses mengisi database dengan data awal yang diperlukan untuk:
- **Development**: Data contoh untuk testing dan development
- **Testing**: Data konsisten untuk automated tests
- **Demonstration**: Sample data untuk showcase aplikasi
- **Production**: Initial data untuk aplikasi pertama kali

### Jenis Seed Data
1. **Core Data**: Data esensial yang aplikasi butuhkan untuk berjalan
2. **Sample Data**: Data contoh untuk development dan testing
3. **Reference Data**: Data lookup seperti categories, statuses, etc.

### Seed Data di Proyek Ini
```bash
supabase/
├── seed.sql              # Main seed file
├── migrations/           # Database schema migrations
└── data/                 # Additional seed data files
    ├── core_data.sql     # Essential data
    └── sample_data.sql   # Development sample data
```

## Seed File Structure dan Best Practices

### 1. Analisis Seed File Saat Ini
File `supabase/seed.sql` proyek ini berisi:

```sql
-- Seed data untuk biodiversity encyclopedia
-- Berisi sample species data untuk testing dan development

-- Insert sample species data
INSERT INTO "public"."species" (
    "scientific_name", "common_name", "slug", "kingdom", "phylum", "class", "order", "family", "genus", "species",
    "description", "morphology", "habitat_description", "conservation_status", "iucn_status", "featured", "image_urls"
) VALUES
-- 6 species dengan lengkap data taxonomy, conservation, dan images
```

### 2. Best Practices untuk Seed Data

#### ✅ DO: Gunakan Environment-Specific Seeds
```sql
-- supabase/seed.sql
DO $$
BEGIN
    -- Only seed in development environment
    IF current_setting('app.environment', true) = 'development' THEN
        -- Insert sample data
        INSERT INTO species (...) VALUES (...);
    END IF;
END $$;
```

#### ✅ DO: Include Metadata
```sql
-- supabase/seed.sql
-- Seed data version: 1.0
-- Created: 2025-11-07
-- Environment: Development
-- Description: Sample species for biodiversity encyclopedia

-- Create seed metadata table
CREATE TABLE IF NOT EXISTS seed_metadata (
    version text,
    applied_at timestamp with time zone DEFAULT now(),
    environment text
);

INSERT INTO seed_metadata (version, environment)
VALUES ('1.0', current_setting('app.environment', true));
```

#### ✅ DO: Use Idempotent Operations
```sql
-- ✅ GOOD: Idempotent seed data
INSERT INTO species (scientific_name, common_name, slug)
VALUES ('Panthera tigris', 'Bengal Tiger', 'bengal-tiger')
ON CONFLICT (scientific_name) DO NOTHING;

-- ❌ BAD: Non-idempotent
INSERT INTO species (scientific_name, common_name, slug)
VALUES ('Panthera tigris', 'Bengal Tiger', 'bengal-tiger');
```

#### ✅ DO: Organize by Category
```sql
-- supabase/seeds/01_core_data.sql
-- Essential categories and reference data

INSERT INTO conservation_categories (id, name, description) VALUES
('LC', 'Least Concern', 'Low risk of extinction'),
('NT', 'Near Threatened', 'Likely to become endangered in the near future'),
('VU', 'Vulnerable', 'High risk of endangerment in the wild'),
('EN', 'Endangered', 'Very high risk of extinction in the wild'),
('CR', 'Critically Endangered', 'Extremely high risk of extinction in the wild');

-- supabase/seeds/02_sample_species.sql
-- Sample species data
```

#### ❌ DON'T: Include Sensitive Data
```sql
-- ❌ BAD: Real user credentials
INSERT INTO users (email, password_hash) VALUES
('admin@example.com', 'real_password_hash_here');

-- ✅ GOOD: Fake or placeholder data
INSERT INTO users (email, password_hash) VALUES
('admin@local.dev', 'placeholder_hash_for_development_only');
```

### 3. Advanced Seeding Patterns

#### Conditional Seeding
```sql
-- supabase/seed.sql
DO $$
DECLARE
    species_count integer;
BEGIN
    -- Check if data already exists
    SELECT COUNT(*) INTO species_count FROM species;

    IF species_count = 0 THEN
        -- Insert seed data
        PERFORM seed_species_data();
        PERFORM seed_taxonomy_data();
        PERFORM seed_conservation_data();

        RAISE NOTICE 'Seed data inserted successfully';
    ELSE
        RAISE NOTICE 'Database already contains data, skipping seed';
    END IF;
END $$;
```

#### Modular Seeding Functions
```sql
-- supabase/seed.sql
-- Create reusable seeding functions

CREATE OR REPLACE FUNCTION seed_species_data()
RETURNS void AS $$
BEGIN
    -- Insert only if species table is empty
    PERFORM INSERT INTO species (...) VALUES (...)
    ON CONFLICT (scientific_name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION seed_user_profiles()
RETURNS void AS $$
BEGIN
    -- Seed user profiles for testing
    PERFORM INSERT INTO user_profiles (...) VALUES (...);
END;
$$ LANGUAGE plpgsql;

-- Execute seeding
SELECT seed_species_data();
SELECT seed_user_profiles();
```

### 4. Environment-Specific Seeding

#### Development Environment
```sql
-- supabase/seeds/development.sql
-- Rich sample data for development

-- Insert many species for comprehensive testing
INSERT INTO species (...) VALUES (...); -- 50+ records

-- Insert user profiles with various roles
INSERT INTO user_profiles (user_id, full_name, role)
VALUES
    (gen_random_uuid(), 'Admin User', 'admin'),
    (gen_random_uuid(), 'Contributor User', 'contributor'),
    (gen_random_uuid(), 'Regular User', 'user');

-- Insert test articles, comments, etc.
```

#### Staging Environment
```sql
-- supabase/seeds/staging.sql
-- Limited but realistic data

-- Small subset of production-like data
INSERT INTO species (...) VALUES (...); -- 10 records

-- Essential user accounts for testing
INSERT INTO user_profiles (...) VALUES (...);
```

#### Production Environment
```sql
-- supabase/seeds/production.sql
-- Only essential core data

-- Core reference data only
INSERT INTO conservation_categories (...) VALUES (...);
INSERT INTO taxonomy_ranks (...) VALUES (...);

-- No sample species or user data in production seeds
```

## Environment Variable Management

### 1. Environment Variables Structure

#### `.env.example` Template
```bash
# Database Configuration
# Local Development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Remote Development
# NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_remote_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_remote_service_role_key
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Supabase CLI
SUPABASE_PROJECT_ID=your_local_project_id
SUPABASE_ACCESS_TOKEN=your_access_token

# Optional Features
NEXT_PUBLIC_ENABLE_ANALYTICS=false
OPENAI_API_KEY=your_openai_key_for_ai_features

# Image and File Storage
NEXT_PUBLIC_IMAGE_UPLOAD_ENABLED=true
NEXT_PUBLIC_MAX_FILE_SIZE=5242880  # 5MB in bytes

# Development Settings
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

### 2. Multi-Environment Setup

#### Environment-Specific Files
```bash
# .env.development
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
NEXT_PUBLIC_DEBUG_MODE=true

# .env.staging
NODE_ENV=staging
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
DATABASE_URL=postgresql://postgres:password@staging-db.supabase.co:5432/postgres
NEXT_PUBLIC_DEBUG_MODE=false

# .env.production
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://production-project.supabase.co
DATABASE_URL=postgresql://postgres:password@production-db.supabase.co:5432/postgres
NEXT_PUBLIC_DEBUG_MODE=false
```

#### Environment Detection Script
```bash
# scripts/setup-env.sh
#!/bin/bash

# Detect environment and setup appropriate variables
ENVIRONMENT=${1:-development}

echo "Setting up environment: $ENVIRONMENT"

# Copy appropriate .env file
if [ -f ".env.$ENVIRONMENT" ]; then
    cp ".env.$ENVIRONMENT" .env
    echo "Environment variables loaded from .env.$ENVIRONMENT"
else
    echo "No .env.$ENVIRONMENT file found, using default .env"
fi

# Validate required variables
required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: Required environment variable $var is not set"
        exit 1
    fi
done

echo "Environment setup complete!"
```

### 3. Environment Variable Validation

#### Next.js Configuration Validation
```typescript
// lib/env-validation.ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),

  // Features
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.boolean().default(false),
  NEXT_PUBLIC_IMAGE_UPLOAD_ENABLED: z.boolean().default(true),
  NEXT_PUBLIC_MAX_FILE_SIZE: z.number().default(5242880),

  // Optional
  OPENAI_API_KEY: z.string().optional(),
})

export const validateEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Invalid environment variables:', error)
    process.exit(1)
  }
}

export const env = validateEnv()
```

#### Environment Check Function
```typescript
// lib/check-env.ts
export const checkEnvironment = () => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'DATABASE_URL'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }

  console.log(`✅ Environment: ${process.env.NODE_ENV}`)
  console.log(`✅ Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
}
```

## Multi-Environment Setup

### 1. Local Development Setup
```bash
# 1. Setup local Supabase
supabase init
supabase start

# 2. Setup development environment
./scripts/setup-env.sh development

# 3. Seed development data
supabase db reset

# 4. Start development server
npm run dev
```

### 2. Staging Environment Setup
```bash
# 1. Create staging Supabase project
# Via dashboard: https://app.supabase.com/

# 2. Link local to staging
supabase link --project-ref your-staging-project-ref

# 3. Setup staging environment
./scripts/setup-env.sh staging

# 4. Push migrations to staging
supabase db push --remote staging

# 5. Deploy to staging
npm run build
npm run start
```

### 3. Production Environment Setup
```bash
# 1. Create production Supabase project
# Enable database backups, point-in-time recovery
# Configure authentication, security settings

# 2. Setup CI/CD pipeline
# GitHub Actions, Vercel, etc.

# 3. Deploy migrations
supabase db push --remote production

# 4. Verify deployment
# Test critical functionality
# Monitor performance
```

### 4. Environment-Specific Scripts

#### `package.json` Scripts
```json
{
  "scripts": {
    "dev": "npm run setup:env:development && next dev",
    "dev:staging": "npm run setup:env:staging && next dev",
    "build": "npm run setup:env:production && next build",
    "build:staging": "npm run setup:env:staging && next build",

    "setup:env:development": "cp .env.development .env",
    "setup:env:staging": "cp .env.staging .env",
    "setup:env:production": "cp .env.production .env",

    "db:seed:dev": "supabase db reset --local",
    "db:seed:staging": "supabase db reset --remote staging",
    "db:seed:prod": "echo '⚠️  Production seeding not allowed'",

    "deploy:staging": "npm run build:staging && npm run deploy:staging:only",
    "deploy:production": "npm run build && npm run deploy:production:only"
  }
}
```

## Linking Local ke Remote Projects

### 1. Link ke Remote Supabase Project
```bash
# Link to existing project
supabase link --project-ref your-project-ref

# Project reference format: abcdefghijklmnopqrstuvwxyz
# Found in Supabase Dashboard > Settings > API

# Link with custom alias for multiple environments
supabase link --project-ref staging-ref --alias staging
supabase link --project-ref production-ref --alias production
```

### 2. Manage Multiple Remote Links
```bash
# List all linked projects
supabase links

# Switch between linked projects
supabase link --use staging
supabase link --use production

# Unlink project
supabase unlink --project-ref your-project-ref
```

### 3. Sync dengan Remote Projects
```bash
# Push local changes to remote
supabase db push --remote staging

# Pull remote changes to local
supabase db pull --remote staging

# Compare local vs remote
supabase db diff --use-migra --remote staging
```

### 4. Environment-Specific Configuration
```bash
# supabase/config.toml
[api]
port = 54321

[db]
port = 54322
major_version = 15

# Environment-specific overrides
# supabase/config.staging.toml
[api]
port = 54321

# supabase/config.production.toml
[api]
port = 54321
```

## Security Considerations

### 1. Environment Variables Security

#### ✅ Secure Practices
```bash
# Use .env.local for local overrides (not committed)
# Use secret management services in production
# Rotate keys regularly
# Use least privilege principle
```

#### ❌ Insecure Practices
```bash
# ❌ NEVER commit actual keys to repository
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ❌ NEVER use production keys in development
DATABASE_URL=postgresql://user:password@prod-db...

# ❌ NEVER store secrets in client-side code
```

### 2. API Key Management

#### Service Role Keys (Server-side Only)
```typescript
// Server-side only - NEVER expose to client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-only key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

#### Anon Keys (Client-side Safe)
```typescript
// Client-side - safe to expose
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Client-safe key
)
```

### 3. Database Security

#### Row Level Security (RLS)
```sql
-- Ensure RLS is enabled on all tables
ALTER TABLE species ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create appropriate policies
CREATE POLICY "Public read access" ON species
FOR SELECT USING (true);

CREATE POLICY "Authenticated write access" ON species
FOR INSERT, UPDATE, DELETE USING (
  auth.role() = 'authenticated' AND
  -- Additional checks for user roles
);
```

#### Database User Permissions
```sql
-- Grant appropriate permissions
-- anon (unauthenticated users)
GRANT SELECT ON species TO anon;

-- authenticated (logged-in users)
GRANT SELECT, INSERT, UPDATE ON species TO authenticated;

-- service_role (server-side operations)
GRANT ALL ON species TO service_role;
```

### 4. Production Security Checklist

```bash
# ✅ Security Checklist Before Production Deployment:

# 1. Environment Variables
□ All secrets stored in secure environment variables
□ Production keys not committed to repository
□ API keys have minimal required permissions
□ Keys are rotated regularly

# 2. Database Security
□ RLS enabled on all tables
□ Appropriate RLS policies in place
□ Database connections using SSL
□ Regular backups enabled
□ Point-in-time recovery configured

# 3. Application Security
□ HTTPS enforced in production
□ CORS policies configured
□ Rate limiting enabled
□ Input validation in place
□ SQL injection protection

# 4. Monitoring and Logging
□ Error tracking configured
□ Performance monitoring enabled
□ Database query logging
□ Security event monitoring
```

## Backup dan Restore Procedures

### 1. Local Development Backups

#### Manual Backup
```bash
# Dump database structure
supabase db dump --data-only --schema=public > backup_data.sql

# Dump with schema
supabase db dump --schema=public > full_backup.sql

# Specific table backup
supabase db shell -c "COPY species TO 'species_backup.csv' WITH CSV HEADER;"
```

#### Automated Backup Script
```bash
#!/bin/bash
# scripts/backup-local.sh

BACKUP_DIR="./backups/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

echo "Creating backup in $BACKUP_DIR"

# Backup schema
supabase db dump --schema-only > "$BACKUP_DIR/schema.sql"

# Backup data
supabase db dump --data-only --schema=public > "$BACKUP_DIR/data.sql"

# Backup migrations
cp -r supabase/migrations/ "$BACKUP_DIR/"

echo "Backup completed: $BACKUP_DIR"
```

### 2. Remote Environment Backups

#### Supabase Dashboard Backups
```bash
# Via Supabase Dashboard:
# Settings > Database > Backups

# Enable daily backups
# Configure retention period
# Test restore process
```

#### Programmatic Backups
```typescript
// lib/backup.ts
export const createDatabaseBackup = async () => {
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // This is a conceptual example - actual backup implementation
    // would depend on your backup strategy
    const { data, error } = await supabaseAdmin
      .from('species')
      .select('*')

    if (error) throw error

    // Save backup data to file or external storage
    console.log(`Backup created with ${data?.length} records`)
    return data
  } catch (error) {
    console.error('Backup failed:', error)
    throw error
  }
}
```

### 3. Restore Procedures

#### Local Development Restore
```bash
# Restore from backup
supabase db reset  # Reset to clean state
supabase db shell -c "\i backup_data.sql"

# Or restore specific table
supabase db shell -c "COPY species FROM 'species_backup.csv' WITH CSV HEADER;"
```

#### Production Restore
```bash
# ⚠️ CRITICAL: Production restore procedures

# 1. Notify team of maintenance window
# 2. Create immediate backup before restore
# 3. Use Supabase Dashboard restore feature
# 4. Or execute restore via psql
# 5. Verify data integrity
# 6. Test application functionality
# 7. Monitor for issues
```

### 4. Disaster Recovery Plan

#### Recovery Checklist
```bash
# 🚨 Disaster Recovery Checklist

# Immediate Actions (0-30 minutes):
□ Assess scope and impact
□ Notify stakeholders
□ Begin incident response
□ Create emergency backup (if possible)

# Recovery (30-2 hours):
□ Identify root cause
□ Implement fix
□ Restore from backup if needed
□ Verify data integrity

# Post-Recovery (2-24 hours):
□ Test all functionality
□ Monitor performance
□ Document incident
□ Update prevention measures
```

#### Recovery Scripts
```bash
#!/bin/bash
# scripts/emergency-restore.sh

EMERGENCY_BACKUP="$1"
RECOVERY_LOG="./logs/emergency-recovery-$(date +%Y%m%d-%H%M%S).log"

echo "Emergency restore started at $(date)" | tee -a "$RECOVERY_LOG"

# Stop application
echo "Stopping application..." | tee -a "$RECOVERY_LOG"
npm run stop 2>/dev/null || true

# Create pre-restore backup
echo "Creating pre-restore backup..." | tee -a "$RECOVERY_LOG"
supabase db dump > "./backups/pre-emergency-restore-$(date +%Y%m%d-%H%M%S).sql"

# Restore from backup
if [ -f "$EMERGENCY_BACKUP" ]; then
    echo "Restoring from $EMERGENCY_BACKUP..." | tee -a "$RECOVERY_LOG"
    supabase db reset
    supabase db shell -c "\i $EMERGENCY_BACKUP" 2>&1 | tee -a "$RECOVERY_LOG"

    if [ $? -eq 0 ]; then
        echo "Restore completed successfully" | tee -a "$RECOVERY_LOG"
        npm run start
    else
        echo "❌ Restore failed! Check logs and investigate manually." | tee -a "$RECOVERY_LOG"
        exit 1
    fi
else
    echo "❌ Backup file not found: $EMERGENCY_BACKUP" | tee -a "$RECOVERY_LOG"
    exit 1
fi

echo "Emergency restore completed at $(date)" | tee -a "$RECOVERY_LOG"
```

## Quick Reference Commands

```bash
# Seeding Operations
supabase db reset                    # Reset and seed database
supabase db shell                    # Open database shell
supabase db dump                     # Dump database
supabase db restore <file>          # Restore from dump

# Environment Setup
./scripts/setup-env.sh development   # Setup dev environment
./scripts/setup-env.sh staging      # Setup staging environment
./scripts/setup-env.sh production   # Setup production environment

# Remote Operations
supabase link                       # Link to remote project
supabase unlink                     # Unlink from project
supabase links                      # List linked projects
supabase db push                    # Push to remote
supabase db pull                    # Pull from remote

# Backup and Restore
./scripts/backup-local.sh           # Local backup
supabase db dump > backup.sql       # Manual backup
supabase db reset && supabase db shell -c "\i backup.sql"  # Restore

# Security
./scripts/security-check.sh         # Security audit
supabase status                     # Check services
```

# Database Quick Reference

Commands dan referensi cepat untuk operasi database yang sering digunakan.

## Essential Commands

### Supabase Local Development
```bash
# Start/Stop Services
supabase start                          # Start semua layanan lokal
supabase stop                           # Stop semua layanan
supabase stop --backup                  # Stop dengan backup

# Database Operations
supabase db reset                       # Reset database + seed data
supabase db shell                       # Buka psql shell
supabase db push                        # Push migrasi ke remote
supabase db pull                        # Pull migrasi dari remote

# Status Monitoring
supabase status                         # Cek status services
supabase logs                           # Lihat semua logs
supabase logs db                        # Database logs saja
```

### Migration Management
```bash
# Create Migrations
supabase migration new add_table_name    # Buat migrasi baru
supabase db diff --schema public -f change_name  # Generate dari perubahan

# Apply Migrations
supabase migration list                 # List status migrasi
supabase migration apply version       # Apply migrasi spesifik
supabase db push                       # Push ke linked project

# Migration Debugging
supabase migration sync                 # Sync migrasi dengan remote
supabase db diff                       # Lihat perbedaan schema
```

### Environment Setup
```bash
# Environment Files
cp .env.example .env                    # Copy template
./scripts/setup-env.sh development     # Setup environment

# Project Linking
supabase link --project-ref abcdef...   # Link ke project
supabase links                         # List linked projects
supabase unlink                        # Unlink project
```

## Schema Information

### Core Tables
```sql
-- Tables utama di database:
species                 -- Data flora dan fauna
taxonomy_hierarchy     -- Klasifikasi taksonomi
conservation_data      -- Data konservasi detail
species_images        -- Gambar dan media

-- Metadata tables:
seed_metadata          -- Informasi seeding
schema_migrations     -- Tracking migrasi
```

### Important Functions
```sql
-- Search functionality
search_species(search_term)             -- Pencarian species
get_featured_species(limit_count)       -- Species unggulan

-- Utility functions
generate_slug(input_text)               -- Generate URL slug
handle_updated_at()                     -- Auto-update timestamp
```

### Common Queries
```sql
-- Get all species with images
SELECT s.*, si.image_url
FROM species s
LEFT JOIN species_images si ON s.id = si.species_id
WHERE si.is_primary = true;

-- Search species by name
SELECT * FROM search_species('tiger');

-- Get species by conservation status
SELECT * FROM species
WHERE iucn_status = 'EN'  -- Endangered
ORDER BY scientific_name;

-- Get featured species
SELECT * FROM get_featured_species(8);
```

## Environment Variables Template

### Required Variables
```bash
# Database Connection
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://user:pass@host:port/db

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional Variables
```bash
# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=false
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_DEBUG_MODE=true

# File Upload
NEXT_PUBLIC_IMAGE_UPLOAD_ENABLED=true
NEXT_PUBLIC_MAX_FILE_SIZE=5242880

# Supabase CLI
SUPABASE_PROJECT_ID=your_project_id
SUPABASE_ACCESS_TOKEN=your_access_token
```

## Troubleshooting Quick Fixes

### Port Conflicts
```bash
# Kill process on port
sudo lsof -i :54321    # Check port
kill -9 <PID>         # Kill process

# Change ports in config.toml
[api]
port = 54325          # Change API port

[db]
port = 54323          # Change DB port
```

### Connection Issues
```bash
# Restart services
supabase stop
supabase start

# Check status
supabase status

# Reset database
supabase db reset
```

### Migration Issues
```bash
# Check migration status
supabase migration list

# Force apply specific migration
supabase migration apply 20251107120000

# Reset and reapply
supabase db reset
```

### Docker Issues
```bash
# Check Docker status
docker --version
docker ps

# Restart Docker
sudo systemctl restart docker

# Clean up Docker
docker system prune -a
```

## Local URLs and Ports

### Default Local Services
```
Supabase API:       http://localhost:54321
Supabase Studio:    http://localhost:54323
Database:           postgresql://postgres:postgres@localhost:54322/postgres
Email Testing:      http://localhost:54324
Next.js App:        http://localhost:3000
```

### Getting API Keys
```bash
# Start Supabase
supabase start

# Keys appear in output:
# anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Or check status
supabase status
```

## File Structure Reference

```
Project Root/
├── .env                          # Environment variables (local)
├── .env.example                  # Template environment variables
├── supabase/
│   ├── config.toml              # Supabase configuration
│   ├── seed.sql                 # Sample data for development
│   └── migrations/              # Database schema migrations
│       ├── 20250125124435_init.sql
│       └── 20251107160454_species_schema.sql
├── lib/
│   ├── supabase.ts             # Client-side Supabase client
│   └── supabase-server.ts       # Server-side Supabase client
├── app/
│   └── api/                    # API routes
└── documentation/
    └── DATABASE_GUIDE.md       # This guide
```

## Common Development Workflow

### Daily Development
```bash
# 1. Start services
supabase start

# 2. Start development server
npm run dev

# 3. Make schema changes
supabase db shell
# -> ALTER TABLE species ADD COLUMN new_column text;

# 4. Generate migration
supabase db diff --schema public -f add_new_column

# 5. Test changes
# -> Test in browser, API, etc.

# 6. Reset if needed
supabase db reset
```

### Making Database Changes
```bash
# Method 1: Interactive
supabase db shell
# Make changes directly

# Method 2: Migration files
supabase migration new your_changes
# Edit migration file manually
supabase db push

# Method 3: Generate from diff
# Make changes in db shell
supabase db diff -f feature_name
```

### Deploying Changes
```bash
# Development to Staging
supabase link --project-ref staging-ref
supabase db push

# Staging to Production
supabase link --project-ref prod-ref
supabase db push

# Always test on staging first!
```

## Data Management

### Seeding Data
```bash
# Reset and seed
supabase db reset

# Manual seed
supabase db shell -c "\i supabase/seed.sql"

# Check seeded data
supabase db shell -c "SELECT COUNT(*) FROM species;"
```

### Backup Data
```bash
# Full backup
supabase db dump > backup_$(date +%Y%m%d).sql

# Data only
supabase db dump --data-only > data_backup.sql

# Schema only
supabase db dump --schema-only > schema_backup.sql
```

### Export Data
```bash
# Export table to CSV
supabase db shell -c "COPY species TO 'species.csv' WITH CSV HEADER;"

# Export with conditions
supabase db shell -c "COPY (SELECT * FROM species WHERE featured = true) TO 'featured_species.csv' WITH CSV HEADER;"
```

## Security Quick Checklist

### Before Committing
- [ ] No real passwords or API keys in code
- [ ] `.env` not committed (in `.gitignore`)
- [ ] Use environment variables for secrets
- [ ] RLS policies enabled on sensitive tables
- [ ] Anon keys have minimal permissions

### Before Production Deploy
- [ ] Test all migrations on staging
- [ ] Create database backup
- [ ] Verify RLS policies work correctly
- [ ] Check API key permissions
- [ ] Enable logging and monitoring

## Glossary

### Supabase Terms
- **RLS (Row Level Security)**: Database-level access control
- **Migration**: Database schema change script
- **Seed**: Initial data for development
- **Anon Key**: Public API key (client-safe)
- **Service Role Key**: Admin API key (server-only)
- **Project Ref**: Unique project identifier

### Database Terms
- **Schema**: Database structure definition
- **Foreign Key**: Relationship between tables
- **Index**: Performance optimization for queries
- **Constraint**: Data validation rule
- **Trigger**: Automatic action on data changes

## Getting Help

### Documentation Links
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Database Integration](https://nextjs.org/docs/app/building-your-application/data-fetching)

### Community Support
- [Supabase Discord](https://discord.supabase.com/)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

### Debug Information
```bash
# Get system info for bug reports
supabase status
node --version
npm --version
docker --version
echo $SHELL
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Database Integration](https://nextjs.org/docs/app/building-your-application/data-fetching)