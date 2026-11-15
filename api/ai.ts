// Vercel serverless function: the only place the app talks to Claude.
// The Anthropic API key lives in Vercel's server-side env (ANTHROPIC_API_KEY) and never ships to clients.
// Clients send a task name + inputs; prompts are built here so the endpoint can't be used as a general LLM proxy.
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import {
  buildRecipePrompt,
  buildWildcardPrompt,
  buildUrlExtractionPrompt,
  buildParseTextPrompt,
  buildAddWildcardPrompt,
  buildExplainPairingPrompt,
} from '../src/lib/aiPrompts';
import { fetchPage, FetchPageError } from './_lib/fetchPage';

const MODEL = 'claude-opus-5-5';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

const str = (max: number) => z.string().max(max);
const ingredient = z.object({ name: str(200) }).passthrough();

const RequestSchema = z.discriminatedUnion('task', [
  z.object({
    task: z.literal('generateRecipe'),
    input: z.object({
      prompt: str(2000),
      cuisine: str(100).optional(),
      dietary_restrictions: z.array(str(100)).max(20).optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      include_wildcard: z.boolean().optional(),
    }),
  }),
  z.object({
    task: z.literal('suggestWildcard'),
    input: z.object({ ingredients: z.array(str(200)).min(1).max(100), cuisine: str(100).optional() }),
  }),
  z.object({ task: z.literal('parseUrl'), input: z.object({ url: z.string().url().max(2000) }) }),
  z.object({ task: z.literal('parseText'), input: z.object({ text: str(50000) }) }),
  z.object({
    task: z.literal('addWildcard'),
    input: z.object({
      title: str(300),
      description: str(5000),
      cuisine: str(100).optional().nullable(),
      ingredients: z.array(ingredient).max(100),
    }),
  }),
  z.object({
    task: z.literal('explainPairing'),
    input: z.object({ wildcard: str(200), ingredients: z.array(str(200)).max(100), title: str(300) }),
  }),
]);

type AIRequest = z.infer<typeof RequestSchema>;

async function buildPrompt(req: AIRequest): Promise<string> {
  switch (req.task) {
    case 'generateRecipe':
      return buildRecipePrompt(req.input);
    case 'suggestWildcard':
      return buildWildcardPrompt(req.input.ingredients, req.input.cuisine);
    case 'parseUrl':
      return buildUrlExtractionPrompt(await fetchPage(req.input.url));
    case 'parseText':
      return buildParseTextPrompt(req.input.text);
    case 'addWildcard':
      return buildAddWildcardPrompt({
        ...req.input,
        cuisine: req.input.cuisine ?? undefined,
        ingredients: req.input.ingredients as any,
      });
    case 'explainPairing':
      return buildExplainPairingPrompt(req.input.wildcard, req.input.ingredients, req.input.title);
  }
}

// Same-origin requests (the deployed web app) and native apps don't need CORS;
// allow localhost so `expo start --web` can call the deployed API during development.
function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin') ?? '';
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  }
  return {};
}

function json(body: unknown, status: number, request: Request): Response {
  return Response.json(body, { status, headers: corsHeaders(request) });
}

export function OPTIONS(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request): Promise<Response> {
  let req: AIRequest;
  try {
    req = RequestSchema.parse(await request.json());
  } catch {
    return json({ error: 'Invalid request' }, 400, request);
  }

  let prompt: string;
  try {
    prompt = await buildPrompt(req);
  } catch (e) {
    if (e instanceof FetchPageError) return json({ error: e.message }, e.status, request);
    throw e;
  }

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      // Recipe JSON is a simple task; low effort keeps responses fast.
      output_config: { effort: 'low' },
      // If a safety classifier declines, the API retries on a fallback model automatically.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: [{ role: 'user', content: prompt }],
    });

    if (response.stop_reason === 'refusal') {
      return json({ error: 'The AI declined this request. Please try rephrasing it.' }, 422, request);
    }

    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    return json({ text }, 200, request);
  } catch (error) {
    console.error('Claude API error:', error);
    if (error instanceof Anthropic.AuthenticationError) {
      return json({ error: 'AI service is misconfigured (invalid API key).' }, 500, request);
    }
    if (error instanceof Anthropic.RateLimitError) {
      return json({ error: 'AI service is busy. Please try again in a moment.' }, 429, request);
    }
    if (error instanceof Anthropic.APIError) {
      return json({ error: 'AI service error. Please try again.' }, 502, request);
    }
    return json({ error: 'Unexpected server error.' }, 500, request);
  }
}
