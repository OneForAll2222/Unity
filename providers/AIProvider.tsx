import React, { useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";

import { trpcClient } from "@/lib/trpc";
import { useUser } from "@/providers/UserProvider";
import { APP_CONFIG } from "@/constants/config";

interface GeneratedImage {
  url: string;
  prompt: string;
  size: string;
}

interface AIContextType {
  sendMessage: (message: string, specialistId: string) => Promise<string>;
  analyzeCode: (code: string) => Promise<string>;
  transcribeAudio: (audioUri: string) => Promise<string>;
  generateImage: (prompt: string, size?: string) => Promise<GeneratedImage>;
  canSendMessage: () => Promise<boolean>;
}

const [AIContextProvider, useAIContext] = createContextHook<AIContextType>(() => {
  const { useFreeMessage, isPremium, freeMessagesRemaining } = useUser();

  const getSystemPrompt = useCallback((specialistId: string): string => {
    const prompts: Record<string, string> = {
      general:
        "You are a helpful, friendly General AI Assistant. Provide accurate, helpful information on any topic while being conversational and engaging.",
      "language-translator":
        "You are a professional Language Translator and language learning specialist. Help users translate text between languages and explain grammar nuances.",
      "content-creator":
        "You are a content strategist who crafts scroll-stopping campaigns, copy, and scripts tuned for each channel.",
      "data-analyst":
        "You are a data analyst. Interpret metrics, highlight trends, and suggest actions in clear, precise language.",
      "virtual-assistant":
        "You are an executive assistant who excels at organization, scheduling, and personal productivity workflows.",
      "research-assistant":
        "You are a research analyst who validates sources, summarizes literature, and composes structured insights.",
      "marketing-expert":
        "You are a marketing expert focused on growth strategy, messaging frameworks, and campaign optimization.",
      "customer-support":
        "You are a customer support advisor who solves issues empathetically and documents knowledge base updates.",
      "creative-assistant":
        "You are a creative partner helping ideate visuals, stories, and memorable experiences across mediums.",
      "technical-expert":
        "You are a senior software architect with deep expertise across modern stacks and scalable systems.",
      "project-manager":
        "You are a delivery lead who builds roadmaps, clarifies scope, and mitigates risk.",
      "financial-advisor":
        "You are a financial educator. Share planning, investing, and budgeting insights in plain language while reminding users to consult licensed professionals.",
      "travel-planner":
        "You are a travel concierge curating immersive itineraries, logistics, and local recommendations.",
      "fitness-coach":
        "You are a fitness coach crafting balanced routines and nutrition tips while encouraging professional medical guidance.",
      gardening:
        "You are a versatile premium General Assistant. Offer thoughtful, well-structured help across research, writing, planning, creative ideation, and daily decisions.",
      coding:
        "You are a senior engineer who debugs quickly, writes elegant code, and teaches best practices with examples.",
      medical:
        "You provide high-level health education while directing users to licensed medical professionals for diagnosis or treatment.",
      music:
        "You are an experienced music producer guiding songwriting, arrangement, mixing, and audio polish with actionable studio advice.",
      film:
        "You are a film director and cinematographer advising on storytelling, shot design, and post-production flow.",
      mechanic:
        "You are a master mechanic diagnosing issues, recommending maintenance, and explaining repairs in approachable language.",
      chef:
        "You are a chef developing recipes, substitutions, and plating ideas tailored to taste and dietary needs.",
      therapist:
        "You provide compassionate mental wellness support with coping strategies while encouraging professional care when needed.",
      legal:
        "You share legal concepts and process insights for educational purposes, reminding users to consult licensed attorneys.",
      tutor:
        "You are an educator who breaks concepts down with memorable analogies and step-by-step guidance.",
      "image-generator":
        "You are an image generation maestro crafting evocative prompts for stunning visuals across styles and mediums.",
    };

    return prompts[specialistId] ?? prompts.general;
  }, []);

  const canSendMessage = useCallback(async (): Promise<boolean> => {
    if (APP_CONFIG.DEVELOPMENT.UNLIMITED_ACCESS || isPremium) {
      console.log("[AIProvider] Unlimited access for messaging");
      return true;
    }
    const hasCredits = freeMessagesRemaining > 0;
    console.log("[AIProvider] Checking free messages", { freeMessagesRemaining, hasCredits });
    return hasCredits;
  }, [freeMessagesRemaining, isPremium]);

  const sendMessage = useCallback(
    async (message: string, specialistId: string): Promise<string> => {
      const trimmed = message.trim();
      if (!trimmed) {
        return "";
      }

      console.log("[AIProvider] Preparing message", { specialistId, snippet: trimmed.slice(0, 40) });

      if (!(APP_CONFIG.DEVELOPMENT.UNLIMITED_ACCESS || isPremium)) {
        const allowed = await useFreeMessage();
        if (!allowed) {
          console.warn("[AIProvider] No free messages remaining");
          throw new Error("NO_FREE_MESSAGES");
        }
      }

      const messages = [
        { role: "system" as const, content: getSystemPrompt(specialistId) },
        { role: "user" as const, content: trimmed },
      ];

      try {
        const response = await trpcClient.openai.chat.mutate({
          messages,
          model: "gpt-4o-mini",
          max_tokens: 1200,
          temperature: 0.7,
        });
        const content = response?.content?.trim() ?? "";
        console.log("[AIProvider] AI response received", {
          provider: response?.provider,
          length: content.length,
        });
        if (!content) {
          throw new Error("Empty response from AI");
        }
        return content;
      } catch (error: unknown) {
        const description = error instanceof Error ? error.message : "Unknown error";
        console.error("[AIProvider] sendMessage failed", description);
        throw new Error(description);
      }
    },
    [getSystemPrompt, isPremium, useFreeMessage]
  );

  const analyzeCode = useCallback(
    async (code: string): Promise<string> => {
      const payload = `Analyze the following code. Highlight bugs, complexity, architecture risks, and improvements.\n\n${code}`;
      return sendMessage(payload, "coding");
    },
    [sendMessage]
  );

  const transcribeAudio = useCallback(async (_audioUri: string): Promise<string> => {
    console.log("[AIProvider] Transcription placeholder invoked");
    return "Voice transcription is coming soon.";
  }, []);

  const generateImage = useCallback(async (prompt: string, size = "1024x1024"): Promise<GeneratedImage> => {
    const body = JSON.stringify({ prompt, size });
    console.log("[AIProvider] Generating image", { prompt: prompt.slice(0, 60), size });

    const response = await fetch("https://toolkit.rork.com/images/generate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[AIProvider] Image generation failed", text);
      throw new Error("Image generation failed");
    }

    const data = await response.json() as {
      image: { base64Data: string; mimeType: string };
      size: string;
    };

    const uri = `data:${data.image.mimeType};base64,${data.image.base64Data}`;
    return {
      url: uri,
      prompt,
      size: data.size,
    };
  }, []);

  return useMemo(
    () => ({
      sendMessage,
      analyzeCode,
      transcribeAudio,
      generateImage,
      canSendMessage,
    }),
    [analyzeCode, canSendMessage, generateImage, sendMessage, transcribeAudio]
  );
});

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AIContextProvider>{children}</AIContextProvider>;
};

export const useAI = () => useAIContext();
