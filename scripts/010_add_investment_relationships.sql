-- Add foreign key relationships
ALTER TABLE user_investments
ADD CONSTRAINT fk_investment_product
FOREIGN KEY (product_id) REFERENCES investment_products(id);

-- Refresh the schema cache
SELECT schema_cache_clear();