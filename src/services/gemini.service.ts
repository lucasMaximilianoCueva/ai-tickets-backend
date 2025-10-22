import {
  GoogleGenerativeAI,
  GenerationConfig,
  SafetySetting,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import "dotenv/config";

/**
 * Priority levels for ticket classification
 */
export type PriorityLevel = "BAJA" | "MEDIA" | "ALTA" | "CRITICA";

const API_KEY = process.env.NODE_ENV === 'test' 
  ? 'dummy-key-for-tests' 
  : (process.env.GEMINI_API_KEY || '');

if (!API_KEY && process.env.NODE_ENV !== 'test') {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generation configuration for deterministic and concise responses
 */
const generationConfig: GenerationConfig = {
  temperature: 0.1,
  topP: 0.1,
  topK: 1,
  maxOutputTokens: 10,
};

/**
 * Safety settings to block harmful content
 */
const safetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Analyzes ticket text and returns a priority level using Gemini AI
 * @param ticketText - The ticket description provided by the user
 * @returns A PriorityLevel (BAJA, MEDIA, ALTA, CRITICA)
 */
export async function analyzeTicketPriority(ticketText: string): Promise<PriorityLevel> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig,
      safetySettings,
    });

    const prompt = `
      You are an expert in support ticket classification.
      Analyze the following user ticket and determine its priority level.
      
      The only valid responses are: BAJA, MEDIA, ALTA, CRITICA.

      Classification criteria:
      - CRITICA: System is down, financial loss, or security breach
      - ALTA: Main functionality is broken but system remains operational
      - MEDIA: Non-blocking bug or complex inquiry
      - BAJA: General inquiry, feature request, or minor bug

      Respond with ONLY one of these four words, nothing else.

      Ticket: "${ticketText}"
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const priorityText = response.text().trim().toUpperCase();

    switch (priorityText) {
      case "BAJA":
      case "MEDIA":
      case "ALTA":
      case "CRITICA":
        return priorityText;
      default:
        console.warn(`Unexpected LLM response: ${priorityText}. Defaulting to MEDIA`);
        return "MEDIA";
    }
  } catch (error) {
    console.error("Error analyzing priority with Gemini:", error);
    return "MEDIA";
  }
}
