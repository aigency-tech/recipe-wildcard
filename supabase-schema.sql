-- Recipe Wildcard - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  source TEXT NOT NULL CHECK (source IN ('user_uploaded', 'ai_generated', 'wildcard_modified', 'template')),
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER,
  cuisine TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_public BOOLEAN DEFAULT TRUE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredients table
CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity TEXT NOT NULL DEFAULT '',
  unit TEXT NOT NULL DEFAULT '',
  is_wildcard BOOLEAN DEFAULT FALSE,
  wildcard_reason TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instructions table
CREATE TABLE IF NOT EXISTS public.instructions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved recipes table
CREATE TABLE IF NOT EXISTS public.saved_recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Wildcard catalog table
CREATE TABLE IF NOT EXISTS public.wildcard_catalog (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  flavor_profile TEXT[] NOT NULL DEFAULT '{}',
  pairs_with TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  usage_tips TEXT NOT NULL,
  intensity TEXT NOT NULL CHECK (intensity IN ('subtle', 'medium', 'bold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_is_public ON public.recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON public.recipes(cuisine);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON public.recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON public.ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_instructions_recipe_id ON public.instructions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON public.saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_recipe_id ON public.saved_recipes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wildcard_catalog ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Recipes policies
CREATE POLICY "Public recipes are viewable by everyone" ON public.recipes
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own recipes" ON public.recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert recipes" ON public.recipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own recipes" ON public.recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON public.recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Ingredients policies
CREATE POLICY "Ingredients are viewable if recipe is viewable" ON public.ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = ingredients.recipe_id
      AND (recipes.is_public = true OR recipes.user_id = auth.uid())
    )
  );

CREATE POLICY "Anyone can insert ingredients" ON public.ingredients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update ingredients of their recipes" ON public.ingredients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ingredients of their recipes" ON public.ingredients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Instructions policies
CREATE POLICY "Instructions are viewable if recipe is viewable" ON public.instructions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = instructions.recipe_id
      AND (recipes.is_public = true OR recipes.user_id = auth.uid())
    )
  );

CREATE POLICY "Anyone can insert instructions" ON public.instructions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update instructions of their recipes" ON public.instructions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = instructions.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete instructions of their recipes" ON public.instructions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = instructions.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Saved recipes policies
CREATE POLICY "Users can view their own saved recipes" ON public.saved_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save recipes" ON public.saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave recipes" ON public.saved_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Wildcard catalog policies
CREATE POLICY "Wildcard catalog is viewable by everyone" ON public.wildcard_catalog
  FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA: Wildcard Catalog
-- ============================================

INSERT INTO public.wildcard_catalog (name, category, flavor_profile, pairs_with, description, usage_tips, intensity) VALUES
('Fish Sauce', 'Umami Boosters', ARRAY['umami', 'salty', 'funky'], ARRAY['beef', 'tomatoes', 'caramel', 'citrus'], 'Southeast Asian fermented fish condiment that adds deep umami without tasting fishy', 'Start with 1/2 tsp, add more to taste. Works great in non-Asian dishes like bolognese or Caesar dressing.', 'bold'),
('Miso Paste', 'Umami Boosters', ARRAY['umami', 'sweet', 'salty'], ARRAY['butter', 'chocolate', 'caramel', 'mushrooms'], 'Fermented soybean paste that adds depth and complexity to both savory and sweet dishes', 'White miso is milder, red miso is stronger. Try it in caramel or chocolate desserts.', 'medium'),
('Espresso Powder', 'Aromatic Additions', ARRAY['bitter', 'roasted', 'complex'], ARRAY['chocolate', 'beef', 'chili', 'vanilla'], 'Concentrated coffee flavor that enhances chocolate and adds depth to savory dishes', '1/4 tsp in chili or beef stew adds complexity without coffee flavor. Perfect in brownies.', 'medium'),
('Tahini', 'Textural Elements', ARRAY['nutty', 'bitter', 'creamy'], ARRAY['honey', 'chocolate', 'citrus', 'greens'], 'Sesame seed paste that adds creamy nuttiness to both savory and sweet applications', 'Drizzle on salads, blend into smoothies, or swirl into brownies before baking.', 'medium'),
('Apple Cider Vinegar', 'Acidic Notes', ARRAY['tart', 'fruity', 'bright'], ARRAY['pork', 'beans', 'greens', 'berries'], 'Fruity vinegar that brightens flavors and cuts through richness', 'Add a splash at the end of cooking to brighten stews, soups, and braises.', 'subtle'),
('Gochujang', 'Heat & Spice', ARRAY['spicy', 'sweet', 'umami'], ARRAY['mayo', 'honey', 'beef', 'eggs'], 'Korean fermented chili paste with sweet heat and deep umami notes', 'Mix with mayo for spicy aioli, glaze on roasted vegetables, or stir into mac and cheese.', 'bold'),
('Anchovy Paste', 'Umami Boosters', ARRAY['umami', 'briny', 'savory'], ARRAY['tomatoes', 'garlic', 'olive oil', 'pasta'], 'Concentrated anchovy flavor that melts into dishes adding deep savory notes', 'Start with 1/2 tsp. It disappears into sauces but adds incredible depth. Essential for proper Caesar dressing.', 'bold'),
('Nutritional Yeast', 'Umami Boosters', ARRAY['cheesy', 'nutty', 'umami'], ARRAY['popcorn', 'pasta', 'vegetables', 'tofu'], 'Deactivated yeast with a cheesy, nutty flavor perfect for vegan dishes', 'Sprinkle on popcorn, blend into sauces, or use as a parmesan substitute.', 'medium'),
('Dried Porcini Powder', 'Aromatic Additions', ARRAY['earthy', 'umami', 'woody'], ARRAY['beef', 'risotto', 'gravy', 'mushrooms'], 'Ground dried porcini mushrooms that add intense earthy umami', 'Add to beef dishes, gravies, or sprinkle on roasted vegetables. A little goes a long way.', 'bold'),
('Sumac', 'Acidic Notes', ARRAY['tangy', 'fruity', 'citrusy'], ARRAY['chicken', 'rice', 'yogurt', 'salads'], 'Middle Eastern spice with a bright, lemony tartness', 'Sprinkle on hummus, grilled meats, or use in place of lemon zest for a different dimension.', 'subtle'),
('Tamarind Paste', 'Acidic Notes', ARRAY['sour', 'sweet', 'fruity'], ARRAY['pork', 'stir-fry', 'curry', 'bbq'], 'Tropical fruit paste with complex sweet-sour flavor', 'Use in pad thai, curries, or add to BBQ sauce for tangy depth.', 'medium'),
('Pomegranate Molasses', 'Sweet Enhancers', ARRAY['tart', 'sweet', 'fruity'], ARRAY['lamb', 'eggplant', 'salads', 'desserts'], 'Reduced pomegranate juice with intense sweet-tart flavor', 'Drizzle on roasted vegetables, use in marinades, or add to dressings.', 'bold')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STORAGE BUCKET
-- ============================================

-- Create storage bucket for recipe images (run this in Supabase Storage settings or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('recipe-images', 'recipe-images', true);
