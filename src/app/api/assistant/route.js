import { NextResponse } from 'next/server';
import connectDB from "@/app/lib/connectdb";
import Task from "@/app/models/task";
import ChatHistory from "@/app/models/chathistory";
import Memory from "@/app/models/memory";
import { assistantAgent } from "@/app/lib/assistant-logic";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

// ----------------------
// Fetch Memory From DB
// ----------------------
async function fetchUserMemory() {
  try {
    await connectDB();
    const memories = await Memory.find({});
    return memories.map(m => `${m.key}: ${m.value}`).join("\n");
  } catch (error) {
    console.error("Memory Fetch Error:", error);
    return "";
  }
}

// ----------------------------------------
// POST API ROUTE
// ----------------------------------------
export async function POST(req) {
  try {
    const body = await req.json();
    const userQuery = body.message || body.userQuery || body.text;
    const sessionId = body.sessionId || "default-session";

    if (!userQuery) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    await connectDB();
    
    // 1. Get Context & Memory
    const userMemory = await fetchUserMemory();
    
    let historyDocument = await ChatHistory.findOne({ sessionId });
    if (!historyDocument) historyDocument = await ChatHistory.create({ sessionId });

    // 2. Prepare LangChain messages
    const systemPrompt = `You are JARVIS, a powerful AI assistant for Deepansh Sharma (Boss).
    You manage his tasks, school leads (ERP), and brainstorming sessions.
    
    USER CONTEXT & MEMORY:
    ${userMemory}
    
    TODAY IS: ${new Date().toLocaleDateString()}
    
    ADVICE:
    - Address him as "Boss".
    - Keep responses concise and professional.
    - If he asks to manage tasks or leads, use the provided tools.
    - If he wants to brainstorm or refactor code, just reply normally.
    - You can store new facts about him using the update_memory tool.
    `;

    const messages = [new SystemMessage(systemPrompt)];
    
    // Add history (limit to last 10 messages for token efficiency)
    historyDocument.messages.slice(-10).forEach(msg => {
      if (msg.role === 'user') {
        messages.push(new HumanMessage(msg.content));
      } else {
        messages.push(new AIMessage(msg.content));
      }
    });

    // Add current query
    messages.push(new HumanMessage(userQuery));

    // 3. Invoke LangGraph
    const result = await assistantAgent.invoke({ messages });
    const lastMessage = result.messages[result.messages.length - 1];
    const replyText = lastMessage.content;

    // 4. Update History
    historyDocument.messages.push(
      { role: 'user', content: userQuery },
      { role: 'model', content: replyText }
    );
    await historyDocument.save();

    return NextResponse.json({ text: replyText });

  } catch (error) {
    console.error("LangGraph Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
