import {
  Category,
  Product,
  SpendDiscountTier,
  Offer,
  Coupon,
  PointsSettings,
  HomepageContent,
  PaymentMethod,
  UserProfile,
  CartItem,
  Address,
  Order,
  PointsLedgerEntry,
  Review,
  RedeemableCoupon
} from '@/types/database';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    name: 'Rings',
    slug: 'rings',
    description: 'Exquisite solitaire, diamond, and gold rings for every occasion.',
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800',
    sort_order: 1
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Timeless pendants, chokers, and diamond statement necklaces.',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800',
    sort_order: 2
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    name: 'Earrings',
    slug: 'earrings',
    description: 'Elegant studs, drop earrings, and gold hoops crafted to perfection.',
    image_url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800',
    sort_order: 3
  },
  {
    id: 'c1000000-0000-0000-0000-000000000004',
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Delicate gold chains, tennis bracelets, and diamond bangles.',
    image_url: '/images/products/elysian-diamond-tennis-bracelet.jpg',
    sort_order: 4
  },
  {
    id: 'c1000000-0000-0000-0000-000000000005',
    name: 'Anklets',
    slug: 'anklets',
    description: 'Charming gold and pearl anklets for delicate elegance.',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800',
    sort_order: 5
  },
  {
    id: 'c1000000-0000-0000-0000-000000000006',
    name: 'Pendants',
    slug: 'pendants',
    description: 'Intricate solitary gemstone and gold initial pendants.',
    image_url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800',
    sort_order: 6
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1000000-0000-0000-0000-000000000001',
    name: 'Aethel Solitaire Diamond Ring',
    slug: 'aethel-solitaire-diamond-ring',
    description: 'Handcrafted in 18K Yellow Gold with a brilliant 1.5 Carat lab-grown solitaire diamond. Exceptional clarity and timeless elegance designed for forever.',
    category_id: 'c1000000-0000-0000-0000-000000000001',
    price: 14999.00,
    discount_percent: 10.00,
    stock_quantity: 15,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800'
    ],
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p1000000-0000-0000-0000-000000000002',
    name: 'Celeste Diamond Pendant Necklace',
    slug: 'celeste-diamond-pendant-necklace',
    description: 'Luminous pendant with round-cut pavé diamonds suspended on an adjustable 18K white gold chain.',
    category_id: 'c1000000-0000-0000-0000-000000000002',
    price: 22499.00,
    discount_percent: 15.00,
    stock_quantity: 10,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800'],
    video_url: null,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p1000000-0000-0000-0000-000000000003',
    name: 'Aura Pearl Drop Earrings',
    slug: 'aura-pearl-drop-earrings',
    description: 'Natural South Sea pearls gracefully dangling from handcrafted 14K rose gold hooks.',
    category_id: 'c1000000-0000-0000-0000-000000000003',
    price: 8999.00,
    discount_percent: 0.00,
    stock_quantity: 25,
    images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800'],
    video_url: null,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p1000000-0000-0000-0000-000000000004',
    name: 'Elysian Diamond Tennis Bracelet',
    slug: 'elysian-diamond-tennis-bracelet',
    description: 'Seamless row of micro-pave set diamonds in solid 18K white gold with safety clasp.',
    category_id: 'c1000000-0000-0000-0000-000000000004',
    price: 35000.00,
    discount_percent: 5.00,
    stock_quantity: 8,
    images: ['/images/products/elysian-diamond-tennis-bracelet.jpg'],
    video_url: null,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p1000000-0000-0000-0000-000000000005',
    name: 'Royal Emerald Gold Band',
    slug: 'royal-emerald-gold-band',
    description: 'Deep green Zambian emeralds accented with baguette diamonds on 18K yellow gold.',
    category_id: 'c1000000-0000-0000-0000-000000000001',
    price: 18500.00,
    discount_percent: 0.00,
    stock_quantity: 12,
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800'],
    video_url: null,
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p1000000-0000-0000-0000-000000000006',
    name: 'Seraphina Gold Charm Anklet',
    slug: 'seraphina-gold-charm-anklet',
    description: 'Lightweight 14K gold chain anklet featuring subtle star and moon charms.',
    category_id: 'c1000000-0000-0000-0000-000000000005',
    price: 4999.00,
    discount_percent: 12.00,
    stock_quantity: 30,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800'],
    video_url: null,
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_SPEND_TIERS: SpendDiscountTier[] = [
  { id: 't1', min_spend: 10000.00, discount_percent: 5.00 },
  { id: 't2', min_spend: 25000.00, discount_percent: 10.00 },
  { id: 't3', min_spend: 50000.00, discount_percent: 15.00 }
];

