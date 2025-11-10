-- Seed data for biodiversity encyclopedia
-- This file contains sample species data for testing and development

-- Insert sample species data
INSERT INTO "public"."species" (
    "scientific_name", "common_name", "slug", "kingdom", "phylum", "class", "order", "family", "genus", "species",
    "description", "morphology", "habitat_description", "conservation_status", "iucn_status", "featured", "image_urls"
) VALUES
(
    'Panthera tigris',
    'Bengal Tiger',
    'bengal-tiger',
    'Animalia',
    'Chordata',
    'Mammalia',
    'Carnivora',
    'Felidae',
    'Panthera',
    'tigris',
    'The Bengal tiger is a majestic large cat native to the Indian subcontinent. Known for their distinctive orange coat with black stripes, these apex predators play a crucial role in maintaining ecosystem balance.',
    'Large muscular cat with orange fur and black stripes. Adult males weigh 180-260 kg, females 100-160 kg. Length: 2.5-3.9 meters including tail. Powerful jaws and sharp retractable claws.',
    'Tropical forests, grasslands, and mangrove swamps of India, Bangladesh, Nepal, and Bhutan. Requires dense vegetation cover and access to water.',
    'Endangered',
    'EN',
    true,
    '["https://images.unsplash.com/photo-1564349683136-77e08dba1ef4?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1542348469-35b4c6c888f9?ixlib=rb-4.0.3"]'::jsonb
),
(
    'Rosa damascena',
    'Damask Rose',
    'damask-rose',
    'Plantae',
    'Magnoliophyta',
    'Magnoliopsida',
    'Rosales',
    'Rosaceae',
    'Rosa',
    'damascena',
    'The Damask rose is a beautiful fragrant flower cultivated for thousands years for its essential oils and ornamental beauty. Native to the Middle East, it symbolizes love and beauty across cultures.',
    'Deciduous shrub growing 1-2 meters tall. Stems armed with curved thorns. Leaves are pinnate with 5-7 leaflets. Flowers are large, fragrant, with 30-50 petals in shades of pink and white.',
    'Temperate regions with full sun exposure. Well-drained, fertile soil. Native to mountain valleys of Central Asia, now cultivated worldwide in Bulgaria, Turkey, and Morocco.',
    'Least Concern',
    'LC',
    true,
    '["https://images.unsplash.com/photo-1528745098243-1f6d4fc7524a?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3"]'::jsonb
),
(
    'Ornithorhynchus anatinus',
    'Platypus',
    'platypus',
    'Animalia',
    'Chordata',
    'Mammalia',
    'Monotremata',
    'Ornithorhynchidae',
    'Ornithorhynchus',
    'anatinus',
    'The platypus is one of only five species of monotremes (egg-laying mammals) in the world. This unique creature combines features from mammals, birds, and reptiles in one fascinating package.',
    'Small aquatic mammal with a duck-like bill, webbed feet, and dense waterproof fur. Males have venomous spurs on hind legs. Length: 40-50 cm, weight: 0.7-2.4 kg.',
    'Freshwater rivers and streams in eastern Australia and Tasmania. Requires clean water with riverbanks for burrowing. Nocturnal and semi-aquatic.',
    'Least Concern',
    'LC',
    true,
    '["https://images.unsplash.com/photo-1572911609118-5ad60b4d8f5f?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3"]'::jsonb
),
(
    'Quercus robur',
    'English Oak',
    'english-oak',
    'Plantae',
    'Magnoliophyta',
    'Magnoliopsida',
    'Fagales',
    'Fagaceae',
    'Quercus',
    'robur',
    'The English oak is a magnificent long-lived tree that has shaped European landscapes and cultures for millennia. Its strength and durability made it a preferred timber for shipbuilding and construction.',
    'Large deciduous tree reaching 20-40 meters in height. Broad crown with sturdy branches. Lobed leaves 7-14 cm long. Produces acorns 2-2.5 cm long on long stalks. Bark is grey-brown and deeply fissured.',
    'Mixed woodlands across Europe and Asia Minor. Prefers deep, fertile, well-drained soils. Tolerant of shade when young, requires full sun when mature.',
    'Least Concern',
    'LC',
    true,
    '["https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?ixlib=rb-4.0.3"]'::jsonb
),
(
    'Ailuropoda melanoleuca',
    'Giant Panda',
    'giant-panda',
    'Animalia',
    'Chordata',
    'Mammalia',
    'Carnivora',
    'Ursidae',
    'Ailuropoda',
    'melanoleuca',
    'The giant panda is a beloved bear species native to China, renowned for its distinctive black and white coloration and specialized bamboo diet. A global symbol of wildlife conservation efforts.',
    'Large bear with distinctive black patches around eyes, ears, and across body. Adults weigh 80-125 kg. Strong jaw muscles and modified wrist bone to grip bamboo. Thick fur for insulation.',
    'Mountain forests of central China at 1,200-3,400 meters elevation. Dense bamboo forests with cool, moist conditions. Requires multiple bamboo species for food variety.',
    'Vulnerable',
    'VU',
    true,
    '["https://images.unsplash.com/photo-1564349683136-77e08dba1ef4?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1528745098243-1f6d4fc7524a?ixlib=rb-4.0.3"]'::jsonb
),
(
    'Helianthus annuus',
    'Common Sunflower',
    'common-sunflower',
    'Plantae',
    'Magnoliophyta',
    'Magnoliopsida',
    'Asterales',
    'Asteraceae',
    'Helianthus',
    'annuus',
    'The common sunflower is an impressive annual plant known for its large, bright flower heads that track the sun. Native to North America, it has been cultivated for thousands of years for its seeds and oil.',
    'Tall annual plant growing 1-3 meters high. Large flower heads up to 30 cm diameter composed of hundreds of small flowers. Rough hairy stems and large heart-shaped leaves. Seeds are large and edible.',
    'Open grasslands and prairies of North America. Cultivated worldwide in temperate regions. Prefers full sun and well-drained soil. Drought tolerant once established.',
    'Least Concern',
    'LC',
    true,
    '["https://images.unsplash.com/photo-1547514701-42782101795e?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1470092306007-5dc23cc91b25?ixlib=rb-4.0.3"]'::jsonb
);

