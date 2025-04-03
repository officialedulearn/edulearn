"use server";
import { Message } from "@/components/message";
import { cookies } from "next/headers";
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
} from "@/lib/db/queries";
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenAI({ apiKey: API_KEY });

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function generateQuestions({messages}: {messages: Message[]}) {
  
} 

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message;
}) {
  // Initialize the model correctly

  
  try {
    // Format the message correctly for the Gemini API
    const formattedMessage = {
      role: "user",
      parts: [{ text: message.content }]
    };
    
    // Generate the title with proper parameters
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [formattedMessage],
      config: {
        maxOutputTokens: 500,
        temperature: 0.1,
        systemInstruction: `
          Generate a short title based on the first user message.
          Ensure it is not more than 80 characters.
          The title should be a summary of the user's message.
          Do not use quotes or colons.
        `,
      },
      // System instructions in Gemini go here
    });
    
    const response = result.text;
    const titleResponse = response;
    
    return titleResponse || "Untitled Chat";
  } catch (error) {
    console.error("Error generating title:", error);
    return "Untitled Chat";
  }
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}
