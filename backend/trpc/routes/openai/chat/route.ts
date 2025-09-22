import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const chatInputSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })),
  model: z.string().default('gpt-4o'),
  max_tokens: z.number().default(2000),
  temperature: z.number().default(0.7),
});

async function callOpenAI(input: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey.includes('YOUR_ACTUAL')) {
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
      model: input.model === 'gpt-5' ? 'gpt-4o' : input.model, // Fallback to gpt-4o if gpt-5 not available
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
    provider: 'openai',
  };
}

async function callGemini(input: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.includes('YOUR_ACTUAL')) {
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
    provider: 'gemini',
  };
}

async function callWithFallback(input: any) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  
  const hasOpenAI = openaiKey && !openaiKey.includes('YOUR_ACTUAL');
  const hasGemini = geminiKey && !geminiKey.includes('YOUR_ACTUAL');
  
  if (!hasOpenAI && !hasGemini) {
    throw new Error('No API keys configured. Please set up either OpenAI or Gemini API key.');
  }
  
  // Try OpenAI first (preferred for GPT models)
  if (hasOpenAI) {
    try {
      console.log('Attempting OpenAI API call...');
      return await callOpenAI(input);
    } catch (error) {
      console.log('OpenAI failed, trying Gemini fallback:', error);
      if (hasGemini) {
        try {
          return await callGemini(input);
        } catch (geminiError) {
          console.error('Both APIs failed:', { openai: error, gemini: geminiError });
          throw new Error('Both OpenAI and Gemini APIs failed. Please check your API keys and try again.');
        }
      } else {
        throw error;
      }
    }
  }
  
  // If only Gemini is available
  if (hasGemini) {
    try {
      console.log('Using Gemini API...');
      return await callGemini(input);
    } catch (error) {
      console.error('Gemini API failed:', error);
      throw error;
    }
  }
  
  throw new Error('No working API configuration found.');
}

export const chatProcedure = publicProcedure
  .input(chatInputSchema)
  .mutation(async ({ input }) => {
    try {
      return await callWithFallback(input);
    } catch (error) {
      console.error('Chat API Error:', error);
      throw error;
    }
  });