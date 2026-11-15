// Prompt builders shared by the app and the /api/ai serverless function.
// Keep this file free of React Native imports so it can run on the server.
import type { GenerateRecipeInput, CreateRecipeInput } from '../types';

export function buildUrlExtractionPrompt(htmlContent: string): string {
  // Try to extract JSON-LD structured data first (most recipe sites have this)
  let structuredData = '';
  const jsonLdMatches = htmlContent.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches) {
    for (const match of jsonLdMatches) {
      const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '');
      if (jsonContent.includes('Recipe') || jsonContent.includes('recipe')) {
        structuredData += jsonContent + '\n';
      }
    }
  }

  // Also try to find recipe-specific content areas
  let recipeContent = '';

  // Extract meta description
  const metaDesc = htmlContent.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
  if (metaDesc) {
    recipeContent += `Meta Description: ${metaDesc[1]}\n\n`;
  }

  // Extract title
  const titleMatch = htmlContent.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) {
    recipeContent += `Page Title: ${titleMatch[1]}\n\n`;
  }

  // Try to get the main content (strip scripts, styles, nav, footer, ads)
  let cleanedHtml = htmlContent
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return `
You are a recipe extraction expert. Extract the recipe from this webpage content.

${structuredData ? `STRUCTURED DATA (JSON-LD) - This is the most reliable source:\n"""\n${structuredData.substring(0, 15000)}\n"""\n\n` : ''}

PAGE CONTENT:
"""
${recipeContent}${cleanedHtml.substring(0, 20000)}
"""

Extract the recipe information. The structured data (if present) is the most reliable source.
Look for:
- Recipe title
- Description or introduction
- Ingredients list (with quantities and units)
- Step-by-step instructions
- Prep time, cook time, servings if available
- Cuisine type if identifiable

Respond in this exact JSON format:
{
  "title": "Recipe Title",
  "description": "Brief appealing description of the dish",
  "prep_time_minutes": 15,
  "cook_time_minutes": 30,
  "servings": 4,
  "cuisine": "Italian or Other appropriate cuisine",
  "difficulty": "easy|medium|hard",
  "ingredients": [
    {"name": "ingredient name", "quantity": "1", "unit": "cup", "is_wildcard": false}
  ],
  "instructions": [
    {"step_number": 1, "content": "Step description"}
  ]
}

IMPORTANT:
- Most recipe pages WILL have recipe content. Look carefully for ingredient lists and cooking steps even if the format is unusual.
- Every ingredient MUST have a unit. Common units: tsp, tbsp, cup, oz, lb, g, ea (each), clove, slice, piece, sprig, bunch, pinch, dash, to taste. Never leave unit empty.

If you truly cannot find ANY recipe content, respond with:
{"error": "No recipe found on this page"}

Only respond with valid JSON, no other text.
`;
}

export function buildParseTextPrompt(recipeText: string): string {
  return `
You are a recipe parser. Parse the following recipe text and extract all the information into a structured format.

Recipe text:
"""
${recipeText}
"""

Extract and organize the recipe information. If some information is missing, make reasonable estimates based on the recipe content.

Respond in this exact JSON format:
{
  "title": "Recipe Title",
  "description": "Brief appealing description of the dish",
  "prep_time_minutes": 15,
  "cook_time_minutes": 30,
  "servings": 4,
  "cuisine": "Italian or Other appropriate cuisine",
  "difficulty": "easy|medium|hard",
  "ingredients": [
    {"name": "ingredient name", "quantity": "1", "unit": "cup", "is_wildcard": false}
  ],
  "instructions": [
    {"step_number": 1, "content": "Step description"}
  ]
}

IMPORTANT: Every ingredient MUST have a unit. Common units: tsp, tbsp, cup, oz, lb, g, ea (each), clove, slice, piece, sprig, bunch, pinch, dash, to taste. Never leave unit empty.

Only respond with valid JSON, no other text.
`;
}

export function buildAddWildcardPrompt(recipe: Pick<CreateRecipeInput, 'title' | 'description' | 'cuisine' | 'ingredients'>): string {
  const ingredientNames = recipe.ingredients.map(i => i.name);

  return `
You are a culinary innovation expert. Given this existing recipe, suggest 1-2 "wildcard" ingredients that would elevate and make it unique.

Recipe: ${recipe.title}
Description: ${recipe.description}
Current ingredients: ${ingredientNames.join(', ')}
Cuisine: ${recipe.cuisine || 'Not specified'}

Suggest wildcard ingredients that are:
- Unexpected but scientifically proven to work (shared flavor compounds, complementary tastes)
- Not already in the recipe
- Something that adds a unique dimension (umami, brightness, depth, etc.)

Also provide updated instructions that incorporate the wildcard ingredients.

Respond in this exact JSON format:
{
  "wildcard_ingredients": [
    {"name": "Ingredient Name", "quantity": "1", "unit": "tsp", "reason": "Why this works with the dish"}
  ],
  "updated_instructions": [
    {"step_number": 1, "content": "Updated step that may include wildcard usage"}
  ],
  "description": "Updated description mentioning the unique twist"
}

IMPORTANT: Every ingredient MUST have a unit. Common units: tsp, tbsp, cup, oz, lb, g, ea (each), clove, slice, piece, sprig, bunch, pinch, dash, to taste. Never leave unit empty.

Only respond with valid JSON, no other text.
`;
}

