# Virtual Jewelry Try-On App

A Next.js web application for virtual jewelry try-on using AI models. Upload reference images, provide a prompt, and generate high-quality virtual try-on images.

## Features

- **Multi-image Upload**: Upload multiple reference images with preview
- **AI-Powered Analysis**: Uses OpenAI to analyze requests and determine processing needs
- **Image Generation**: Integrates with Fal AI for high-quality image generation
- **Real-time Feedback**: Shows processing status and error handling

## Environment Setup

Create a `.env.local` file with the following variables:

```bash
OPENAI_API_KEY=your_openai_api_key
FAL_KEY=your_fal_ai_api_key
```

## Fal AI Migration

⚠️ **Important**: This app uses the new `@fal-ai/client` package. The old `@fal-ai/serverless-client` is deprecated.

See [FAL_AI_SETUP.md](./FAL_AI_SETUP.md) for detailed setup instructions.

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables in `.env.local`

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) to access the app

## API Endpoints

- `POST /api/upload` - Upload images to external service
- `POST /api/process` - Process jewelry try-on requests

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **AI Services**: OpenAI GPT-4, Fal AI (Flux models)
- **Deployment**: Vercel-ready

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
