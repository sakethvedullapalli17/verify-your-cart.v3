
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

export class GeminiChatService {
  private chat: Chat | null = null;
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async sendMessage(message: string, onUpdate: (text: string) => void) {
    if (!this.chat) {
      this.chat = this.ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: 'You are an expert Shopping Assistant and Fraud Detector. You help users identify fake products, compare prices, and understand shopping risks. You have access to Google Search. If a user provides a link, use the search tool to verify it.',
          tools: [{ googleSearch: {} }],
        },
      });
    }

    try {
      const responseStream = await this.chat.sendMessageStream({ message });
      let fullText = "";
      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        fullText += c.text || "";
        onUpdate(fullText);
      }
      return fullText;
    } catch (error) {
      console.error("Chat Error:", error);
      throw error;
    }
  }

  reset() {
    this.chat = null;
  }
}

export const chatService = new GeminiChatService();
