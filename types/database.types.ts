export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            graphql: {
                Args: {
                    operationName?: string
                    query?: string
                    variables?: Json
                    extensions?: Json
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
    public: {
        Tables: {
            customers: {
                Row: {
                    id: string
                    stripe_customer_id: string | null
                }
                Insert: {
                    id: string
                    stripe_customer_id?: string | null
                }
                Update: {
                    id?: string
                    stripe_customer_id?: string | null
                }
                Relationships: []
            }
            prices: {
                Row: {
                    active: boolean | null
                    currency: string | null
                    description: string | null
                    id: string
                    interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
                    interval_count: number | null
                    metadata: Json | null
                    product_id: string | null
                    trial_period_days: number | null
                    type: Database["public"]["Enums"]["pricing_type"] | null
                    unit_amount: number | null
                }
                Insert: {
                    active?: boolean | null
                    currency?: string | null
                    description?: string | null
                    id: string
                    interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
                    interval_count?: number | null
                    metadata?: Json | null
                    product_id?: string | null
                    trial_period_days?: number | null
                    type?: Database["public"]["Enums"]["pricing_type"] | null
                    unit_amount?: number | null
                }
                Update: {
                    active?: boolean | null
                    currency?: string | null
                    description?: string | null
                    id?: string
                    interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
                    interval_count?: number | null
                    metadata?: Json | null
                    product_id?: string | null
                    trial_period_days?: number | null
                    type?: Database["public"]["Enums"]["pricing_type"] | null
                    unit_amount?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "prices_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            products: {
                Row: {
                    active: boolean | null
                    description: string | null
                    id: string
                    image: string | null
                    live_mode: boolean | null
                    marketing_features: string[] | null
                    metadata: Json | null
                    name: string | null
                }
                Insert: {
                    active?: boolean | null
                    description?: string | null
                    id: string
                    image?: string | null
                    live_mode?: boolean | null
                    marketing_features?: string[] | null
                    metadata?: Json | null
                    name?: string | null
                }
                Update: {
                    active?: boolean | null
                    description?: string | null
                    id?: string
                    image?: string | null
                    live_mode?: boolean | null
                    marketing_features?: string[] | null
                    metadata?: Json | null
                    name?: string | null
                }
                Relationships: []
            }
            quiz_results: {
                Row: {
                    correct_count: number
                    created_at: string
                    difficulty: "Beginner" | "Intermediate" | "Advanced"
                    finished_at: string | null
                    id: string
                    metadata: Json | null
                    questions_count: number
                    quiz_id: string
                    topic: "Taxonomy" | "Habitats" | "Conservation" | "Classification" | "SpeciesSpec"
                    user_id: string
                }
                Insert: {
                    correct_count: number
                    created_at?: string
                    difficulty: "Beginner" | "Intermediate" | "Advanced"
                    finished_at?: string | null
                    id?: string
                    metadata?: Json | null
                    questions_count: number
                    quiz_id: string
                    topic: "Taxonomy" | "Habitats" | "Conservation" | "Classification" | "SpeciesSpec"
                    user_id: string
                }
                Update: {
                    correct_count?: number
                    created_at?: string
                    difficulty?: "Beginner" | "Intermediate" | "Advanced"
                    finished_at?: string | null
                    id?: string
                    metadata?: Json | null
                    questions_count?: number
                    quiz_id?: string
                    topic?: "Taxonomy" | "Habitats" | "Conservation" | "Classification" | "SpeciesSpec"
                    user_id?: string
                }
                Relationships: []
            }
            species: {
                Row: {
                    id: string
                    scientific_name: string
                    common_name: string | null
                    slug: string
                    kingdom: string | null
                    phylum: string | null
                    class: string | null
                    order: string | null
                    family: string | null
                    genus: string | null
                    species: string | null
                    description: string | null
                    morphology: string | null
                    habitat_description: string | null
                    conservation_status: string | null
                    iucn_status: string | null
                    featured: boolean | null
                    image_urls: string[] | null
                    habitat_map_coords: Json | null
                    created_at: string
                    updated_at: string
                    info_detail: string | null
                }
                Insert: {
                    id?: string
                    scientific_name: string
                    common_name?: string | null
                    slug: string
                    kingdom?: string | null
                    phylum?: string | null
                    class?: string | null
                    order?: string | null
                    family?: string | null
                    genus?: string | null
                    species?: string | null
                    description?: string | null
                    morphology?: string | null
                    habitat_description?: string | null
                    conservation_status?: string | null
                    iucn_status?: string | null
                    featured?: boolean | null
                    image_urls?: string[] | null
                    habitat_map_coords?: Json | null
                    created_at?: string
                    updated_at?: string
                    info_detail?: string | null
                }
                Update: {
                    id?: string
                    scientific_name?: string
                    common_name?: string | null
                    slug?: string
                    kingdom?: string | null
                    phylum?: string | null
                    class?: string | null
                    order?: string | null
                    family?: string | null
                    genus?: string | null
                    species?: string | null
                    description?: string | null
                    morphology?: string | null
                    habitat_description?: string | null
                    conservation_status?: string | null
                    iucn_status?: string | null
                    featured?: boolean | null
                    image_urls?: string[] | null
                    habitat_map_coords?: Json | null
                    created_at?: string
                    updated_at?: string
                    info_detail?: string | null
                }
                Relationships: []
            }
            submissions: {
                Row: {
                    contributor_email: string | null
                    contributor_name: string | null
                    content: string | null
                    created_at: string
                    id: string
                    moderator_notes: string | null
                    payload: Json
                    published: boolean
                    published_at: string | null
                    published_species_id: string | null
                    status: "pending" | "approved" | "rejected" | "flagged"
                    title: string
                    type: "image" | "text"
                    updated_at: string
                    url: string | null
                    user_id: string
                }
                Insert: {
                    contributor_email?: string | null
                    contributor_name?: string | null
                    content?: string | null
                    created_at?: string
                    id?: string
                    moderator_notes?: string | null
                    payload: Json
                    published?: boolean
                    published_at?: string | null
                    published_species_id?: string | null
                    status?: "pending" | "approved" | "rejected" | "flagged"
                    title: string
                    type?: "image" | "text"
                    updated_at?: string
                    url?: string | null
                    user_id: string
                }
                Update: {
                    contributor_email?: string | null
                    contributor_name?: string | null
                    content?: string | null
                    created_at?: string
                    id?: string
                    moderator_notes?: string | null
                    payload?: Json
                    published?: boolean
                    published_at?: string | null
                    published_species_id?: string | null
                    status?: "pending" | "approved" | "rejected" | "flagged"
                    title?: string
                    type?: "image" | "text"
                    updated_at?: string
                    url?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            conservation_data: {
                Row: {
                    id: string
                    species_id: string
                    iucn_status: string | null
                    iucn_category: string | null
                    population_trend: string | null
                    population_size: string | null
                    threat_level: string | null
                    threats: string[] | null
                    conservation_actions: string[] | null
                    habitat_protection: boolean | null
                    last_assessed: string | null
                    assessor: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    species_id: string
                    iucn_status?: string | null
                    iucn_category?: string | null
                    population_trend?: string | null
                    population_size?: string | null
                    threat_level?: string | null
                    threats?: string[] | null
                    conservation_actions?: string[] | null
                    habitat_protection?: boolean | null
                    last_assessed?: string | null
                    assessor?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    species_id?: string
                    iucn_status?: string | null
                    iucn_category?: string | null
                    population_trend?: string | null
                    population_size?: string | null
                    threat_level?: string | null
                    threats?: string[] | null
                    conservation_actions?: string[] | null
                    habitat_protection?: boolean | null
                    last_assessed?: string | null
                    assessor?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "conservation_data_species_id_fkey"
                        columns: ["species_id"]
                        isOneToOne: false
                        referencedRelation: "species"
                        referencedColumns: ["id"]
                    },
                ]
            }
            taxonomy_hierarchy: {
                Row: {
                    id: string
                    species_id: string
                    kingdom: string | null
                    phylum: string | null
                    class: string | null
                    order: string | null
                    family: string | null
                    genus: string | null
                    species: string | null
                    subspecies: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    species_id: string
                    kingdom?: string | null
                    phylum?: string | null
                    class?: string | null
                    order?: string | null
                    family?: string | null
                    genus?: string | null
                    species?: string | null
                    subspecies?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    species_id?: string
                    kingdom?: string | null
                    phylum?: string | null
                    class?: string | null
                    order?: string | null
                    family?: string | null
                    genus?: string | null
                    species?: string | null
                    subspecies?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "taxonomy_hierarchy_species_id_fkey"
                        columns: ["species_id"]
                        isOneToOne: false
                        referencedRelation: "species"
                        referencedColumns: ["id"]
                    },
                ]
            }
            species_images: {
                Row: {
                    id: string
                    species_id: string
                    image_url: string
                    alt_text: string | null
                    caption: string | null
                    photographer: string | null
                    license: string | null
                    is_primary: boolean | null
                    sort_order: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    species_id: string
                    image_url: string
                    alt_text?: string | null
                    caption?: string | null
                    photographer?: string | null
                    license?: string | null
                    is_primary?: boolean | null
                    sort_order?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    species_id?: string
                    image_url?: string
                    alt_text?: string | null
                    caption?: string | null
                    photographer?: string | null
                    license?: string | null
                    is_primary?: boolean | null
                    sort_order?: number | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "species_images_species_id_fkey"
                        columns: ["species_id"]
                        isOneToOne: false
                        referencedRelation: "species"
                        referencedColumns: ["id"]
                    },
                ]
            }
            newsletter_signups: {
                Row: {
                    id: string
                    email: string
                    topic: string | null
                    source: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    topic?: string | null
                    source?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    topic?: string | null
                    source?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            subscriptions: {
                Row: {
                    cancel_at: string | null
                    cancel_at_period_end: boolean | null
                    canceled_at: string | null
                    created: string
                    current_period_end: string
                    current_period_start: string
                    ended_at: string | null
                    id: string
                    metadata: Json | null
                    price_id: string | null
                    quantity: number | null
                    status: Database["public"]["Enums"]["subscription_status"] | null
                    trial_end: string | null
                    trial_start: string | null
                    user_id: string
                }
                Insert: {
                    cancel_at?: string | null
                    cancel_at_period_end?: boolean | null
                    canceled_at?: string | null
                    created?: string
                    current_period_end?: string
                    current_period_start?: string
                    ended_at?: string | null
                    id: string
                    metadata?: Json | null
                    price_id?: string | null
                    quantity?: number | null
                    status?: Database["public"]["Enums"]["subscription_status"] | null
                    trial_end?: string | null
                    trial_start?: string | null
                    user_id: string
                }
                Update: {
                    cancel_at?: string | null
                    cancel_at_period_end?: boolean | null
                    canceled_at?: string | null
                    created?: string
                    current_period_end?: string
                    current_period_start?: string
                    ended_at?: string | null
                    id?: string
                    metadata?: Json | null
                    price_id?: string | null
                    quantity?: number | null
                    status?: Database["public"]["Enums"]["subscription_status"] | null
                    trial_end?: string | null
                    trial_start?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "subscriptions_price_id_fkey"
                        columns: ["price_id"]
                        isOneToOne: false
                        referencedRelation: "prices"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            requesting_user_id: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            search_species: {
                Args: {
                    search_query: string
                }
                Returns: {
                    id: string
                    scientific_name: string | null
                    common_name: string | null
                    slug: string | null
                    description: string | null
                    iucn_status: string | null
                    featured: boolean | null
                    rank: number | null
                }[]
            }
            get_featured_species: {
                Args: {
                    limit_count?: number | null
                }
                Returns: {
                    id: string
                    scientific_name: string | null
                    common_name: string | null
                    slug: string | null
                    description: string | null
                    iucn_status: string | null
                    image_urls: string[] | null
                    featured: boolean | null
                }[]
            }
        }
        Enums: {
            pricing_plan_interval: "day" | "week" | "month" | "year"
            pricing_type: "one_time" | "recurring"
            subscription_status:
            | "trialing"
            | "active"
            | "canceled"
            | "incomplete"
            | "incomplete_expired"
            | "past_due"
            | "unpaid"
            | "paused"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

