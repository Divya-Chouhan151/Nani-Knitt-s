-- Insert Categories
INSERT INTO categories (id, name, slug, parent_id, path, sort_order, is_active)
VALUES
  ('11111111-2222-3333-4444-555555555555', 'Electronics', 'electronics', NULL, '/electronics', 0, TRUE),
  ('e83e5891-b14a-4d7a-b5ea-16e0339d2c12', 'Keyboards & Mice', 'keyboards-and-mice', '11111111-2222-3333-4444-555555555555', '/electronics/keyboards-and-mice', 1, TRUE),
  ('77777777-8888-9999-aaaa-bbbbbbbbbbbb', 'Monitors', 'monitors', '11111111-2222-3333-4444-555555555555', '/electronics/monitors', 2, TRUE),
  ('99999999-aaaa-bbbb-cccc-dddddddddddd', 'Audio', 'audio', '11111111-2222-3333-4444-555555555555', '/electronics/audio', 3, TRUE),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Workspace Furniture', 'workspace-furniture', NULL, '/workspace-furniture', 4, TRUE);

-- Insert Products
INSERT INTO products (id, category_id, title, slug, short_description, description, base_attributes, is_active, is_featured, badge, average_rating, review_count, created_at)
VALUES
  (
    'c1f76d20-8e10-48e2-9b2f-4a0b271e8c91',
    'e83e5891-b14a-4d7a-b5ea-16e0339d2c12',
    'Ergonomic Bamboo Wireless Mechanical Keyboard',
    'ergonomic-bamboo-wireless-mechanical-keyboard',
    'Dual-mode Bluetooth 5.2 mechanical keyboard handcrafted with natural solid bamboo.',
    'Full detailed description of the bamboo wireless keyboard.',
    '{"connectivity": "Bluetooth 5.2 & USB-C", "material": "Solid Bamboo"}'::jsonb,
    TRUE,
    TRUE,
    'BESTSELLER',
    4.85,
    142,
    '2026-08-15 10:30:00+00'
  ),
  (
    'd2e87c31-9f21-49f3-ac30-5b1c382f9d02',
    'e83e5891-b14a-4d7a-b5ea-16e0339d2c12',
    'Precision Ergonomic Vertical Mouse',
    'precision-ergonomic-vertical-mouse',
    'Optical 4000 DPI vertical mouse engineered to alleviate wrist strain during long sessions.',
    'Full detailed description of vertical mouse.',
    '{"dpi": 4000, "sensor": "Optical"}'::jsonb,
    TRUE,
    FALSE,
    'SALE',
    4.60,
    89,
    '2026-08-18 11:00:00+00'
  ),
  (
    'a3b98d42-0a32-40a4-bd41-6c2d493a0e13',
    '77777777-8888-9999-aaaa-bbbbbbbbbbbb',
    'Ultra-Wide 34-Inch Curved Monitor (144Hz)',
    'ultra-wide-34-inch-curved-monitor',
    'Immersive WQHD 3440x1440 IPS display with HDR400 and USB-C 90W power delivery.',
    'Full description of curved monitor.',
    '{"refreshRate": "144Hz", "resolution": "3440x1440"}'::jsonb,
    TRUE,
    TRUE,
    'FEATURED',
    4.90,
    230,
    '2026-08-20 14:15:00+00'
  ),
  (
    'b4c09e53-1b43-41b5-ce52-7d3e5a4b1f24',
    '99999999-aaaa-bbbb-cccc-dddddddddddd',
    'Active Noise-Cancelling Studio Headphones',
    'active-noise-cancelling-studio-headphones',
    'Custom 45mm beryllium drivers delivering acoustic fidelity with 40-hour battery life.',
    'Full description of ANC headphones.',
    '{"batteryLife": "40 hours", "driverSize": "45mm"}'::jsonb,
    TRUE,
    FALSE,
    NULL,
    4.75,
    310,
    '2026-08-22 09:45:00+00'
  ),
  (
    'c5d10f64-2c54-42c6-df63-8e4f6b5c2035',
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    'Solid Walnut Desk Shelf & Monitor Riser',
    'solid-walnut-desk-shelf-monitor-riser',
    'Hand-finished North American walnut shelf with integrated aluminum tray and cable management.',
    'Full description of desk shelf.',
    '{"material": "Solid Walnut", "weightCapacity": "60kg"}'::jsonb,
    TRUE,
    FALSE,
    'NEW',
    4.92,
    95,
    '2026-08-28 16:00:00+00'
  ),
  (
    'd6e21075-3d65-43d7-e074-9f507c6d3146',
    'e83e5891-b14a-4d7a-b5ea-16e0339d2c12',
    'Custom Coiled Aviator USB-C Cable',
    'custom-coiled-aviator-usbc-cable',
    'Double-sleeved Paracord and Techflex cable with detachable GX16 quick-disconnect aviator connector.',
    'Full description of aviator cable.',
    '{"connector": "GX16 Aviator", "cableLength": "1.5m"}'::jsonb,
    TRUE,
    FALSE,
    NULL,
    4.40,
    52,
    '2026-09-01 12:00:00+00'
  ),
  (
    'e7f32186-4e76-44e8-f185-a0618d7e4257',
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    'Minimalist Felt & Cork Desk Pad',
    'minimalist-felt-cork-desk-pad',
    'Eco-friendly natural merino wool felt pad with anti-slip natural Portuguese cork backing.',
    'Full description of desk pad.',
    '{"dimensions": "900x400mm"}'::jsonb,
    TRUE,
    FALSE,
    NULL,
    4.65,
    78,
    '2026-09-02 15:20:00+00'
  ),
  (
    'f8043297-5f87-45f9-0296-b1729e8f5368',
    '77777777-8888-9999-aaaa-bbbbbbbbbbbb',
    'Modular Dual Monitor Aluminum Arm',
    'modular-dual-monitor-aluminum-arm',
    'Heavy-duty gas spring dual monitor mount supporting up to 32-inch displays with 360-degree rotation.',
    'Full description of monitor arm.',
    '{"vesa": "75x75, 100x100"}'::jsonb,
    TRUE,
    FALSE,
    NULL,
    4.50,
    64,
    '2026-09-04 10:10:00+00'
  );