export const INITIAL_OFFERS: Offer[] = [
  {
    id: 'o1',
    title: 'HDFC Bank Special',
    description: 'Instant 10% Discount on HDFC Credit Cards on orders above ₹15,000.',
    bank_or_payment_method: 'HDFC Credit Cards',
    discount_detail: '10% OFF up to ₹2,500',
    image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600',
    active: true,
    sort_order: 1
  },
  {
    id: 'o2',
    title: 'Festive Gold Bonus',
    description: 'Flat ₹1,000 Cashback on UPI payments above ₹5,000.',
    bank_or_payment_method: 'UPI Payments',
    discount_detail: 'Flat ₹1,000 OFF',
    image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600',
    active: true,
    sort_order: 2
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cp1',
    code: 'WELCOME10',
    discount_percent: 10.00,
    discount_amount: null,
    min_order_value: 1000.00,
    max_uses: 5000,
    times_used: 12,
    active: true
  },
  {
    id: 'cp2',
    code: 'FOREVERE20',
    discount_percent: 20.00,
    discount_amount: null,
    min_order_value: 20000.00,
    max_uses: 1000,
    times_used: 5,
    active: true
  },
  {
    id: 'cp3',
    code: 'JEWEL500',
    discount_percent: null,
    discount_amount: 500.00,
    min_order_value: 5000.00,
    max_uses: 2000,
    times_used: 42,
    active: true
  }
];

export const INITIAL_POINTS_SETTINGS: PointsSettings = {
  id: 'ps1',
  points_per_currency_unit: 0.05,
  point_name_singular: 'Jewel Point',
  point_name_plural: 'Jewel Points',
  point_to_coupon_conversion_rules: [
    { points: 100, discount_amount: 100 },
    { points: 250, discount_amount: 300 },
    { points: 500, discount_amount: 700 }
  ]
};

export const INITIAL_HOMEPAGE_CONTENT: HomepageContent = {
  id: 'hp1',
  hero_image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1920',
  hero_headline: 'Timeless Elegance, Crafted Forever',
  hero_subheadline: 'Discover our hand-curated collection of ethical diamond rings, gold necklaces, and heirloom jewelry.',
  about_us_text: 'At Forevere Jewellary, we believe that true luxury lies in master craftsmanship, ethical sourcing, and timeless beauty. Founded with a vision to revolutionize fine jewelry, every ring, necklace, and earring is meticulously created by master artisans using 100% recycled gold and ethically sourced conflict-free diamonds.'
};

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm1', name: 'Credit / Debit Card', enabled: true, icon: 'CreditCard', sort_order: 1 },
  { id: 'pm2', name: 'UPI / QR Code', enabled: true, icon: 'QrCode', sort_order: 2 },
  { id: 'pm3', name: 'Net Banking', enabled: true, icon: 'Building2', sort_order: 3 },
  { id: 'pm4', name: 'Wallets (Paytm / PhonePe)', enabled: true, icon: 'Wallet', sort_order: 4 },
  { id: 'pm5', name: 'Cash on Delivery (COD)', enabled: true, icon: 'Banknote', sort_order: 5 }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    product_id: 'p1000000-0000-0000-0000-000000000001',
    user_id: 'u-sample-1',
    rating: 5,
    comment: 'Absolutely stunning solitaire ring! The brilliance of the diamond in sunlight is unbelievable.',
    created_at: '2026-08-15T10:30:00Z',
    user_name: 'Sophia L.'
  },
  {
    id: 'r2',
    product_id: 'p1000000-0000-0000-0000-000000000002',
    user_id: 'u-sample-2',
    rating: 5,
    comment: 'The chain is so delicate yet sturdy, and the pendant catches every ray of light. Loved the gift packaging!',
    created_at: '2026-08-20T14:15:00Z',
    user_name: 'Elena R.'
  }
];

