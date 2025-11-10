-- Migration: Create species database schema for biodiversity encyclopedia
-- Fixed version (ordered & validated for Supabase/PostgreSQL)

-- Enable extension for UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create species table
CREATE TABLE "public"."species" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "scientific_name" text NOT NULL,
    "common_name" text,
    "slug" text NOT NULL,
    "kingdom" text,
    "phylum" text,
    "class" text,
    "order" text,
    "family" text,
    "genus" text,
    "species" text,
    "description" text,
    "morphology" text,
    "habitat_description" text,
    "conservation_status" text,
    "iucn_status" text,
    "featured" boolean DEFAULT false,
    "image_urls" jsonb DEFAULT '[]'::jsonb,
    "habitat_map_coords" jsonb,
    "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "species_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "species_scientific_name_check" CHECK (char_length(scientific_name) >= 2),
    CONSTRAINT "species_slug_check" CHECK (char_length(slug) >= 2)
);

-- Create taxonomy_hierarchy table
CREATE TABLE "public"."taxonomy_hierarchy" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "species_id" uuid NOT NULL REFERENCES "public"."species"("id") ON DELETE CASCADE,
    "kingdom" text,
    "phylum" text,
    "class" text,
    "order" text,
    "family" text,
    "genus" text,
    "species" text,
    "subspecies" text,
    "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "taxonomy_hierarchy_pkey" PRIMARY KEY ("id")
);

-- Create conservation_data table
CREATE TABLE "public"."conservation_data" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "species_id" uuid NOT NULL REFERENCES "public"."species"("id") ON DELETE CASCADE,
    "iucn_status" text,
    "iucn_category" text,
    "population_trend" text,
    "population_size" text,
    "threat_level" text,
    "threats" text[],
    "conservation_actions" text[],
    "habitat_protection" boolean,
    "last_assessed" timestamptz,
    "assessor" text,
    "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "conservation_data_pkey" PRIMARY KEY ("id")
);

-- Create species_images table
CREATE TABLE "public"."species_images" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "species_id" uuid NOT NULL REFERENCES "public"."species"("id") ON DELETE CASCADE,
    "image_url" text NOT NULL,
    "alt_text" text,
    "caption" text,
    "photographer" text,
    "license" text,
    "is_primary" boolean DEFAULT false,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "species_images_pkey" PRIMARY KEY ("id")
);

-- Add descriptive field for encyclopedia content
ALTER TABLE public.species
ADD COLUMN IF NOT EXISTS info_detail text;

-- Enable Row Level Security
ALTER TABLE "public"."species" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."taxonomy_hierarchy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."conservation_data" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."species_images" ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE UNIQUE INDEX "species_slug_key" ON "public"."species" ("slug");
CREATE INDEX "species_scientific_name_idx" ON "public"."species" ("scientific_name");
CREATE INDEX "species_common_name_idx" ON "public"."species" ("common_name");
CREATE INDEX "species_featured_idx" ON "public"."species" ("featured");
CREATE INDEX "species_iucn_status_idx" ON "public"."species" ("iucn_status");
CREATE INDEX "taxonomy_hierarchy_species_id_idx" ON "public"."taxonomy_hierarchy" ("species_id");
CREATE INDEX "conservation_data_species_id_idx" ON "public"."conservation_data" ("species_id");
CREATE INDEX "species_images_species_id_idx" ON "public"."species_images" ("species_id");

-- =============================
-- Functions and Triggers
-- =============================

-- Update timestamp function
CREATE OR REPLACE FUNCTION "public"."handle_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "handle_species_updated_at"
BEFORE UPDATE ON "public"."species"
FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();

CREATE TRIGGER "handle_conservation_data_updated_at"
BEFORE UPDATE ON "public"."conservation_data"
FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();

-- Slug generation function
CREATE OR REPLACE FUNCTION "public"."generate_slug"(input_text text)
RETURNS text AS $$
BEGIN
    RETURN regexp_replace(
        lower(regexp_replace(input_text, '[^a-zA-Z0-9\\s-]', '', 'g')),
        '\\s+', '-', 'g'
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Search function
CREATE OR REPLACE FUNCTION "public"."search_species"(search_query text)
RETURNS TABLE (
    id uuid,
    scientific_name text,
    common_name text,
    slug text,
    description text,
    iucn_status text,
    featured boolean,
    rank real
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.scientific_name,
        s.common_name,
        s.slug,
        s.description,
        s.iucn_status,
        s.featured,
        CASE
            WHEN lower(s.scientific_name) LIKE lower(search_query || '%') THEN 1.0
            WHEN lower(s.common_name) LIKE lower(search_query || '%') THEN 0.9
            WHEN lower(s.scientific_name) LIKE '%' || lower(search_query) || '%' THEN 0.8
            WHEN lower(s.common_name) LIKE '%' || lower(search_query) || '%' THEN 0.7
            ELSE 0.0
        END as rank
    FROM species s
    WHERE
        lower(s.scientific_name) LIKE '%' || lower(search_query) || '%'
        OR lower(s.common_name) LIKE '%' || lower(search_query) || '%'
    ORDER BY rank DESC, s.scientific_name ASC;
END;
$$ LANGUAGE plpgsql;

-- Featured species function
CREATE OR REPLACE FUNCTION "public"."get_featured_species"(limit_count integer DEFAULT 8)
RETURNS TABLE (
    id uuid,
    scientific_name text,
    common_name text,
    slug text,
    description text,
    iucn_status text,
    image_urls jsonb,
    featured boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.scientific_name,
        s.common_name,
        s.slug,
        s.description,
        s.iucn_status,
        s.image_urls,
        s.featured
    FROM species s
    WHERE s.featured = true
    ORDER BY random()
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =============================
-- RLS Policies
-- =============================

CREATE POLICY "Enable read access for all users" ON "public"."species" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON "public"."species" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON "public"."species" FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON "public"."species" FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON "public"."taxonomy_hierarchy" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON "public"."taxonomy_hierarchy" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON "public"."taxonomy_hierarchy" FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON "public"."taxonomy_hierarchy" FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON "public"."conservation_data" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON "public"."conservation_data" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON "public"."conservation_data" FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON "public"."conservation_data" FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON "public"."species_images" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON "public"."species_images" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON "public"."species_images" FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON "public"."species_images" FOR DELETE USING (auth.role() = 'authenticated');

-- =============================
-- Permissions
-- =============================

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION "public"."generate_slug" TO authenticated;
GRANT EXECUTE ON FUNCTION "public"."search_species" TO anon, authenticated;
GRANT EXECUTE ON FUNCTION "public"."get_featured_species" TO anon, authenticated;

NOTIFY pgrst, 'reload schema';