-- Insert Default Variants (Pricing & Stock)
INSERT INTO product_variants (id, product_id, sku, price, compare_at_price, barcode, stock_quantity, stock_status, is_default)
VALUES
  ('10000001-0000-0000-0000-000000000001', 'c1f76d20-8e10-48e2-9b2f-4a0b271e8c91', 'KB-BAMBOO-BRN', 129.99, 159.99, '8901234567890', 45, 'IN_STOCK', TRUE),
  ('10000001-0000-0000-0000-000000000002', 'd2e87c31-9f21-49f3-ac30-5b1c382f9d02', 'MS-VERT-BLK', 59.50, 79.00, '8901234567891', 80, 'IN_STOCK', TRUE),
  ('10000001-0000-0000-0000-000000000003', 'a3b98d42-0a32-40a4-bd41-6c2d493a0e13', 'MON-34-CRV', 499.99, 599.99, '8901234567892', 15, 'IN_STOCK', TRUE),
  ('10000001-0000-0000-0000-000000000004', 'b4c09e53-1b43-41b5-ce52-7d3e5a4b1f24', 'HP-ANC-STU', 249.00, 299.00, '8901234567893', 4, 'LOW_STOCK', TRUE),
  ('10000001-0000-0000-0000-000000000005', 'c5d10f64-2c54-42c6-df63-8e4f6b5c2035', 'DSK-SHLF-WLN', 139.00, NULL, '8901234567894', 28, 'IN_STOCK', TRUE),
  ('10000001-0000-0000-0000-000000000006', 'd6e21075-3d65-43d7-e074-9f507c6d3146', 'CBL-COIL-AV', 34.99, 45.00, '8901234567895', 120, 'IN_STOCK', TRUE),
  ('10000001-0000-0000-0000-000000000007', 'e7f32186-4e76-44e8-f185-a0618d7e4257', 'PAD-FELT-CRK', 42.00, 50.00, '8901234567896', 65, 'IN_STOCK', TRUE),
  ('10000001-0000-0000-0000-000000000008', 'f8043297-5f87-45f9-0296-b1729e8f5368', 'ARM-DUAL-ALU', 119.50, 145.00, '8901234567897', 0, 'OUT_OF_STOCK', TRUE);

-- Insert Primary Images
INSERT INTO product_images (id, product_id, url, alt_text, is_primary, sort_order)
VALUES
  ('20000001-0000-0000-0000-000000000001', 'c1f76d20-8e10-48e2-9b2f-4a0b271e8c91', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80', 'Bamboo Mechanical Keyboard', TRUE, 0),
  ('20000001-0000-0000-0000-000000000002', 'd2e87c31-9f21-49f3-ac30-5b1c382f9d02', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80', 'Ergonomic Vertical Mouse', TRUE, 0),
  ('20000001-0000-0000-0000-000000000003', 'a3b98d42-0a32-40a4-bd41-6c2d493a0e13', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80', '34 Inch Curved Monitor', TRUE, 0),
  ('20000001-0000-0000-0000-000000000004', 'b4c09e53-1b43-41b5-ce52-7d3e5a4b1f24', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', 'Studio ANC Headphones', TRUE, 0),
  ('20000001-0000-0000-0000-000000000005', 'c5d10f64-2c54-42c6-df63-8e4f6b5c2035', 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600&auto=format&fit=crop&q=80', 'Walnut Desk Shelf', TRUE, 0),
  ('20000001-0000-0000-0000-000000000006', 'd6e21075-3d65-43d7-e074-9f507c6d3146', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80', 'Custom Coiled Cable', TRUE, 0),
  ('20000001-0000-0000-0000-000000000007', 'e7f32186-4e76-44e8-f185-a0618d7e4257', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80', 'Felt & Cork Desk Pad', TRUE, 0),
  ('20000001-0000-0000-0000-000000000008', 'f8043297-5f87-45f9-0296-b1729e8f5368', 'https://images.unsplash.com/photo-1586775490184-b79f0621891f?w=600&auto=format&fit=crop&q=80', 'Dual Monitor Arm', TRUE, 0);