// In-Memory Storage Manager for fallback client
class MockDBStore {
  categories: Category[] = [...INITIAL_CATEGORIES];
  products: Product[] = [...INITIAL_PRODUCTS];
  spendTiers: SpendDiscountTier[] = [...INITIAL_SPEND_TIERS];
  offers: Offer[] = [...INITIAL_OFFERS];
  coupons: Coupon[] = [...INITIAL_COUPONS];
  pointsSettings: PointsSettings = { ...INITIAL_POINTS_SETTINGS };
  homepageContent: HomepageContent = { ...INITIAL_HOMEPAGE_CONTENT };
  paymentMethods: PaymentMethod[] = [...INITIAL_PAYMENT_METHODS];
  reviews: Review[] = [...INITIAL_REVIEWS];
  users: UserProfile[] = [];
  addresses: Address[] = [];
  cartItems: CartItem[] = [];
  orders: Order[] = [];
  pointsLedger: PointsLedgerEntry[] = [];
  redeemableCoupons: RedeemableCoupon[] = [];
  currentUser: UserProfile | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromLocalStorage();
    }
  }

  loadFromLocalStorage() {
    try {
      const savedProducts = localStorage.getItem('fj_products');
      if (savedProducts) this.products = JSON.parse(savedProducts);

      const savedCategories = localStorage.getItem('fj_categories');
      if (savedCategories) this.categories = JSON.parse(savedCategories);

      const savedHomepage = localStorage.getItem('fj_homepage');
      if (savedHomepage) this.homepageContent = JSON.parse(savedHomepage);

      const savedPaymentMethods = localStorage.getItem('fj_payment_methods');
      if (savedPaymentMethods) this.paymentMethods = JSON.parse(savedPaymentMethods);

      const savedOrders = localStorage.getItem('fj_orders');
      if (savedOrders) this.orders = JSON.parse(savedOrders);

      const savedCart = localStorage.getItem('fj_cart');
      if (savedCart) this.cartItems = JSON.parse(savedCart);

      const savedAddresses = localStorage.getItem('fj_addresses');
      if (savedAddresses) this.addresses = JSON.parse(savedAddresses);

      const savedCoupons = localStorage.getItem('fj_coupons');
      if (savedCoupons) this.coupons = JSON.parse(savedCoupons);

      const savedOffers = localStorage.getItem('fj_offers');
      if (savedOffers) this.offers = JSON.parse(savedOffers);

      const savedSpendTiers = localStorage.getItem('fj_spend_tiers');
      if (savedSpendTiers) this.spendTiers = JSON.parse(savedSpendTiers);

      const savedPointsSettings = localStorage.getItem('fj_points_settings');
      if (savedPointsSettings) this.pointsSettings = JSON.parse(savedPointsSettings);

      const savedPointsLedger = localStorage.getItem('fj_points_ledger');
      if (savedPointsLedger) this.pointsLedger = JSON.parse(savedPointsLedger);

      const savedUser = localStorage.getItem('fj_current_user');
      if (savedUser) this.currentUser = JSON.parse(savedUser);
    } catch {
      // Ignore parsing errors
    }
  }

  saveToLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('fj_products', JSON.stringify(this.products));
      localStorage.setItem('fj_categories', JSON.stringify(this.categories));
      localStorage.setItem('fj_homepage', JSON.stringify(this.homepageContent));
      localStorage.setItem('fj_payment_methods', JSON.stringify(this.paymentMethods));
      localStorage.setItem('fj_orders', JSON.stringify(this.orders));
      localStorage.setItem('fj_cart', JSON.stringify(this.cartItems));
      localStorage.setItem('fj_addresses', JSON.stringify(this.addresses));
      localStorage.setItem('fj_coupons', JSON.stringify(this.coupons));
      localStorage.setItem('fj_offers', JSON.stringify(this.offers));
      localStorage.setItem('fj_spend_tiers', JSON.stringify(this.spendTiers));
      localStorage.setItem('fj_points_settings', JSON.stringify(this.pointsSettings));
      localStorage.setItem('fj_points_ledger', JSON.stringify(this.pointsLedger));
      if (this.currentUser) {
        localStorage.setItem('fj_current_user', JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem('fj_current_user');
      }
    } catch {
      // Ignore
    }
  }
}

export const mockDB = new MockDBStore();
