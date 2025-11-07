-- Migration: Create species database schema for biodiversity encyclopedia
-- This migration sets up the core tables needed for storing species information
-- including taxonomy, morphology, habitat, and conservation status data

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
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "species_scientific_name_check" CHECK ((char_length(scientific_name) >= 2)),
    CONSTRAINT "species_slug_check" CHECK ((char_length(slug) >= 2))
);

-- Create taxonomy_hierarchy table for hierarchical classification
CREATE TABLE "public"."taxonomy_hierarchy" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "species_id" uuid NOT NULL,
    "kingdom" text,
    "phylum" text,
    "class" text,
    "order" text,
    "family" text,
    "genus" text,
    "species" text,
    "subspecies" text,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "taxonomy_hierarchy_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE CASCADE
);

-- Create conservation_data table for detailed conservation information
CREATE TABLE "public"."conservation_data" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "species_id" uuid NOT NULL,
    "iucn_status" text,
    "iucn_category" text,
    "population_trend" text,
    "population_size" text,
    "threat_level" text,
    "threats" text[],
    "conservation_actions" text[],
    "habitat_protection" boolean,
    "last_assessed" timestamp with time zone,
    "assessor" text,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "conservation_data_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE CASCADE
);

-- Create species_images table for detailed image management
CREATE TABLE "public"."species_images" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "species_id" uuid NOT NULL,
    "image_url" text NOT NULL,
    "alt_text" text,
    "caption" text,
    "photographer" text,
    "license" text,
    "is_primary" boolean DEFAULT false,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "species_images_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE CASCADE
);

-- Enable Row Level Security on all tables
ALTER TABLE "public"."species" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."taxonomy_hierarchy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."conservation_data" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."species_images" ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE UNIQUE INDEX "species_pkey" ON "public"."species" USING btree ("id");
CREATE UNIQUE INDEX "species_slug_key" ON "public"."species" USING btree ("slug");
CREATE INDEX "species_scientific_name_idx" ON "public"."species" USING btree ("scientific_name");
CREATE INDEX "species_common_name_idx" ON "public"."species" USING btree ("common_name");
CREATE INDEX "species_featured_idx" ON "public"."species" USING btree ("featured");
CREATE INDEX "species_kingdom_idx" ON "public"."species" USING btree ("kingdom");
CREATE INDEX "species_iucn_status_idx" ON "public"."species" USING btree ("iucn_status");
CREATE INDEX "taxonomy_hierarchy_species_id_idx" ON "public"."taxonomy_hierarchy" USING btree ("species_id");
CREATE INDEX "conservation_data_species_id_idx" ON "public"."conservation_data" USING btree ("species_id");
CREATE INDEX "conservation_data_iucn_category_idx" ON "public"."conservation_data" USING btree ("iucn_category");
CREATE INDEX "species_images_species_id_idx" ON "public"."species_images" USING btree ("species_id");
CREATE INDEX "species_images_is_primary_idx" ON "public"."species_images" USING btree ("is_primary");

-- Set primary key constraints
ALTER TABLE "public"."species" ADD CONSTRAINT "species_pkey" PRIMARY KEY USING INDEX "species_pkey";
ALTER TABLE "public"."taxonomy_hierarchy" ADD CONSTRAINT "taxonomy_hierarchy_pkey" PRIMARY KEY USING btree ("id");
ALTER TABLE "public"."conservation_data" ADD CONSTRAINT "conservation_data_pkey" PRIMARY KEY USING btree ("id");
ALTER TABLE "public"."species_images" ADD CONSTRAINT "species_images_pkey" PRIMARY KEY USING btree ("id");

-- Add unique constraint for slug
ALTER TABLE "public"."species" ADD CONSTRAINT "species_slug_key" UNIQUE USING INDEX "species_slug_key";

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION "public"."handle_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER "handle_species_updated_at" BEFORE UPDATE ON "public"."species" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();
CREATE TRIGGER "handle_conservation_data_updated_at" BEFORE UPDATE ON "public"."conservation_data" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();

-- Create function to generate unique slugs
CREATE OR REPLACE FUNCTION "public"."generate_slug"("input_text" text)
RETURNS text AS $$
BEGIN
    -- Convert to lowercase and replace spaces/special chars with hyphens
    RETURN regexp_replace(
        lower(regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g')),
        '\s+', '-', 'g'
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function for full-text search
CREATE OR REPLACE FUNCTION "public"."search_species"("search_query" text)
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
            WHEN to_tsvector('english', s.scientific_name || ' ' || COALESCE(s.common_name, '') || ' ' || COALESCE(s.description, '')) @@ plainto_tsquery('english', search_query) THEN 0.6
            ELSE 0.0
        END as rank
    FROM species s
    WHERE
        lower(s.scientific_name) LIKE '%' || lower(search_query) || '%'
        OR lower(s.common_name) LIKE '%' || lower(search_query) || '%'
        OR to_tsvector('english', s.scientific_name || ' ' || COALESCE(s.common_name, '') || ' ' || COALESCE(s.description, '')) @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, s.scientific_name ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get featured species
CREATE OR REPLACE FUNCTION "public"."get_featured_species"("limit_count" integer DEFAULT 8)
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

-- Create RLS Policies
-- Species table policies
CREATE POLICY "Enable read access for all users" ON "public"."species" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON "public"."species" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON "public"."species" FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON "public"."species" FOR DELETE USING (auth.role() = 'authenticated');

-- Taxonomy hierarchy policies
CREATE POLICY "Enable read access for all users" ON "public"."taxonomy_hierarchy" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON "public"."taxonomy_hierarchy" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON "public"."taxonomy_hierarchy" FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON "public"."taxonomy_hierarchy" FOR DELETE USING (auth.role() = 'authenticated');

-- Conservation data policies
CREATE POLICY "Enable read access for all users" ON "public"."conservation_data" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON "public"."conservation_data" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON "public"."conservation_data" FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON "public"."conservation_data" FOR DELETE USING (auth.role() = 'authenticated');

-- Species images policies
CREATE POLICY "Enable read access for all users" ON "public"."species_images" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON "public"."species_images" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON "public"."species_images" FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON "public"."species_images" FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."species" TO "authenticated";
GRANT SELECT ON "public"."species" TO "anon";
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."taxonomy_hierarchy" TO "authenticated";
GRANT SELECT ON "public"."taxonomy_hierarchy" TO "anon";
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."conservation_data" TO "authenticated";
GRANT SELECT ON "public"."conservation_data" TO "anon";
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."species_images" TO "authenticated";
GRANT SELECT ON "public"."species_images" TO "anon";

-- Grant usage of functions
GRANT EXECUTE ON FUNCTION "public"."generate_slug" TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."search_species" TO "anon", "authenticated";
GRANT EXECUTE ON FUNCTION "public"."get_featured_species" TO "anon", "authenticated";