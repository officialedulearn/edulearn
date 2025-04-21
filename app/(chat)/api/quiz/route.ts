import { NextResponse } from "next/server";
import { getUser } from "@/actions/login";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenAI({ apiKey: API_KEY });
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { chatId } = await request.json();

    const user = await getUser();

    if (!user || !user.sub) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the chat history
    const chat = await getChatById({ id: chatId });
    const storedMessages = await getMessagesByChatId({ id: chatId });

    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    if (chat.userAddress !== user.sub) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get messages from the chat
    const messages = storedMessages || [];

    try {
      // Format messages for Gemini API - properly structured
      const formattedMessages = [];

      // Add existing messages
      for (const msg of messages) {
        formattedMessages.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }

      
      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Our conversation: ${JSON.stringify(messages)}`,
        config: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          systemInstruction: `Based on our conversation, generate 10 quiz questions to test my understanding.
              Each question should have 4 options with one correct answer.
              Format your response as a JSON array with exactly this structure:
              [
                {
                  "question": "the question text",
                  "options": ["option1", "option2", "option3", "option4"],
                  "correctAnswer": "the correct option",
                  "explanation": "explanation of the answer"
                },
                ...more questions
              ]
              
              Only return the JSON array with no additional text.`
        },
        //implement all safety settings in the future in all gemini calls
        // safetySettings: [
        //   {
        //     category: "HARM_CATEGORY_HARASSMENT",
        //     threshold: "BLOCK_MEDIUM_AND_ABOVE",
        //   },
        //   {
        //     category: "HARM_CATEGORY_HATE_SPEECH",
        //     threshold: "BLOCK_MEDIUM_AND_ABOVE",
        //   },
        //   {
        //     category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        //     threshold: "BLOCK_MEDIUM_AND_ABOVE",
        //   },
        //   {
        //     category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        //     threshold: "BLOCK_MEDIUM_AND_ABOVE",
        //   },
        // ],
      });

      const response = result.text;
      const text = response ?? "";

      // Parse the JSON from the response
      // Sometimes the model might wrap the JSON in markdown code blocks, so we need to extract it
      let jsonStr = text;
      if (text && text.includes("```json")) {
        jsonStr = text.split("```json")[1].split("```")[0].trim();
      } else if (text.includes("```")) {
        jsonStr = text.split("```")[1].split("```")[0].trim();
      }

      try {
        // Parse the JSON
        const quizQuestions = JSON.parse(jsonStr);

        // Return the formatted quiz questions
        return new Response(JSON.stringify(quizQuestions), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (jsonError) {
        console.error("Error parsing JSON from model response:", jsonError);
        return new NextResponse("Failed to generate valid quiz questions", {
          status: 500,
        });
      }
    } catch (aiError) {
      console.error("Error generating content with AI:", aiError);
      return new NextResponse(
        `Error generating quiz: ${
          aiError instanceof Error ? aiError.message : String(aiError)
        }`,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("An error occurred in the quiz generation function:", error);
    return new NextResponse("An error occurred while processing your request", {
      status: 500,
    });
  }
}
