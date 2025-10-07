/**
 * Gemini AI API service for generating summaries and policy suggestions,
 * with dynamic model discovery.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
}

const MODELS_LIST_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;

/**
 * Type definitions
 */
export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface ModelInfo {
  name: string;                       // e.g. "models/gemini-1.5-flash-001"
  supportedGenerationMethods: string[]; // e.g. ["generateContent", ...]
  // other metadata fields omitted
}

interface ListModelsResponse {
  models: ModelInfo[];
}

/**
 * Fetch list of models available to your API key
 */
async function listAvailableModels(): Promise<ModelInfo[]> {
  const resp = await fetch(MODELS_LIST_URL, {
    method: 'GET',
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => null);
    const msg = err?.error?.message || resp.statusText;
    throw new Error(`Failed to list Gemini models: ${msg}`);
  }
  const data = (await resp.json()) as ListModelsResponse;
  return data.models;
}

/**
 * Pick a model that supports `generateContent`
 */
async function pickModelWithGenerateContent(): Promise<string> {
  const models = await listAvailableModels();
  // Filter those models that list "generateContent" in supportedGenerationMethods
  const usable = models.filter(m =>
    Array.isArray(m.supportedGenerationMethods) &&
    m.supportedGenerationMethods.includes('generateContent')
  );
  if (usable.length === 0) {
    throw new Error('No model supports generateContent in this project.');
  }
  // You could apply further heuristic or priority: choose the one with highest version, etc.
  // For now, pick the first one (or you can sort)
  return usable[0].name;  // e.g. "models/gemini-1.5-flash-001"
}

/**
 * Call Gemini API with prompt, using a discovered model
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  const modelName = await pickModelWithGenerateContent();  // dynamic resolution
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
      topP: 0.95,
      topK: 40,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => null);
    const msg = err?.error?.message || resp.statusText;
    throw new Error(`Gemini API error: ${msg}`);
  }

  const data = (await resp.json()) as GeminiResponse;
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response returned from Gemini API');
  }
  return data.candidates[0].content.parts[0].text.trim();
}

/**
 * Generate AI summary of overall findings
 */
export async function generateAnalysisSummary(keyMetrics: {
  loudestStation: string;
  highestAvgNoise: number;
  avgViolationRate: number;
}): Promise<string> {
  const prompt = `You are an environmental analyst. Based on the following noise pollution data from Delhi NCR:

- Loudest Station: ${keyMetrics.loudestStation}
- Highest Average Noise Level: ${keyMetrics.highestAvgNoise} dBA
- Average Violation Rate: ${keyMetrics.avgViolationRate}%

Generate a professional 3–4 sentence summary of the key findings. Focus on the severity of the noise pollution problem and its implications for public health and policy. Be concise and data-driven.`;

  return callGeminiAPI(prompt);
}

/**
 * Generate policy suggestions for a specific location
 */
export async function generatePolicySuggestions(location: {
  name: string;
  zoneType: string;
  violationRate: number;
  avgNoise: number;
  limit: number;
}): Promise<string> {
  const prompt = `You are an urban planning and environmental policy expert. Generate 3–5 specific, actionable policy recommendations to reduce noise pollution for the following location:

Location: ${location.name}
Zone Type: ${location.zoneType}
Current Average Noise: ${location.avgNoise} dBA
Legal Limit: ${location.limit} dBA
Violation Rate: ${location.violationRate}%

Provide practical, implementable solutions that are specific to this zone type and violation severity. Format as a numbered list.`;

  return callGeminiAPI(prompt);
}
