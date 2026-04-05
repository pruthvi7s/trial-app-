import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const suggestCareerPaths = async (assessmentData: any) => {
  const response = await ai.models.generateContent({
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
  });
  return JSON.parse(response.text || "[]");
};

export const generateLearningRoadmap = async (careerPath: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Generate a Markdown-formatted learning roadmap for ${careerPath}, covering Education from 10th standard to Masters, Skill Building, and a 4-phase timeline.`,
  });
  return response.text;
};
