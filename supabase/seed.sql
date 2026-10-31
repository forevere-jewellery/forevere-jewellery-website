-- Seed Data for Forevere Jewellery

-- Seed Categories
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order) VALUES
('c1000000-0000-0000-0000-000000000001', 'Rings', 'rings', 'Exquisite solitaire, diamond, and gold rings for every occasion.', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800', 1),
('c1000000-0000-0000-0000-000000000002', 'Necklaces', 'necklaces', 'Timeless pendants, chokers, and diamond statement necklaces.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800', 2),
('c1000000-0000-0000-0000-000000000003', 'Earrings', 'earrings', 'Elegant studs, drop earrings, and gold hoops crafted to perfection.', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800', 3),
('c1000000-0000-0000-0000-000000000004', 'Bracelets', 'bracelets', 'Delicate gold chains, tennis bracelets, and diamond bangles.', '/images/products/elysian-diamond-tennis-bracelet.jpg', 4),
('c1000000-0000-0000-0000-000000000005', 'Anklets', 'anklets', 'Charming gold and pearl anklets for delicate elegance.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800', 5),
('c1000000-0000-0000-0000-000000000006', 'Pendants', 'pendants', 'Intricate solitary gemstone and gold initial pendants.', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800', 6)
ON CONFLICT (slug) DO NOTHING;

-- Seed Products
INSERT INTO public.products (id, name, slug, description, category_id, price, discount_percent, stock_quantity, images, is_featured, is_active) VALUES
('a1000000-0000-0000-0000-000000000001', 'Aethel Solitaire Diamond Ring', 'aethel-solitaire-diamond-ring', 'Handcrafted in 18K Yellow Gold with a brilliant 1.5 Carat lab-grown solitaire diamond.', 'c1000000-0000-0000-0000-000000000001', 14999.00, 10.00, 15, ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800'], true, true),
('a1000000-0000-0000-0000-000000000002', 'Celeste Diamond Pendant Necklace', 'celeste-diamond-pendant-necklace', 'Luminous pendant with round-cut diamonds suspended on an adjustable 18K white gold chain.', 'c1000000-0000-0000-0000-000000000002', 22499.00, 15.00, 10, ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800'], true, true),
('a1000000-0000-0000-0000-000000000003', 'Aura Pearl Drop Earrings', 'aura-pearl-drop-earrings', 'Natural South Sea pearls gracefully dangling from handcrafted 14K rose gold hooks.', 'c1000000-0000-0000-0000-000000000003', 8999.00, 0.00, 25, ARRAY['https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800'], true, true),
('a1000000-0000-0000-0000-000000000004', 'Elysian Diamond Tennis Bracelet', 'elysian-diamond-tennis-bracelet', 'Seamless row of micro-pave set diamonds in solid 18K white gold.', 'c1000000-0000-0000-0000-000000000004', 35000.00, 5.00, 8, ARRAY['/images/products/elysian-diamond-tennis-bracelet.jpg'], true, true),
('a1000000-0000-0000-0000-000000000005', 'Royal Emerald Gold Band', 'royal-emerald-gold-band', 'Deep green Zambian emeralds accented with baguette diamonds on 18K yellow gold.', 'c1000000-0000-0000-0000-000000000001', 18500.00, 0.00, 12, ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800'], false, true),
('a1000000-0000-0000-0000-000000000006', 'Seraphina Gold Charm Anklet', 'seraphina-gold-charm-anklet', 'Lightweight 14K gold chain anklet featuring subtle star and moon charms.', 'c1000000-0000-0000-0000-000000000005', 4999.00, 12.00, 30, ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- Seed Spend Discount Tiers
INSERT INTO public.spend_discount_tiers (id, min_spend, discount_percent) VALUES
('b1000000-0000-0000-0000-000000000001', 10000.00, 5.00),
('b1000000-0000-0000-0000-000000000002', 25000.00, 10.00),
('b1000000-0000-0000-0000-000000000003', 50000.00, 15.00)
ON CONFLICT DO NOTHING;

-- Seed Offers
INSERT INTO public.offers (id, title, description, bank_or_payment_method, discount_detail, image_url, active, sort_order) VALUES
('d1000000-0000-0000-0000-000000000001', 'HDFC Bank Special', 'Instant 10% Instant Discount on HDFC Credit Cards on orders above ₹15,000.', 'HDFC Credit Cards', '10% OFF up to ₹2,500', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600', true, 1),
('d1000000-0000-0000-0000-000000000002', 'Festive Gold Bonus', 'Flat ₹1,000 Cashback on UPI payments above ₹5,000.', 'UPI Payments', 'Flat ₹1,000 OFF', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600', true, 2)
ON CONFLICT DO NOTHING;

-- Seed Coupons
INSERT INTO public.coupons (id, code, discount_percent, min_order_value, max_uses, times_used, active) VALUES
('c2000000-0000-0000-0000-000000000001', 'WELCOME10', 10.00, 1000.00, 5000, 12, true),
('c2000000-0000-0000-0000-000000000002', 'FOREVERE20', 20.00, 20000.00, 1000, 5, true),
('c2000000-0000-0000-0000-000000000003', 'JEWEL500', NULL, 5000.00, 2000, 42, true)
ON CONFLICT (code) DO NOTHING;
UPDATE public.coupons SET discount_amount = 500.00 WHERE code = 'JEWEL500';

-- Seed Points Settings
INSERT INTO public.points_settings (id, points_per_currency_unit, point_name_singular, point_name_plural, point_to_coupon_conversion_rules) VALUES
('e1000000-0000-0000-0000-000000000001', 0.05, 'Jewel Point', 'Jewel Points', '[{"points": 100, "discount_amount": 100}, {"points": 250, "discount_amount": 300}, {"points": 500, "discount_amount": 700}]'::jsonb)
ON CONFLICT DO NOTHING;

-- Seed Homepage Content
INSERT INTO public.homepage_content (id, hero_image, hero_headline, hero_subheadline, about_us_text) VALUES
('f1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1920', 'Timeless Elegance, Crafted Forever', 'Discover our hand-curated collection of ethical diamond rings, gold necklaces, and heirloom jewelry.', 'At Forevere Jewellery, we believe that true luxury lies in master craftsmanship, ethical sourcing, and timeless beauty. Founded with a vision to revolutionize fine jewelry, every ring, necklace, and earring is meticulously created by master artisans using 100% recycled gold and ethically sourced conflict-free diamonds.')
ON CONFLICT DO NOTHING;

-- Seed Payment Methods
INSERT INTO public.payment_methods (id, name, enabled, icon, sort_order) VALUES
('a2000000-0000-0000-0000-000000000001', 'Credit / Debit Card', true, 'CreditCard', 1),
('a2000000-0000-0000-0000-000000000002', 'UPI / QR Code', true, 'QrCode', 2),
('a2000000-0000-0000-0000-000000000003', 'Net Banking', true, 'Building2', 3),
('a2000000-0000-0000-0000-000000000004', 'Wallets (Paytm / PhonePe)', true, 'Wallet', 4),
('a2000000-0000-0000-0000-000000000005', 'Cash on Delivery (COD)', true, 'Banknote', 5)
ON CONFLICT DO NOTHING;
