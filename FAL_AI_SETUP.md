# Fal AI Setup Guide

## Migration to @fal-ai/client

The application has been migrated from the deprecated `@fal-ai/serverless-client` to the new `@fal-ai/client` package.

## API Key Setup

1. **Get your Fal AI API Key**

   - Visit [fal.ai](https://fal.ai) and create an account
   - Navigate to your dashboard/settings
   - Generate a new API key

2. **Set Environment Variable**

   - Add your API key to `.env.local`:

   ```bash
   FAL_KEY=your_actual_api_key_here
   ```

3. **Current Models Used**
   - Primary model: `fal-ai/flux/schnell` (fast generation)
   - Backup model: `fal-ai/flux/dev` (higher quality, slower)

## API Usage

The application uses the new client API structure:

```javascript
import { fal } from "@fal-ai/client";

// Configure credentials
fal.config({
  credentials: process.env.FAL_KEY,
});

// Generate image
const result = await fal.subscribe("fal-ai/flux/schnell", {
  input: {
    prompt: "your prompt here",
    image_size: "portrait_4_3",
    num_inference_steps: 4,
    num_images: 1,
    enable_safety_checker: true,
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      console.log("Progress:", update.status);
    }
  },
});
```

## Error Handling

The application now includes improved error handling for:

- Authentication failures
- Invalid API keys
- Network issues
- Model unavailability

## Testing

To test the API:

```bash
curl -X POST http://localhost:3002/api/process \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful woman wearing elegant gold earrings",
    "referenceImages": []
  }'
```

If you get an authentication error, check your FAL_KEY in `.env.local`.
