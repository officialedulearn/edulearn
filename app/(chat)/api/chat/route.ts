import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUser } from "@/actions/login";
import { generateUUID, getMostRecentUserMessage } from "@/lib/utils";
import {
  saveMessages,
  saveDocument,
  saveChat,
  getChatById,
} from "@/lib/db/queries";
import { createDataStreamResponse } from "@/lib/utils";
import { GoogleGenAI } from "@google/genai";
import { systemPrompt } from "@/lib/ai/prompts";
import { generateTitleFromUserMessage } from "../../actions";
import { Message } from "@/components/message"; // Import custom Message type

const API_KEY = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenAI({ apiKey: API_KEY });
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(body);

    const { id, messages, selectedChatModel } = body;
    const user = await getUser();

    if (!user || !user.sub) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new NextResponse("No user message found", { status: 400 });
    }

    // Check if the chat already exists
    const chat = await getChatById({ id });
    let title: string;

    if (!chat) {
      title = await generateTitleFromUserMessage({ message: userMessage });
      await saveChat({ id, userAddress: user.sub, title });
    } else {
      if (chat.userAddress !== user.sub) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      title = chat.title;
    }

    // Save the user message
    await saveMessages({
      messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
    });

    try {
      const formattedMessages = [];

      for (const msg of messages) {
        formattedMessages.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: formattedMessages,

        config: {
          maxOutputTokens: 500,
          temperature: 0.1,
          systemInstruction:
            "You are an AI tutor designed to help students learn effectively by guiding them through problem-solving rather than simply providing direct answers. Your responses should be engaging, thought-provoking, and structured to encourage active learning. You should use strategic hints, analogies, and step-by-step guidance to help students arrive at answers on their own. Keep your tone friendly, supportive, and engaging, incorporating relevant emojis where appropriate to make the interaction more lively.",
        },
      });

      const response = result.text;
      const fullResponse = response;
      const assistantMessage = {
        id: generateUUID(),
        role: "assistant",
        content: fullResponse,
        createdAt: new Date(),
        chatId: id,
      };
      await saveMessages({
        messages: [assistantMessage],
      });

      if (user?.sub) {
        try {
          await saveDocument({
            id: generateUUID(),
            title,
            content: fullResponse as unknown as string,
            userId: user.sub as string,
          });
        } catch (error) {
          console.error("Failed to save document:", error);
        }
      }

      return new Response(fullResponse, {
        headers: { "Content-Type": "text/plain" },
      });
    } catch (error) {
      console.error("Error generating content:", error);
      return new NextResponse(
        `Error generating content: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("An error occurred in the POST function:", error);
    return new NextResponse("An error occurred while processing your request", {
      status: 500,
    });
  }
}
