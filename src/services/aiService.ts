import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    // Check if error is a 429 Resource Exhausted
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
      if (retries > 0) {
        console.warn(`Rate limit exceeded. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return withRetry(fn, retries - 1, delay * 2);
      }
    }
    throw error;
  }
};

export const suggestCareerPaths = async (assessmentData: any) => {
  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Based on these assessment scores: ${JSON.stringify(assessmentData)}, suggest 3 distinct career paths.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "description"]
        }
      }
    }
  }));
  return JSON.parse(response.text || "[]");
};

export const generateLearningRoadmap = async (careerPath: string) => {
  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Generate a Markdown-formatted learning roadmap for ${careerPath}, covering Education from 10th standard to Masters, Skill Building, and a 4-phase timeline.`,
  }));
  return response.text;
};