export function buildExplainPairingPrompt(
  wildcardIngredient: string,
  recipeIngredients: string[],
  recipeTitle: string
): string {
  return `
You are a culinary expert. Explain why "${wildcardIngredient}" works as a unique addition to a recipe called "${recipeTitle}" that contains these ingredients: ${recipeIngredients.join(', ')}.

Keep your explanation concise (2-3 sentences) and focus on:
1. The flavor science behind why it works
2. How it enhances the dish

Response format: Just the explanation text, no formatting.
`;
}

export function buildRecipePrompt(input: GenerateRecipeInput): string {
  let prompt = `
You are a creative chef. Generate a complete recipe based on this request: "${input.prompt}"

${input.cuisine ? `Cuisine style: ${input.cuisine}` : ''}
${input.dietary_restrictions?.length ? `Dietary restrictions: ${input.dietary_restrictions.join(', ')}` : ''}
${input.difficulty ? `Difficulty level: ${input.difficulty}` : ''}
`;

  if (input.include_wildcard) {
    prompt += `
IMPORTANT: Include one "wildcard" ingredient - an uncommon but delicious addition that adds a unique flavor dimension. This could be something like fish sauce in non-Asian dishes, espresso in savory sauces, miso in unexpected places, or other surprising but scientifically sound flavor combinations.

Mark the wildcard ingredient clearly and explain why it works.
`;
  }

  prompt += `
Respond in this exact JSON format:
{
  "title": "Recipe Title",
  "description": "Brief appealing description of the dish",
  "prep_time_minutes": 15,
  "cook_time_minutes": 30,
  "servings": 4,
  "cuisine": "Italian",
  "difficulty": "easy|medium|hard",
  "ingredients": [
    {"name": "ingredient name", "quantity": "1", "unit": "cup", "is_wildcard": false},
    {"name": "wildcard ingredient", "quantity": "1", "unit": "tbsp", "is_wildcard": true, "wildcard_reason": "Why this unusual ingredient works"}
  ],
  "instructions": [
    {"step_number": 1, "content": "Step description"},
    {"step_number": 2, "content": "Step description"}
  ]
}

IMPORTANT: Every ingredient MUST have a unit. Common units include:
- Volume: tsp, tbsp, cup, fl oz, ml, L
- Weight: oz, lb, g, kg
- Count: ea (each), clove, slice, piece, sprig, bunch, pinch, dash
- Other: to taste

Never leave the unit field empty. Use "ea" for whole items like eggs, "clove" for garlic, "to taste" for seasonings like salt and pepper.

Only respond with valid JSON, no other text.
`;

  return prompt;
}

export function buildWildcardPrompt(existingIngredients: string[], cuisine?: string): string {
  return `
You are a culinary innovation expert specializing in unexpected flavor combinations that are backed by food science.

Given these recipe ingredients: ${existingIngredients.join(', ')}
${cuisine ? `Cuisine style: ${cuisine}` : ''}

Suggest ONE surprising "wildcard" ingredient that would elevate this dish. This should be:
- Unexpected but scientifically proven to work (shared flavor compounds, complementary tastes)
- Not a common ingredient for this type of dish
- Something that adds a unique dimension (umami, brightness, depth, etc.)

Examples of great wildcard ingredients: fish sauce, miso paste, coffee/espresso, soy sauce, anchovy paste, nutritional yeast, tahini, marmite, dried mushroom powder, citrus zest, apple cider vinegar, etc.

Respond in this exact JSON format:
{
  "ingredient": {
    "name": "Ingredient Name",
    "category": "Umami Boosters|Acidic Notes|Sweet Enhancers|Aromatic Additions|Textural Elements|Heat & Spice",
    "flavor_profile": ["umami", "salty"],
    "pairs_with": ["ingredient1", "ingredient2"],
    "description": "Brief description of this ingredient",
    "usage_tips": "General tips for using this ingredient",
    "intensity": "subtle|medium|bold"
  },
  "reason": "Why this specific ingredient works with the given recipe ingredients",
  "how_to_use": "Specific instructions for incorporating it into this dish",
  "quantity_suggestion": "Start with 1 tsp and adjust to taste"
}

Only respond with valid JSON, no other text.
`;
}
