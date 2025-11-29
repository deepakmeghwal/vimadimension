-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    plan_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL,
    monthly_price DECIMAL(10, 2) NOT NULL,
    annual_price DECIMAL(10, 2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'INR',
    max_users INT, -- NULL means unlimited
    max_projects INT, -- NULL means unlimited
    storage_gb INT,
    has_financial_access BOOLEAN DEFAULT FALSE,
    has_team_access BOOLEAN DEFAULT FALSE,
    description VARCHAR(255),
    features_json JSON, -- To store list of features for display if needed, though frontend has them hardcoded for now
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial plans
-- Tier 1: Solo
-- Price: ₹99 / user / mo. Annual: ₹999 (approx 15% off).
INSERT INTO subscription_plans (plan_name, monthly_price, annual_price, max_users, max_projects, storage_gb, has_financial_access, has_team_access, description)
VALUES ('Solo', 99.00, 999.00, 1, 3, 2, FALSE, FALSE, 'Perfect for freelancers just starting out.');

-- Tier 2: Studio
-- Monthly: 499, Annual: 399 * 12 = 4788
INSERT INTO subscription_plans (plan_name, monthly_price, annual_price, max_users, max_projects, storage_gb, has_financial_access, has_team_access, description)
VALUES ('Studio', 499.00, 4788.00, NULL, NULL, 50, TRUE, TRUE, 'For growing teams needing financial insights.');

-- Tier 3: Firm
-- Volume Discount: ₹399 / user / mo for larger teams.
-- Annual: 399 * 12 = 4788.
INSERT INTO subscription_plans (plan_name, monthly_price, annual_price, max_users, max_projects, storage_gb, has_financial_access, has_team_access, description)
VALUES ('Firm', 399.00, 4788.00, NULL, NULL, 500, TRUE, TRUE, 'Volume pricing for established teams (20+ users).');
