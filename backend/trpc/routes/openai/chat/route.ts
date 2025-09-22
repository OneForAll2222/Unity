import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const chatInputSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })),
  model: z.string().default('gpt-4o'),
  provider: z.enum(['openai', 'gemini']).default('openai'),
  max_tokens: z.number().default(2000),
  temperature: z.number().default(0.7),
});

async function callOpenAI(input: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages: input.messages,
      model: input.model,
      max_tokens: input.max_tokens,
      temperature: input.temperature,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('OpenAI API Error:', errorData);
    throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.',
    usage: data.usage,
  };
}

async function callGemini(input: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Convert messages to Gemini format
  const geminiMessages = input.messages.map((msg: any) => {
    if (msg.role === 'system') {
      return { role: 'user', parts: [{ text: `System: ${msg.content}` }] };
    }
    return {
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    };
  });

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: geminiMessages,
      generationConfig: {
        temperature: input.temperature,
        maxOutputTokens: input.max_tokens,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Gemini API Error:', errorData);
    throw new Error(`Gemini API Error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t generate a response.';
  
  return {
    content,
    usage: data.usageMetadata,
  };
}

export const chatProcedure = publicProcedure
  .input(chatInputSchema)
  .mutation(async ({ input }) => {
    try {
      if (input.provider === 'gemini') {
        return await callGemini(input);
      } else {
        return await callOpenAI(input);
      }
    } catch (error) {
      console.error(`Error calling ${input.provider} API:`, error);
      throw error;
    }
  });