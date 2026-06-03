-- Active: 2026-05-27
-- PostgreSQL Database Schema for Event CS 2026

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS & AUTHENTICATION
-- ==========================================

CREATE TYPE user_role AS ENUM ('admin', 'spectator');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'spectator',
    two_factor_secret VARCHAR(128),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. PRODUCTS & TICKETS
-- ==========================================

CREATE TABLE ticket_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_chf DECIMAL(10, 2) NOT NULL,
    total_quantity INT NOT NULL,
    available_quantity INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    total_amount_chf DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    payment_method VARCHAR(50), -- 'twint', 'credit_card', 'stripe'
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    ticket_category_id INT REFERENCES ticket_categories(id),
    quantity INT NOT NULL,
    unit_price_chf DECIMAL(10, 2) NOT NULL
);

CREATE TABLE issued_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    ticket_code VARCHAR(100) UNIQUE NOT NULL, -- QR Code content
    holder_name VARCHAR(255) NOT NULL,
    is_scanned BOOLEAN DEFAULT FALSE,
    scanned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. TEAMS & TOURNAMENT
-- ==========================================

CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    logo_url VARCHAR(255),
    captain_name VARCHAR(100),
    rank_world INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    team_a_id INT REFERENCES teams(id) ON DELETE CASCADE,
    team_b_id INT REFERENCES teams(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'live', 'completed'
    score_a INT DEFAULT 0,
    score_b INT DEFAULT 0,
    winner_team_id INT REFERENCES teams(id),
    twitch_stream_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE round_logs (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    winning_team_id INT REFERENCES teams(id),
    win_condition VARCHAR(100), -- 'elimination', 'bomb_defused', 'bomb_exploded', 'time_expired'
    log_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Seed Ticket Categories
INSERT INTO ticket_categories (name, description, price_chf, total_quantity, available_quantity) VALUES
('Pass Samedi', 'Accès complet pour la journée du samedi 23 mai 2026. Place assise libre, accès aux stands partenaires et animations.', 35.00, 450, 450),
('Pass Dimanche', 'Accès complet pour la journée finale du dimanche 24 mai 2026. Cérémonie finale, finale du tournoi et remises de prix.', 40.00, 450, 450),
('Pass Weekend Gold', 'Accès 2 jours (23-24 mai). Badge physique collector, poster officiel de l’événement et 1 boisson offerte par jour.', 65.00, 200, 200),
('Pass VIP Premium', 'Accès VIP 2 jours. Place VIP en tribune centrale, accès exclusif à la zone Pro/Joueurs, buffet dinatoire, boisson à volonté et t-shirt officiel.', 150.00, 50, 50);

-- Seed Teams
INSERT INTO teams (name, logo_url, captain_name, rank_world) VALUES
('Team BDS', '/assets/teams/bds.png', 'Maka', 12),
('Team Vitality', '/assets/teams/vitality.png', 'apEX', 3),
('G2 Esports', '/assets/teams/g2.png', 'Snax', 4),
('NaVi (Natus Vincere)', '/assets/teams/navi.png', 'Aleksib', 2);

-- Seed Matches
INSERT INTO matches (team_a_id, team_b_id, scheduled_time, status, score_a, score_b, twitch_stream_url) VALUES
(2, 3, '2026-05-23 10:00:00+02', 'completed', 2, 1, 'https://twitch.tv/esl_csgo'), -- Semi-final 1
(4, 1, '2026-05-23 14:00:00+02', 'completed', 2, 0, 'https://twitch.tv/esl_csgo'), -- Semi-final 2
(3, 1, '2026-05-24 10:00:00+02', 'scheduled', 0, 0, 'https://twitch.tv/esl_csgo'), -- 3rd Place Match
(2, 4, '2026-05-24 15:00:00+02', 'scheduled', 0, 0, 'https://twitch.tv/esl_csgo'); -- Grand Final
