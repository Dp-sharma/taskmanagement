import { NextResponse } from 'next/server';
import connectDB from "@/app/lib/connectdb";
import ChatHistory from "@/app/models/chathistory";

export async function GET() {
  try {
    await connectDB();
    const history = await ChatHistory.find({})
      .sort({ lastActivity: -1 })
      .limit(5)
      .select('sessionId title lastActivity messages')
      .lean();

    const formattedHistory = history.map(h => ({
      id: h.sessionId,
      title: h.title,
      lastMsg: h.messages.length > 0 ? h.messages[h.messages.length - 1].content : "No messages yet"
    }));

    return NextResponse.json(formattedHistory);
  } catch (error) {
    console.error("History Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
