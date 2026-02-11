/* eslint-disable */
import { createServerSupabaseClient } from "@/lib/server-utils";
import { generateResponse } from "@/lib/services/species-chat";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback to the existing rules-based responder if no Gemini key is configured.
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set; using rules-based chatbot fallback.");
      const response = await generateResponse(message);
      return NextResponse.json({ response });
    }

    const supabase = await createServerSupabaseClient();
    const { data: species } = await supabase
      .from("species")
      .select("scientific_name, common_name, kingdom, total_population, description");

    const speciesContext =
      species && species.length > 0
        ? species
            .map((s) => {
              return [
                `Scientific Name: ${s.scientific_name}`,
                `Common Name: ${s.common_name ?? "N/A"}`,
                `Kingdom: ${s.kingdom}`,
                `Total Population: ${s.total_population ?? "N/A"}`,
                `Description: ${s.description ?? "N/A"}`,
              ].join("\n");
            })
            .join("\n\n---\n\n")
        : "No species records available in the database.";

    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.2,
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "You are a species assistant for Biodiversity Hub. " +
                  "Answer using only the provided species database context. " +
                  "If the question is outside species data, say you can only help with species-related questions.\n\n" +
                  `Species database context:\n${speciesContext}\n\n` +
                  `User question:\n${message}`,
              },
            ],
          },
        ],
      }),
    },
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      const fallbackResponse = await generateResponse(message);
      const shortError = errorText.slice(0, 220);
      return NextResponse.json({
        response:
          `Gemini is unavailable right now (status ${geminiResponse.status}). Error: ${shortError}\n\n` +
          `I used local database mode instead.\n\n` +
          fallbackResponse,
      });
    }

    const data = (await geminiResponse.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };
    const response = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();

    if (!response) {
      const fallbackResponse = await generateResponse(message);
      return NextResponse.json({
        response: "Gemini returned an empty answer, so I used local database mode.\n\n" + fallbackResponse,
      });
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error generating chat response:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
