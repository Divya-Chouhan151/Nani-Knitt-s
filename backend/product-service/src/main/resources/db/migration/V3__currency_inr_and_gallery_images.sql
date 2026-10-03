-- Update prices from USD to INR (~85 multiplier)
UPDATE product_variants
SET price = ROUND(price * 85, 2),
    compare_at_price = CASE WHEN compare_at_price IS NOT NULL THEN ROUND(compare_at_price * 85, 2) ELSE NULL END;

-- Insert additional angle photos for bamboo keyboard
INSERT INTO product_images (id, product_id, url, alt_text, is_primary, sort_order)
VALUES
  ('20000001-0000-0000-0000-000000000011', 'c1f76d20-8e10-48e2-9b2f-4a0b271e8c91', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=1000&auto=format&fit=crop&q=80', 'Keyboard side mechanical profile', FALSE, 1),
  ('20000001-0000-0000-0000-000000000012', 'c1f76d20-8e10-48e2-9b2f-4a0b271e8c91', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1000&auto=format&fit=crop&q=80', 'Switch details and keycap texture', FALSE, 2),
  ('20000001-0000-0000-0000-000000000013', 'c1f76d20-8e10-48e2-9b2f-4a0b271e8c91', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=1000&auto=format&fit=crop&q=80', 'Full desktop workspace context', FALSE, 3);

-- Insert additional angle photos for vertical mouse
INSERT INTO product_images (id, product_id, url, alt_text, is_primary, sort_order)
VALUES
  ('20000001-0000-0000-0000-000000000021', 'd2e87c31-9f21-49f3-ac30-5b1c382f9d02', 'https://images.unsplash.com/photo-1626958390898-162d3577f293?w=1000&auto=format&fit=crop&q=80', 'Top-down ergonomic angle', FALSE, 1),
  ('20000001-0000-0000-0000-000000000022', 'd2e87c31-9f21-49f3-ac30-5b1c382f9d02', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1000&auto=format&fit=crop&q=80', 'Glide skates and optical sensor', FALSE, 2);

-- Insert additional angle photos for curved monitor
INSERT INTO product_images (id, product_id, url, alt_text, is_primary, sort_order)
VALUES
  ('20000001-0000-0000-0000-000000000031', 'a3b98d42-0a32-40a4-bd41-6c2d493a0e13', 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1000&auto=format&fit=crop&q=80', 'Back panel with ports and RGB aura', FALSE, 1),
  ('20000001-0000-0000-0000-000000000032', 'a3b98d42-0a32-40a4-bd41-6c2d493a0e13', 'https://images.unsplash.com/photo-1586775490184-b79f0621891f?w=1000&auto=format&fit=crop&q=80', 'Side curvature profile', FALSE, 2);