-- Insert taxonomy hierarchy data
INSERT INTO "public"."taxonomy_hierarchy"
("species_id", "kingdom", "phylum", "class", "order", "family", "genus", "species")
SELECT
    id,
    kingdom,
    phylum,
    "class",
    "order",
    family,
    genus,
    species
FROM "public"."species";


-- Insert conservation data
INSERT INTO "public"."conservation_data" ("species_id", "iucn_status", "iucn_category", "population_trend", "population_size", "threat_level", "threats", "conservation_actions", "habitat_protection", "last_assessed")
VALUES
(
    (SELECT id FROM species WHERE scientific_name = 'Panthera tigris'),
    'Endangered',
    'EN',
    'Decreasing',
    '2,500-3,000 individuals',
    'Critical',
    ARRAY['Habitat loss', 'Poaching', 'Human-wildlife conflict', 'Prey depletion'],
    ARRAY['Protected areas', 'Anti-poaching patrols', 'Community engagement', 'Prey base restoration'],
    true,
    '2021-01-01'
),
(
    (SELECT id FROM species WHERE scientific_name = 'Rosa damascena'),
    'Least Concern',
    'LC',
    'Stable',
    'Unknown',
    'Low',
    ARRAY['Habitat loss', 'Overharvesting'],
    ARRAY['Cultivation programs', 'Habitat protection'],
    false,
    '2019-01-01'
),
(
    (SELECT id FROM species WHERE scientific_name = 'Ornithorhynchus anatinus'),
    'Least Concern',
    'LC',
    'Stable',
    'Unknown',
    'Low to Medium',
    ARRAY['Habitat loss', 'Water pollution', 'Climate change'],
    ARRAY['Water quality protection', 'Habitat restoration', 'Captive breeding programs'],
    true,
    '2016-01-01'
),
(
    (SELECT id FROM species WHERE scientific_name = 'Quercus robur'),
    'Least Concern',
    'LC',
    'Stable',
    'Unknown',
    'Low',
    ARRAY['Disease', 'Climate change', 'Deforestation'],
    ARRAY['Forest protection', 'Disease management', 'Reforestation'],
    true,
    '2020-01-01'
),
(
    (SELECT id FROM species WHERE scientific_name = 'Ailuropoda melanoleuca'),
    'Vulnerable',
    'VU',
    'Increasing',
    '1,864 individuals',
    'High',
    ARRAY['Habitat fragmentation', 'Bamboo die-offs', 'Climate change'],
    ARRAY['Protected reserves', 'Corridor creation', 'Captive breeding', 'Community programs'],
    true,
    '2016-01-01'
),
(
    (SELECT id FROM species WHERE scientific_name = 'Helianthus annuus'),
    'Least Concern',
    'LC',
    'Stable',
    'Unknown',
    'Very Low',
    ARRAY['Habitat loss'],
    ARRAY['Cultivation', 'Seed conservation'],
    false,
    '2018-01-01'
);

