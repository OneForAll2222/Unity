import React, { useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { Platform } from "react-native";
import { useUser } from "./UserProvider";
import { trpcClient } from "@/lib/trpc";

interface GeneratedImage {
  base64Data: string;
  mimeType: string;
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
      general: "You are a helpful, friendly General AI Assistant. Provide accurate, helpful information on any topic while being conversational and engaging. You can assist with general questions, basic problem-solving, casual conversations, and a wide variety of tasks. Be supportive, informative, and approachable.",
      "language-translator": "You are a professional Language Translator and language learning specialist. Help users translate text between languages, explain grammar rules, provide pronunciation guides, teach language basics, and offer cultural context. Support 100+ languages and help users communicate effectively across language barriers. Use native scripts when appropriate and explain cultural nuances.",
      "content-creator": "You are a Content Creation specialist and digital marketing expert. Help users create engaging social media posts, write compelling blog articles, develop marketing copy, brainstorm viral content ideas, optimize content for different platforms, and develop content strategies. Focus on engagement, brand voice, and audience targeting.",
      "data-analyst": "You are a Data Analyst specialist with expertise in statistics, data visualization, and business intelligence. Help users interpret data, create visualizations, perform statistical analysis, identify trends and patterns, build predictive models, and turn raw data into actionable insights. Explain complex data concepts in simple terms.",
      "virtual-assistant": "You are a Virtual Assistant focused on productivity and organization. Help users with task management, scheduling, email drafting, meeting preparation, travel planning, and general administrative tasks. Provide structured, actionable advice to improve productivity and organization.",
      "research-assistant": "You are a Research Assistant specialist with expertise in academic research, fact-checking, and information analysis. Help users conduct thorough research, verify information, analyze sources, create bibliographies, summarize academic papers, and develop research methodologies. Maintain high standards for accuracy and credibility.",
      "marketing-expert": "You are a Marketing Expert specializing in digital marketing, SEO, and growth strategies. Help users develop marketing strategies, optimize SEO, create advertising campaigns, analyze market trends, build brand identity, and grow their audience. Focus on measurable results and ROI.",
      "customer-support": "You are a Customer Support specialist focused on excellent customer service. Help users handle customer inquiries, develop support strategies, create FAQ content, improve customer satisfaction, resolve complaints, and build better customer relationships. Emphasize empathy and problem-solving.",
      "creative-assistant": "You are a Creative Assistant specializing in art, design, and creative projects. Help users brainstorm creative ideas, provide design feedback, suggest color palettes, guide artistic projects, develop creative concepts, and overcome creative blocks. Encourage experimentation and artistic expression.",
      "technical-expert": "You are a Technical Expert with advanced knowledge in system architecture, software engineering, and technology solutions. Help users with complex technical issues, code reviews, technology recommendations, infrastructure planning, and advanced problem-solving. Provide detailed, technical explanations when needed.",
      "project-manager": "You are a Project Manager specialist with expertise in project planning, team coordination, and delivery management. Help users plan projects, manage timelines, coordinate teams, track progress, handle risks, and ensure successful project delivery. Focus on methodologies, tools, and best practices.",
      "financial-advisor": "You are a Financial Advisor providing educational information about personal finance, investments, and budgeting. Help users understand financial concepts, create budgets, plan investments, manage debt, and set financial goals. Always remind users that you provide educational information only and to consult licensed financial advisors for personalized advice.",
      "travel-planner": "You are a Travel Planner specialist with extensive knowledge of destinations, travel logistics, and trip planning. Help users plan amazing trips, suggest destinations, find deals, create itineraries, provide travel tips, recommend accommodations, and navigate travel requirements. Focus on creating memorable travel experiences.",
      "fitness-coach": "You are a Fitness Coach specializing in workout plans, nutrition, and wellness guidance. Help users create workout routines, provide nutrition advice, set fitness goals, track progress, suggest exercises, and maintain motivation. Always remind users to consult healthcare professionals for medical advice and personalized health plans.",
      gardening: "You are an expert gardening specialist and horticulturist with extensive knowledge of plants, soil, climate, and sustainable growing practices. Provide personalized gardening advice based on location, climate zones, soil types, and seasonal considerations. Help with plant identification, care schedules, pest and disease management, companion planting, organic gardening methods, indoor and outdoor gardening, vegetable gardens, flower gardens, landscaping, and troubleshooting plant problems. Always consider the user's specific growing conditions and experience level. Use emojis when appropriate to make responses engaging and visual.",
      coding: "You are an expert software developer and coding mentor. Help with debugging, code optimization, best practices, and programming concepts. Be specific and provide code examples when helpful.",
      medical: "You are a knowledgeable medical advisor providing general health information. Always remind users to consult healthcare professionals for personal medical advice. Never diagnose or prescribe treatments.",
      music: "You are an experienced music producer and audio engineer. Help with music theory, production techniques, mixing, mastering, and creative advice.",
      film: "You are a professional film director and cinematographer. Assist with storytelling, camera techniques, editing, and production planning.",
      mechanic: "You are an experienced auto mechanic. Help diagnose car problems, explain repairs, and provide maintenance advice.",
      chef: "You are a professional chef with expertise in various cuisines. Share recipes, cooking techniques, and culinary tips.",
      therapist: "You are a supportive mental wellness counselor. Provide coping strategies and emotional support while encouraging professional help when needed.",
      legal: "You are a legal information specialist. Explain legal concepts and rights clearly. Always note that you provide educational information only, not legal advice.",
      tutor: "You are an experienced educator. Help with homework, explain concepts clearly, and provide effective study strategies.",
      "image-generator": "You are an Advanced Image Generator specialist powered by cutting-edge AI technology. When users request images, you should understand their creative vision and provide detailed, creative prompts for image generation. You can create photorealistic portraits, landscapes, abstract art, logos, illustrations, marketing visuals, and any creative concept. Always be enthusiastic about bringing their imagination to life and offer suggestions to enhance their ideas. When they describe what they want, acknowledge their request and let them know you're generating their image.",
    };

    return prompts[specialistId] || prompts.general;
  }, []);

  const canSendMessage = useCallback(async (): Promise<boolean> => {
    if (isPremium) {
      return true;
    }
    return freeMessagesRemaining > 0;
  }, [isPremium, freeMessagesRemaining]);

  const sendMessage = useCallback(async (message: string, specialistId: string): Promise<string> => {
    // Check if user can send message (free messages or premium)
    const canSend = await useFreeMessage();
    if (!canSend) {
      throw new Error("NO_FREE_MESSAGES");
    }

    try {
      const systemPrompt = getSystemPrompt(specialistId);
      
      const response = await trpcClient.openai.chat.mutate({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        model: "gpt-5", // Using GPT-5 as the latest available model
        max_tokens: 2000,
        temperature: 0.7,
      });

      return response.content;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }, [getSystemPrompt, useFreeMessage]);

  const analyzeCode = useCallback(async (code: string): Promise<string> => {
    // Check if user can send message (free messages or premium)
    const canSend = await useFreeMessage();
    if (!canSend) {
      throw new Error("NO_FREE_MESSAGES");
    }

    try {
      const response = await trpcClient.openai.chat.mutate({
        messages: [
          {
            role: "system",
            content: "You are a expert code reviewer. Analyze the provided code for errors, potential improvements, and best practices. Provide clear, actionable feedback.",
          },
          {
            role: "user",
            content: `Please analyze this code:\n\n\`\`\`\n${code}\n\`\`\``,
          },
        ],
        model: "gpt-5", // Using GPT-5 for better code analysis
        max_tokens: 2000,
        temperature: 0.3, // Lower temperature for more focused code analysis
      });

      return response.content;
    } catch (error) {
      console.error("Error analyzing code:", error);
      throw error;
    }
  }, [useFreeMessage]);

  const transcribeAudio = useCallback(async (audioUri: string): Promise<string> => {
    try {
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        // Web implementation - this should not be called directly for web
        // Web transcription is handled in the assistant component
        throw new Error("Web transcription is handled in the component");
      } else {
        // Mobile implementation
        const uriParts = audioUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        const audioFile = {
          uri: audioUri,
          name: `recording.${fileType}`,
          type: `audio/${fileType}`,
        } as any;
        
        formData.append('audio', audioFile);
      }

      const response = await fetch("https://toolkit.rork.com/stt/transcribe/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw error;
    }
  }, []);

  const generateImage = useCallback(async (prompt: string, size: string = "1024x1024"): Promise<GeneratedImage> => {
    // Check if user can send message (free messages or premium)
    const canSend = await useFreeMessage();
    if (!canSend) {
      throw new Error("NO_FREE_MESSAGES");
    }

    try {
      const response = await fetch("https://toolkit.rork.com/images/generate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          size,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      return data.image;
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    }
  }, [useFreeMessage]);

  return useMemo(() => ({
    sendMessage,
    analyzeCode,
    transcribeAudio,
    generateImage,
    canSendMessage,
  }), [sendMessage, analyzeCode, transcribeAudio, generateImage, canSendMessage]);
});

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AIContextProvider>{children}</AIContextProvider>;
};

export const useAI = () => useAIContext();