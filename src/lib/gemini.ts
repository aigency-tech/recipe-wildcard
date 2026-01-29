import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from './constants';
import type { GenerateRecipeInput, CreateRecipeInput, WildcardSuggestion, WildcardIngredient } from '../types';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function generateRecipe(input: GenerateRecipeInput): Promise<CreateRecipeInput> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');
  }

  const prompt = buildRecipePrompt(input);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return parseRecipeResponse(text, input.include_wildcard ?? false);
  } catch (error: any) {
    if (error?.message?.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Gemini API key. Please check your EXPO_PUBLIC_GEMINI_API_KEY in the .env file.');
    }
    if (error?.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('Gemini API quota exceeded. Please try again later or check your API billing.');
    }
    if (error?.message?.includes('PERMISSION_DENIED')) {
      throw new Error('Gemini API access denied. Please ensure the API is enabled for your project.');
    }
    throw new Error(`Gemini API error: ${error?.message || 'Unknown error'}`);
  }
}

export async function suggestWildcardIngredient(
  existingIngredients: string[],
  cuisine?: string
): Promise<WildcardSuggestion> {
  const prompt = buildWildcardPrompt(existingIngredients, cuisine);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  return parseWildcardResponse(text);
}

export async function parseRecipeFromText(recipeText: string): Promise<CreateRecipeInput> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');
  }

  const prompt = `
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

Only respond with valid JSON, no other text.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return parseRecipeResponse(text, false);
  } catch (error: any) {
    if (error?.message?.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Gemini API key. Please check your EXPO_PUBLIC_GEMINI_API_KEY in the .env file.');
    }
    if (error?.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('Gemini API quota exceeded. Please try again later or check your API billing.');
    }
    throw new Error(`Failed to parse recipe: ${error?.message || 'Unknown error'}`);
  }
}

export async function addWildcardToRecipe(recipe: CreateRecipeInput): Promise<CreateRecipeInput> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');
  }

  const ingredientNames = recipe.ingredients.map(i => i.name);

  const prompt = `
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

Only respond with valid JSON, no other text.
`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);

    // Add wildcard ingredients to existing ingredients
    const wildcardIngredients = (data.wildcard_ingredients || []).map((ing: any, index: number) => ({
      name: ing.name,
      quantity: String(ing.quantity),
      unit: ing.unit || '',
      is_wildcard: true,
      wildcard_reason: ing.reason,
      order_index: recipe.ingredients.length + index,
    }));

    // Update instructions if provided
    const updatedInstructions = data.updated_instructions?.length
      ? data.updated_instructions.map((inst: any) => ({
          step_number: inst.step_number,
          content: inst.content,
        }))
      : recipe.instructions;

    return {
      ...recipe,
      description: data.description || recipe.description,
      source: 'wildcard_modified',
      ingredients: [...recipe.ingredients, ...wildcardIngredients],
      instructions: updatedInstructions,
    };
  } catch (error) {
    console.error('Failed to parse wildcard addition response:', error);
    throw new Error('Failed to add wildcard ingredients');
  }
}

export async function explainWildcardPairing(
  wildcardIngredient: string,
  recipeIngredients: string[],
  recipeTitle: string
): Promise<string> {
  const prompt = `
You are a culinary expert. Explain why "${wildcardIngredient}" works as a unique addition to a recipe called "${recipeTitle}" that contains these ingredients: ${recipeIngredients.join(', ')}.

Keep your explanation concise (2-3 sentences) and focus on:
1. The flavor science behind why it works
2. How it enhances the dish

Response format: Just the explanation text, no formatting.
`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

function buildRecipePrompt(input: GenerateRecipeInput): string {
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

Only respond with valid JSON, no other text.
`;

  return prompt;
}

function buildWildcardPrompt(existingIngredients: string[], cuisine?: string): string {
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

function parseRecipeResponse(text: string, includeWildcard: boolean): CreateRecipeInput {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);

    return {
      title: data.title || 'Untitled Recipe',
      description: data.description || '',
      source: includeWildcard ? 'wildcard_modified' : 'ai_generated',
      prep_time_minutes: data.prep_time_minutes,
      cook_time_minutes: data.cook_time_minutes,
      servings: data.servings,
      cuisine: data.cuisine,
      difficulty: data.difficulty,
      is_public: true,
      ingredients: (data.ingredients || []).map((ing: any, index: number) => ({
        name: ing.name,
        quantity: String(ing.quantity),
        unit: ing.unit || '',
        is_wildcard: ing.is_wildcard || false,
        wildcard_reason: ing.wildcard_reason,
        order_index: index,
      })),
      instructions: (data.instructions || []).map((inst: any) => ({
        step_number: inst.step_number,
        content: inst.content,
      })),
    };
  } catch (error) {
    console.error('Failed to parse recipe response:', error);
    throw new Error('Failed to parse AI recipe response');
  }
}

function parseWildcardResponse(text: string): WildcardSuggestion {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);

    return {
      ingredient: {
        id: `temp-${Date.now()}`,
        name: data.ingredient.name,
        category: data.ingredient.category,
        flavor_profile: data.ingredient.flavor_profile || [],
        pairs_with: data.ingredient.pairs_with || [],
        description: data.ingredient.description || '',
        usage_tips: data.ingredient.usage_tips || '',
        intensity: data.ingredient.intensity || 'medium',
      } as WildcardIngredient,
      reason: data.reason || '',
      how_to_use: data.how_to_use || '',
      quantity_suggestion: data.quantity_suggestion || '',
    };
  } catch (error) {
    console.error('Failed to parse wildcard response:', error);
    throw new Error('Failed to parse AI wildcard response');
  }
}