-- Insert species images
INSERT INTO "public"."species_images" ("species_id", "image_url", "alt_text", "caption", "photographer", "license", "is_primary", "sort_order")
VALUES
-- Bengal Tiger images
((SELECT id FROM species WHERE scientific_name = 'Panthera tigris'), 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef4?ixlib=rb-4.0.3', 'Adult Bengal tiger walking through grassland', 'A magnificent Bengal tiger patrols its territory in the Indian grasslands', 'Wildlife Photographer', 'CC BY-SA 4.0', true, 1),
((SELECT id FROM species WHERE scientific_name = 'Panthera tigris'), 'https://images.unsplash.com/photo-1542348469-35b4c6c888f9?ixlib=rb-4.0.3', 'Close-up of Bengal tiger face', 'Detailed portrait showing the distinctive stripe pattern of a Bengal tiger', 'Wildlife Photographer', 'CC BY-SA 4.0', false, 2),

-- Damask Rose images
((SELECT id FROM species WHERE scientific_name = 'Rosa damascena'), 'https://images.unsplash.com/photo-1528745098243-1f6d4fc7524a?ixlib=rb-4.0.3', 'Pink Damask rose in full bloom', 'Beautiful pink Damask rose with multiple layers of petals glistening with morning dew', 'Nature Photographer', 'CC BY-SA 4.0', true, 1),
((SELECT id FROM species WHERE scientific_name = 'Rosa damascena'), 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3', 'Close-up of Damask rose petals', 'Detailed view of the intricate petal structure of a Damask rose', 'Nature Photographer', 'CC BY-SA 4.0', false, 2),

-- Platypus images
((SELECT id FROM species WHERE scientific_name = 'Ornithorhynchus anatinus'), 'https://images.unsplash.com/photo-1572911609118-5ad60b4d8f5f?ixlib=rb-4.0.3', 'Platypus swimming in clear water', 'A platypus glides through crystal clear water in its natural habitat', 'Wildlife Photographer', 'CC BY-SA 4.0', true, 1),

-- English Oak images
((SELECT id FROM species WHERE scientific_name = 'Quercus robur'), 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?ixlib=rb-4.0.3', 'Majestic English oak tree in summer', 'A centuries-old English oak spreads its branches across a meadow', 'Landscape Photographer', 'CC BY-SA 4.0', true, 1),

-- Giant Panda images
((SELECT id FROM species WHERE scientific_name = 'Ailuropoda melanoleuca'), 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef4?ixlib=rb-4.0.3', 'Giant panda eating bamboo', 'A giant panda enjoys a meal of bamboo in a forest clearing', 'Wildlife Photographer', 'CC BY-SA 4.0', true, 1),
((SELECT id FROM species WHERE scientific_name = 'Ailuropoda melanoleuca'), 'https://images.unsplash.com/photo-1528745098243-1f6d4fc7524a?ixlib=rb-4.0.3', 'Giant panda resting', 'A tired giant panda rests after a day of feeding and playing', 'Wildlife Photographer', 'CC BY-SA 4.0', false, 2),

-- Common Sunflower images
((SELECT id FROM species WHERE scientific_name = 'Helianthus annuus'), 'https://images.unsplash.com/photo-1547514701-42782101795e?ixlib=rb-4.0.3', 'Field of sunflowers at sunset', 'A golden field of sunflowers basks in the warm sunset light', 'Nature Photographer', 'CC BY-SA 4.0', true, 1),
((SELECT id FROM species WHERE scientific_name = 'Helianthus annuus'), 'https://images.unsplash.com/photo-1470092306007-5dc23cc91b25?ixlib=rb-4.0.3', 'Close-up of sunflower face', 'Detailed view of a sunflower''s intricate spiral seed pattern', 'Nature Photographer', 'CC BY-SA 4.0', false, 2);

-- Sample newsletter signup
INSERT INTO public.newsletter_signups (email, topic, source)
VALUES ('explorer@example.com', 'species-updates', 'seed-data')
ON CONFLICT (email) DO NOTHING;
