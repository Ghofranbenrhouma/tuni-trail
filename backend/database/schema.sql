-- ============================================================
-- TuniTrail — Schema MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS tunitrail
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tunitrail;

-- ── 1. Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NOT NULL DEFAULT 'Aventurier',
  phone         VARCHAR(20)  DEFAULT NULL,
  bio           TEXT         DEFAULT NULL,
  avatar        VARCHAR(10)  DEFAULT NULL,
  role          ENUM('user','org','admin','pending_org') NOT NULL DEFAULT 'user',
  activities    JSON         DEFAULT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── 2. Events ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  category      VARCHAR(50)  NOT NULL,
  location      VARCHAR(100) NOT NULL,
  date          VARCHAR(50)  NOT NULL,
  duration      VARCHAR(50)  DEFAULT NULL,
  price         VARCHAR(20)  NOT NULL,
  price_num     DECIMAL(10,2) DEFAULT 0,
  difficulty    VARCHAR(20)  DEFAULT 'Facile',
  css_class     VARCHAR(20)  DEFAULT NULL,
  organizer     VARCHAR(100) DEFAULT NULL,
  organizer_id  INT          DEFAULT NULL,
  rating        DECIMAL(2,1) DEFAULT 0,
  reviews_count INT          DEFAULT 0,
  description   TEXT         DEFAULT NULL,
  includes      JSON         DEFAULT NULL,
  excludes      JSON         DEFAULT NULL,
  program       JSON         DEFAULT NULL,
  lat           DECIMAL(10,6) DEFAULT NULL,
  lng           DECIMAL(10,6) DEFAULT NULL,
  map_label     VARCHAR(255) DEFAULT NULL,
  images        JSON         DEFAULT NULL,
  max_people    INT          DEFAULT NULL,
  min_age       INT          DEFAULT NULL,
  options       JSON         DEFAULT NULL,
  status        ENUM('published','draft','suspended') DEFAULT 'published',
  is_featured   BOOLEAN      DEFAULT FALSE,
  sold          INT          DEFAULT 0,
  capacity      INT          DEFAULT 0,
  revenue       DECIMAL(10,2) DEFAULT 0,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── 3. Reservations ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  ref_code      VARCHAR(20)  NOT NULL UNIQUE,
  user_id       INT          NOT NULL,
  event_id      INT          NOT NULL,
  event_title   VARCHAR(255) DEFAULT NULL,
  event_date    VARCHAR(50)  DEFAULT NULL,
  event_loc     VARCHAR(100) DEFAULT NULL,
  event_cls     VARCHAR(20)  DEFAULT NULL,
  price         VARCHAR(20)  DEFAULT NULL,
  option_label  VARCHAR(50)  DEFAULT 'Standard',
  ticket_count  INT          DEFAULT 1,
  status        ENUM('confirmed','pending','cancelled') DEFAULT 'confirmed',
  qr_payload    TEXT         DEFAULT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 4. Orders (boutique) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  ref_code      VARCHAR(20)  NOT NULL UNIQUE,
  user_id       INT          NOT NULL,
  items         JSON         NOT NULL,
  total         DECIMAL(10,2) NOT NULL DEFAULT 0,
  status        ENUM('confirmed','pending','shipped','delivered') DEFAULT 'confirmed',
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 5. Cart Items ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT          NOT NULL,
  product_id    VARCHAR(10)  NOT NULL,
  quantity      INT          DEFAULT 1,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cart_item (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 6. Wishlist Items ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT          NOT NULL,
  product_id    VARCHAR(10)  NOT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wish_item (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 7. Products (store) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            VARCHAR(10)  PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  category      VARCHAR(50)  NOT NULL,
  price         VARCHAR(20)  NOT NULL,
  price_num     DECIMAL(10,2) DEFAULT 0,
  badge         VARCHAR(50)  DEFAULT NULL,
  badge_cls     VARCHAR(50)  DEFAULT NULL,
  icon          VARCHAR(10)  DEFAULT NULL,
  description   TEXT         DEFAULT NULL,
  rating        DECIMAL(2,1) DEFAULT 0,
  reviews_count INT          DEFAULT 0,
  in_stock      BOOLEAN      DEFAULT TRUE,
  css_class     VARCHAR(20)  DEFAULT NULL
) ENGINE=InnoDB;

-- ── 8. Reviews ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT          NOT NULL,
  event_id       INT          NOT NULL,
  user_name      VARCHAR(100) DEFAULT NULL,
  rating         INT          NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT         DEFAULT NULL,
  status         ENUM('published','pending','reported','deleted') DEFAULT 'published',
  report_reason  VARCHAR(255) DEFAULT NULL,
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 9. Org Requests ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS org_requests (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT          NOT NULL,
  first_name       VARCHAR(100) DEFAULT NULL,
  last_name        VARCHAR(100) DEFAULT NULL,
  email            VARCHAR(255) DEFAULT NULL,
  phone            VARCHAR(20)  DEFAULT NULL,
  description      TEXT         DEFAULT NULL,
  document_name    VARCHAR(255) DEFAULT NULL,
  document_data    LONGTEXT     DEFAULT NULL,
  status           ENUM('pending','approved','rejected') DEFAULT 'pending',
  rejection_reason TEXT         DEFAULT NULL,
  reviewed_at      TIMESTAMP    NULL DEFAULT NULL,
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 10. Destinations ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS destinations (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  full_name      VARCHAR(255) DEFAULT NULL,
  type           VARCHAR(50)  NOT NULL,
  altitude       VARCHAR(20)  DEFAULT NULL,
  difficulty     VARCHAR(20)  DEFAULT 'Facile',
  diff_class     VARCHAR(20)  DEFAULT NULL,
  duration       VARCHAR(20)  DEFAULT NULL,
  rating         DECIMAL(2,1) DEFAULT 0,
  reviews_count  INT          DEFAULT 0,
  lat            DECIMAL(10,6) DEFAULT NULL,
  lng            DECIMAL(10,6) DEFAULT NULL,
  image          TEXT         DEFAULT NULL,
  description    TEXT         DEFAULT NULL,
  highlights     JSON         DEFAULT NULL,
  season         VARCHAR(50)  DEFAULT NULL,
  emoji          VARCHAR(10)  DEFAULT NULL,
  gradient       VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB;

-- ── 11. Community Posts ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT          NOT NULL,
  author_name     VARCHAR(100) DEFAULT NULL,
  author_avatar   VARCHAR(10)  DEFAULT NULL,
  location        VARCHAR(100) DEFAULT NULL,
  image           TEXT         DEFAULT NULL,
  caption         TEXT         DEFAULT NULL,
  likes_count     INT          DEFAULT 0,
  comments_count  INT          DEFAULT 0,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 12. Chat Messages ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT          DEFAULT NULL,
  author_name     VARCHAR(100) NOT NULL,
  author_avatar   VARCHAR(10)  DEFAULT NULL,
  message         TEXT         NOT NULL,
  is_ai           BOOLEAN      DEFAULT FALSE,
  ai_tag          VARCHAR(50)  DEFAULT NULL,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── 13. Post Likes (pour éviter les doublons) ────────────────
CREATE TABLE IF NOT EXISTS post_likes (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id  INT NOT NULL,
  post_id  INT NOT NULL,
  UNIQUE KEY unique_like (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id)          ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB;
