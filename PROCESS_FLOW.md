# Virtual Jewelry Try-On Process Flow

## Overview

The application follows a 4-step process to generate virtual jewelry try-on images:

## Step 1: Request Analysis

**Function**: `analyzeRequest(prompt, referenceImages)`

- Uses OpenAI GPT-4 to analyze the user's request
- Determines if model generation is needed (no person image provided)
- Determines if jewelry generation is needed (no jewelry image provided)
- Returns structured analysis with reasoning and suggested prompts

## Step 2: Model Generation (if needed)

**Function**: `generateModelImage(prompt)`

- Uses Fal AI flux/schnell model
- Generates a professional portrait with clean background
- Returns high-quality person image suitable for jewelry try-on
- Uses portrait_4_3 aspect ratio for better jewelry visualization

## Step 3: Jewelry Generation (if needed)

**Function**: `generateJewelryImage(prompt)`

- Uses Fal AI flux/schnell model
- Generates high-end jewelry with clean white background
- Professional product photography style
- Uses square_hd format for detailed jewelry visualization

## Step 4: Final Composition

**Function**: `generateFinalImage(originalPrompt, modelImageUrl?, jewelryImageUrl?, referenceImages?)`

- Combines all elements into final try-on image
- Uses enhanced prompting for realistic integration
- Ensures natural lighting and shadows
- Creates seamless composition of person wearing jewelry

## API Response Structure

```json
{
  "success": true,
  "analysis": {
    "needsModelGeneration": boolean,
    "needsJewelryGeneration": boolean,
    "reasoning": "string",
    "suggestedModelPrompt": "string",
    "suggestedJewelryPrompt": "string"
  },
  "modelImageUrl": "string | null",
  "jewelryImageUrl": "string | null",
  "generatedImageUrl": "string",
  "referenceImagesUsed": number
}
```

## Utility Functions Location

- `/src/utils/analyzeRequest.ts` - OpenAI analysis
- `/src/utils/generateModelImage.ts` - Model generation
- `/src/utils/generateJewelryImage.ts` - Jewelry generation
- `/src/utils/generateFinalImage.ts` - Final composition
- `/src/utils/index.ts` - Unified exports

## Error Handling

Each utility function includes:

- Authentication error detection
- Graceful fallbacks
- Detailed error reporting
- Progress logging

## Configuration

All functions use the centralized Fal AI configuration:

```typescript
fal.config({
  credentials: process.env.FAL_KEY,
});
```
