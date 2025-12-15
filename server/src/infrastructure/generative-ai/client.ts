import { OpenRouter } from '@openrouter/sdk';

export const openRouter = new OpenRouter({
    apiKey: process.env.GENERATIVE_AI_API_KEY!,
});


