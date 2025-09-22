import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const chatInputSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })),
  model: z.string().default('gpt-5'),
  max_tokens: z.number().default(2000),
  temperature: z.number().default(0.7),
});

export const chatProcedure = publicProcedure
  .input(chatInputSchema)
  .mutation(async ({ input }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(input),
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
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  });