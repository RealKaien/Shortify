import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface GeminiSuggestions {
  aliases: string[];
  title: string;
  description: string;
}

export async function getUrlSuggestions(longUrl: string): Promise<GeminiSuggestions> {
  try {
    const ai = getGeminiClient();
    
    const prompt = `Analyze the following long URL: "${longUrl}".
    Based on this URL, please provide:
    1. A list of 3-4 highly relevant, short, punchy, and readable slug/alias options (lowercase letters, numbers, and hyphens only, no slashes, 4-12 characters long).
    2. A clean, descriptive title for the webpage/link (max 50 characters).
    3. A clear, concise, professional description summarizing what this link represents (max 120 characters).
    
    Respond STRICTLY in JSON format with the following schema:
    {
      "aliases": ["alias1", "alias2", "alias3"],
      "title": "A Clean Title",
      "description": "A brief, professional description of the link."
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aliases: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Short lowercase alphanumeric/hyphen slug suggestions",
            },
            title: {
              type: Type.STRING,
              description: "Webpage title summary",
            },
            description: {
              type: Type.STRING,
              description: "Webpage short summary description",
            },
          },
          required: ["aliases", "title", "description"],
        },
      },
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    
    return {
      aliases: Array.isArray(result.aliases) ? result.aliases : ["link-" + Math.random().toString(36).substring(2, 6)],
      title: typeof result.title === "string" ? result.title : "Shortened Link",
      description: typeof result.description === "string" ? result.description : "No description generated.",
    };
  } catch (error) {
    console.error("Gemini API error during suggestions:", error);
    // Graceful fallback suggestions
    const parsedUrl = (() => {
      try {
        return new URL(longUrl).hostname.replace('www.', '').split('.')[0];
      } catch {
        return 'link';
      }
    })();
    return {
      aliases: [
        `${parsedUrl}-${Math.random().toString(36).substring(2, 5)}`,
        `go-${Math.random().toString(36).substring(2, 6)}`,
      ],
      title: `Redirect to ${parsedUrl}`,
      description: `Shortened link redirecting to ${longUrl}`,
    };
  }
}
