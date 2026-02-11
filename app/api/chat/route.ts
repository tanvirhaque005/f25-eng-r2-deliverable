import { NextResponse } from "next/server";

type ChatBody = { message?: unknown };

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatBody;
    const message = body.message;

    if (typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // You can now safely use `message` as a string here
    return NextResponse.json({ success: true, message });
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
