DROP DATABASE IF EXISTS recipe_chain;
CREATE DATABASE recipe_chain;

\c recipe_chain;

CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients TEXT NOT NULL,
  instructions TEXT NOT NULL,
  parent_id INTEGER REFERENCES recipes(id) ON DELETE RESTRICT,
  author VARCHAR(100) DEFAULT 'Anonymous',
  changes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recipes_parent_id ON recipes(parent_id);
CREATE INDEX idx_recipes_author ON recipes(author);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON recipes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

INSERT INTO recipes (title, description, ingredients, instructions, author) VALUES
('Classic Carbonara', 'Traditional Italian pasta dish', 'Pasta, Eggs, Pancetta, Parmesan, Black Pepper', 'Cook pasta. Mix eggs with cheese. Combine with hot pasta and pancetta.', 'Chef Marco'),
('Margherita Pizza', 'Simple pizza with tomato and mozzarella', 'Pizza Dough, Tomato Sauce, Mozzarella, Basil, Olive Oil', 'Roll dough. Add sauce and cheese. Bake at 250°C for 10 minutes.', 'Chef Antonio'),
('Classic Hummus', 'Middle Eastern chickpea dip', 'Chickpeas, Tahini, Lemon Juice, Garlic, Olive Oil, Salt', 'Blend all ingredients until smooth. Adjust seasoning to taste.', 'Chef Leila');

INSERT INTO recipes (title, description, ingredients, instructions, parent_id, author, changes) VALUES
('Vegan Carbonara', 'Plant-based version with cashew cream', 'Pasta, Cashew Cream, Smoked Tofu, Nutritional Yeast, Black Pepper', 'Cook pasta. Blend cashews with water. Mix with pasta and crispy tofu.', 1, 'VeganChef', 'Replaced eggs with cashew cream, pancetta with smoked tofu'),
('Spicy Carbonara', 'Added chili for extra kick', 'Pasta, Eggs, Pancetta, Parmesan, Black Pepper, Red Chili Flakes', 'Cook pasta. Mix eggs with cheese and chili. Combine with hot pasta and pancetta.', 1, 'SpiceKing', 'Added red chili flakes for heat'),
('Pepperoni Pizza', 'Classic American style pizza', 'Pizza Dough, Tomato Sauce, Mozzarella, Pepperoni', 'Roll dough. Add sauce, cheese, and pepperoni. Bake at 250°C for 12 minutes.', 2, 'PizzaLover', 'Added pepperoni topping'),
('Spicy Hummus', 'Hummus with harissa paste', 'Chickpeas, Tahini, Lemon Juice, Garlic, Olive Oil, Salt, Harissa', 'Blend all ingredients including harissa until smooth.', 3, 'SpiceMaster', 'Added harissa for spicy flavor');

INSERT INTO recipes (title, description, ingredients, instructions, parent_id, author, changes) VALUES
('Gluten-Free Vegan Carbonara', 'Allergen-friendly version', 'Rice Pasta, Cashew Cream, Smoked Tofu, Nutritional Yeast, Black Pepper', 'Cook rice pasta. Use same vegan method with GF pasta.', 4, 'HealthyEats', 'Switched to gluten-free pasta');

SELECT 
  r.id, 
  r.title, 
  r.author, 
  p.title as parent_title,
  (SELECT COUNT(*) FROM recipes WHERE parent_id = r.id) as fork_count
FROM recipes r
LEFT JOIN recipes p ON r.parent_id = p.id
ORDER BY r.id;