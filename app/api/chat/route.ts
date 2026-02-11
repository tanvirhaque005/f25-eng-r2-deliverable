/* eslint-disable */
import { generateResponse } from "@/lib/services/species-chat";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await generateResponse(message);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error generating chat response:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
