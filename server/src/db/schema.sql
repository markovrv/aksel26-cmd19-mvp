-- ПромОриентир Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'tourist' CHECK(role IN ('guest', 'tourist', 'enterprise', 'admin')),
  name TEXT,
  vk_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1
);

-- Enterprises table
CREATE TABLE IF NOT EXISTS enterprises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  name TEXT NOT NULL,
  region TEXT,
  address TEXT,
  production_type TEXT,
  description TEXT,
  logo_url TEXT,
  vk_photos_url TEXT,
  vk_video_url TEXT,
  site_url TEXT,
  vk_group_url TEXT,
  has_360 BOOLEAN DEFAULT 0,
  has_ar BOOLEAN DEFAULT 0,
  panorama_url TEXT DEFAULT '',
  coords TEXT DEFAULT '',
  certifications TEXT DEFAULT '[]',
  live_stats TEXT DEFAULT '{}',
  souvenirs TEXT DEFAULT '[]',
  professions TEXT DEFAULT '[]',
  tags TEXT DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'pending', 'published', 'blocked')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tours table
CREATE TABLE IF NOT EXISTS tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enterprise_id INTEGER REFERENCES enterprises(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT CHECK(duration IN ('1h', '2h', 'half_day', 'full_day')),
  cost INTEGER DEFAULT 0,
  max_group_size INTEGER DEFAULT 20,
  min_age TEXT DEFAULT '6plus' CHECK(min_age IN ('6plus', '12plus', '18plus')),
  production_type TEXT,
  edu_program TEXT,
  accessibility TEXT DEFAULT '[]',
  route_image_url TEXT,
  safety_instructions TEXT,
  group_requirements TEXT,
  interactivity_level INTEGER DEFAULT 5 CHECK(interactivity_level BETWEEN 1 AND 10),
  physical_load INTEGER DEFAULT 5 CHECK(physical_load BETWEEN 1 AND 10),
  ppe_required BOOLEAN DEFAULT 0,
  food_on_site BOOLEAN DEFAULT 0,
  has_souvenirs BOOLEAN DEFAULT 0,
  has_degustation BOOLEAN DEFAULT 0,
  has_photo_spots BOOLEAN DEFAULT 0,
  tags TEXT DEFAULT '[]',
  contact_email TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'pending', 'published', 'archived')),
  views_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  group_size INTEGER NOT NULL,
  desired_date DATE,
  special_needs TEXT,
  accessibility_needs TEXT DEFAULT '[]',
  tb_accepted BOOLEAN DEFAULT 0,
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'reviewing', 'confirmed', 'rejected', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'refunded')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Places table (accommodation, dining, entertainment)
CREATE TABLE IF NOT EXISTS places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('hotel', 'restaurant', 'museum', 'theatre', 'park', 'mall')),
  address TEXT,
  site_url TEXT,
  vk_url TEXT,
  region TEXT,
  is_active BOOLEAN DEFAULT 1
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT CHECK(event_type IN ('tour_view', 'filter_use', 'booking', 'page_view')),
  entity_id INTEGER,
  filter_key TEXT,
  filter_value TEXT,
  user_id INTEGER REFERENCES users(id),
  session_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Regions table (info for map panels)
CREATE TABLE IF NOT EXISTS regions (
  name TEXT PRIMARY KEY,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  coords TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Settings table (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enterprises_region ON enterprises(region);
CREATE INDEX IF NOT EXISTS idx_enterprises_status ON enterprises(status);
CREATE INDEX IF NOT EXISTS idx_enterprises_production_type ON enterprises(production_type);

CREATE INDEX IF NOT EXISTS idx_tours_enterprise ON tours(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_duration ON tours(duration);
CREATE INDEX IF NOT EXISTS idx_tours_cost ON tours(cost);
CREATE INDEX IF NOT EXISTS idx_tours_production_type ON tours(production_type);
CREATE INDEX IF NOT EXISTS idx_tours_interactivity ON tours(interactivity_level);

CREATE INDEX IF NOT EXISTS idx_bookings_tour ON bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE INDEX IF NOT EXISTS idx_places_region ON places(region);
CREATE INDEX IF NOT EXISTS idx_places_type ON places(type);