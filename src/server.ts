import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define interfaces for request and response body
interface GenerateRequestBody {
  feature: string;
  acceptanceCriteria?: string;
  testCaseCount?: number;
  promptVersion?: 'standard' | 'detailed';
  includeEdgeCases?: boolean;
  regenerateContext?: {
    title: string;
    steps?: string[];
    expected_result?: string;
    category?: string;
  };
}

interface TestCase {
  title: string;
  steps: string[];
  expected_result: string;
  category: string;
}

interface GenerateResponseBody {
  testCases?: TestCase[];
  error?: string;
}

/**
 * POST /api/generate
 * Generates test cases for a given feature description using the Gemini API.
 */
app.post('/api/generate', async (req: Request<{}, {}, GenerateRequestBody>, res: Response<GenerateResponseBody>): Promise<any> => {
  const { 
    feature, 
    acceptanceCriteria, 
    testCaseCount = 5, 
    promptVersion = 'standard', 
    includeEdgeCases = false,
    regenerateContext
  } = req.body;

  // Validation: Missing or empty string
  if (!feature || typeof feature !== 'string' || feature.trim() === '') {
    return res.status(400).json({ error: 'Feature description is required' });
  }

  // Validation: Exceeds 2000 characters
  if (feature.length > 2000) {
    return res.status(400).json({ error: 'Feature description cannot exceed 2000 characters' });
  }

  try {
    let systemInstruction = '';
    
    if (regenerateContext) {
      systemInstruction = `You are an expert QA engineer. Regenerate the single test case titled '${regenerateContext.title}' for the feature '${feature}'.
Make it ${promptVersion === 'detailed' ? 'highly detailed and comprehensive' : 'structured and clear'}.
${includeEdgeCases ? 'Focus heavily on boundary conditions, invalid inputs, and error scenarios.' : ''}
${acceptanceCriteria ? `The test case must validate these acceptance criteria: ${acceptanceCriteria}` : ''}
Return ONLY a valid JSON array containing exactly ONE test case object. The object must have: title, steps (array of strings), expected_result, and category (Functional, Security, Boundary, UX). No explanation outside the JSON.`;
    } else {
      systemInstruction = `You are an expert QA engineer. Generate ${testCaseCount} ${promptVersion === 'detailed' ? 'highly detailed and comprehensive' : 'structured'} test cases for the feature the user describes. 
${includeEdgeCases ? 'Specifically include boundary conditions, invalid inputs, and error scenarios (edge cases).' : 'Include positive (happy path) test cases and negative test cases.'}
${acceptanceCriteria ? `The feature must meet these acceptance criteria: ${acceptanceCriteria}` : ''}
Each test case must have: title, steps (array of strings), expected_result, and category. 
Valid categories: Functional, Security, Boundary, UX.
Return ONLY a valid JSON array. No explanation outside the JSON.`;
    }

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: feature,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
        responseMimeType: "application/json"
      }
    });

    const outputText = response.text;
    
    if (!outputText) {
      throw new Error('AI returned empty response text');
    }

    let testCases: TestCase[];
    try {
      testCases = JSON.parse(outputText);
      if (!Array.isArray(testCases)) {
        throw new Error('Response is not a JSON array');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', outputText);
      return res.status(500).json({ error: 'AI returned invalid response' });
    }

    // Success response
    res.json({ testCases });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error while calling AI' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`TestGenie server is running on http://localhost:${PORT}`);
});
