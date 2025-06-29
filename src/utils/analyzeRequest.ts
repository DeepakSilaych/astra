import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AnalysisResult {
  needsModelGeneration: boolean;
  needsJewelryGeneration: boolean;
  reasoning: string;
  suggestedModelPrompt?: string;
  suggestedJewelryPrompt?: string;
}

/**
 * Analyzes the request using OpenAI to determine what needs to be generated
 */
export async function analyzeRequest(
  prompt: string,
  referenceImages: string[] = []
): Promise<AnalysisResult> {
  const analysisPrompt = `
  Analyze this virtual try-on request: "${prompt}"
  
  Reference images provided: ${referenceImages.length}
  
  Determine if we need to:
  1. Generate a new person image (if no suitable person image is provided)
  2. Generate an accessory image (if no accessory reference is provided)
  3. Use the provided reference images directly
  
  Consider the prompt content to understand what accessories are mentioned.
  
  For model generation prompts, describe ONLY the person's appearance without mentioning accessories, try-on, or their purpose. Focus on clean portraits.
  
  Respond with JSON in this exact format:
  {
    "needsModelGeneration": boolean,
    "needsJewelryGeneration": boolean,
    "reasoning": "explanation of decision",
    "suggestedModelPrompt": "if needsModelGeneration is true, provide a CLEAN portrait prompt describing only the person (no accessories, no try-on mentions)",
    "suggestedJewelryPrompt": "if needsJewelryGeneration is true, provide a prompt for generating the accessory"
  }
  `;

  console.log("Analyzing request with OpenAI...");

  const analysisResponse = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant that analyzes image generation requests for virtual try-on applications. Always respond with valid JSON. When generating model prompts, describe ONLY the person's appearance without mentioning accessories, jewelry, try-on purposes, or their role. Focus on clean portrait descriptions.",
      },
      {
        role: "user",
        content: analysisPrompt,
      },
    ],
    temperature: 0.3,
  });

  try {
    const analysis = JSON.parse(
      analysisResponse.choices[0].message.content || "{}"
    );
    console.log("Analysis result:", analysis);
    return analysis;
  } catch (parseError) {
    console.error("Error parsing OpenAI response:", parseError);
    console.error("Raw response:", analysisResponse.choices[0].message.content);
    throw new Error("Failed to analyze request");
  }
}
