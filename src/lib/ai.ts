import { Platform } from 'react-native';
import { API_URL } from './constants';
import type { GenerateRecipeInput, CreateRecipeInput, WildcardSuggestion, WildcardIngredient } from '../types';

// All Claude calls go through our /api/ai serverless function so the Anthropic API key stays server-side.
// Web: same-origin relative URL. Native: EXPO_PUBLIC_API_URL (e.g. https://recipe-wildcard.vercel.app).
async function callAI(task: string, input: unknown): Promise<string> {
  const base = API_URL;
  if (Platform.OS !== 'web' && !base) {
    throw new Error('AI service URL is not configured. Please add EXPO_PUBLIC_API_URL to your .env file.');
  }

  let response: Response;
  try {
    response = await fetch(`${base}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, input }),
    });
  } catch {
    throw new Error('Unable to reach the AI service. Please check your connection and try again.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `AI service error (${response.status})`);
  }
  return data.text as string;
}

export async function generateRecipe(input: GenerateRecipeInput): Promise<CreateRecipeInput> {
  const text = await callAI('generateRecipe', input);
  return parseRecipeResponse(text, input.include_wildcard ?? false);
}

export async function suggestWildcardIngredient(
  existingIngredients: string[],
  cuisine?: string
): Promise<WildcardSuggestion> {
  const text = await callAI('suggestWildcard', { ingredients: existingIngredients, cuisine });
  return parseWildcardResponse(text);
}

export async function parseRecipeFromUrl(url: string): Promise<CreateRecipeInput> {
  // The server fetches the page (avoids browser CORS limits) and extracts the recipe.
  const text = await callAI('parseUrl', { url });

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract recipe from URL: No JSON found in response');
  }
  const data = JSON.parse(jsonMatch[0]);
  if (data.error) {
    throw new Error(data.error);
  }

  const recipe = parseRecipeResponse(jsonMatch[0], false);
  return {
    ...recipe,
    source: 'imported' as CreateRecipeInput['source'],
    ingredients: recipe.ingredients.map((ing) => ({ ...ing, is_wildcard: false, wildcard_reason: undefined })),
  };
}

export async function parseRecipeFromText(recipeText: string): Promise<CreateRecipeInput> {
  const text = await callAI('parseText', { text: recipeText });
  return parseRecipeResponse(text, false);
}

export async function addWildcardToRecipe(recipe: CreateRecipeInput): Promise<CreateRecipeInput> {
  const text = await callAI('addWildcard', {
    title: recipe.title,
    description: recipe.description,
    cuisine: recipe.cuisine,
    ingredients: recipe.ingredients.map((i) => ({ name: i.name })),
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);

    // Add wildcard ingredients to existing ingredients
    const wildcardIngredients = (data.wildcard_ingredients || []).map((ing: any, index: number) => ({
      name: ing.name,
      quantity: String(ing.quantity || '1'),
      unit: ing.unit || getDefaultUnit(ing.name),
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
  const text = await callAI('explainPairing', {
    wildcard: wildcardIngredient,
    ingredients: recipeIngredients,
    title: recipeTitle,
  });
  return text.trim();
}

function parseRecipeResponse(text: string, includeWildcard: boolean): CreateRecipeInput {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);

    const title = data.title || 'Untitled Recipe';
    const cuisine = data.cuisine;

    return {
      title,
      description: data.description || '',
      image_url: getRecipeImageUrl(title, cuisine),
      source: includeWildcard ? 'wildcard_modified' : 'ai_generated',
      prep_time_minutes: data.prep_time_minutes,
      cook_time_minutes: data.cook_time_minutes,
      servings: data.servings,
      cuisine,
      difficulty: data.difficulty,
      is_public: true,
      ingredients: (data.ingredients || []).map((ing: any, index: number) => ({
        name: ing.name,
        quantity: String(ing.quantity || '1'),
        unit: ing.unit || getDefaultUnit(ing.name),
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

// Returns an appropriate stock image URL based on recipe title and cuisine
function getRecipeImageUrl(title: string, cuisine?: string): string {
  const titleLower = title.toLowerCase();
  const cuisineLower = (cuisine || '').toLowerCase();

  // Map of food keywords to Unsplash image URLs
  const imageMap: { keywords: string[]; url: string }[] = [
    { keywords: ['chili', 'beef stew'], url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop' },
    { keywords: ['pasta', 'spaghetti', 'linguine', 'fettuccine', 'penne'], url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop' },
    { keywords: ['chicken', 'poultry'], url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&h=600&fit=crop' },
    { keywords: ['steak', 'beef', 'ribeye', 'sirloin'], url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop' },
    { keywords: ['salmon', 'fish', 'seafood', 'shrimp', 'tuna'], url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop' },
    { keywords: ['salad', 'greens', 'lettuce'], url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop' },
    { keywords: ['soup', 'broth', 'stew'], url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop' },
    { keywords: ['pizza'], url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop' },
    { keywords: ['burger', 'hamburger'], url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop' },
    { keywords: ['taco', 'mexican', 'burrito', 'enchilada'], url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop' },
    { keywords: ['sushi', 'japanese', 'ramen'], url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop' },
    { keywords: ['curry', 'indian', 'thai'], url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop' },
    { keywords: ['breakfast', 'eggs', 'omelet', 'omelette', 'pancake', 'waffle'], url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=600&fit=crop' },
    { keywords: ['french toast', 'toast'], url: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=600&fit=crop' },
    { keywords: ['sandwich', 'sub', 'wrap'], url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&h=600&fit=crop' },
    { keywords: ['rice', 'fried rice', 'risotto'], url: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&h=600&fit=crop' },
    { keywords: ['potato', 'fries', 'mashed', 'scalloped'], url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop' },
    { keywords: ['cake', 'dessert', 'chocolate', 'brownie'], url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop' },
    { keywords: ['cookie', 'biscuit'], url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop' },
    { keywords: ['pie', 'tart'], url: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=800&h=600&fit=crop' },
    { keywords: ['smoothie', 'shake', 'drink'], url: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=800&h=600&fit=crop' },
    { keywords: ['bbq', 'barbecue', 'grill'], url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=600&fit=crop' },
    { keywords: ['pork', 'bacon', 'ham'], url: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&h=600&fit=crop' },
    { keywords: ['sauce', 'dip', 'dressing'], url: 'https://images.unsplash.com/photo-1534938665420-4193effeacc4?w=800&h=600&fit=crop' },
    { keywords: ['bread', 'baguette', 'roll'], url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop' },
    { keywords: ['chinese', 'stir fry', 'wok'], url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop' },
    { keywords: ['italian'], url: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800&h=600&fit=crop' },
    { keywords: ['mediterranean', 'greek'], url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop' },
  ];

  // Check title first, then cuisine
  for (const { keywords, url } of imageMap) {
    for (const keyword of keywords) {
      if (titleLower.includes(keyword) || cuisineLower.includes(keyword)) {
        return url;
      }
    }
  }

  // Default food image
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop';
}

// Returns a sensible default unit based on the ingredient name
function getDefaultUnit(ingredientName: string): string {
  const name = ingredientName.toLowerCase();

  // Seasonings that are typically "to taste"
  if (name.includes('salt') || name.includes('pepper') || name === 'seasoning') {
    return 'to taste';
  }

  // Items typically measured in cloves
  if (name.includes('garlic')) {
    return 'clove';
  }

  // Items typically measured in sprigs or bunches
  if (name.includes('thyme') || name.includes('rosemary') || name.includes('parsley') ||
      name.includes('cilantro') || name.includes('basil') || name.includes('mint') ||
      name.includes('dill') || name.includes('oregano')) {
    return 'sprig';
  }

  // Default to "ea" (each) for countable items
  return 'ea';
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
