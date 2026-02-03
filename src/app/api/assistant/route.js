import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';
import connectDB from "@/app/lib/connectdb";
import Task from "@/app/models/task";
import ChatHistory from "@/app/models/chathistory";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
console.log("API Key configured:", !!process.env.GEMINI_API_KEY);

// ----------------------
// Fetch Tasks From DB
// ----------------------
async function fetchAllTasksFromDB() {
  try {
    await connectDB();
    const tasks = await Task.find({ status: { $ne: 'Complete' } }) // Only fetch non-completed tasks for context
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return tasks;
  } catch (error) {
    console.error("DB Error:", error);
    return [];
  }
}

// ----------------------------------------
// Helper: Execute Task Actions
// ----------------------------------------
async function handleTaskActions(responseText) {
  const regex = /```json\s*(\[\s*\{[\s\S]*?\}\s*\])\s*```/g;
  const match = regex.exec(responseText);

  if (!match) return;

  try {
    const actions = JSON.parse(match[1]);
    if (!Array.isArray(actions) || actions.length === 0) return;

    console.log(`Processing ${actions.length} task actions.`);
    await connectDB();

    for (const action of actions) {
      try {
        // CREATE
        if (action.action === "create") {
          console.log("Creating Task:", action.Task);
          await Task.create({
            name: action.Task,
            description: `Project: ${action.Project || 'General'} | Priority: ${action.Priority || 'Medium'}`,
            priority: ["Low", "Medium", "High"].includes(action.Priority) ? action.Priority : "Medium",
            status: "Pending" // Default status
          });
        }

        // UPDATE
        else if (action.action === "update") {
          console.log("Updating Task:", action.searchName);
          // Build update object dynamically
          const updateFields = {};
          if (action.status) updateFields.status = action.status;
          if (action.Priority) updateFields.priority = action.Priority;

          // Fuzzy match name
          if (Object.keys(updateFields).length > 0) {
            await Task.findOneAndUpdate(
              { name: new RegExp(action.searchName, 'i') },
              updateFields
            );
          }
        }

        // DELETE
        else if (action.action === "delete") {
          console.log("Deleting Task:", action.searchName);
          await Task.findOneAndDelete({ name: new RegExp(action.searchName, 'i') });
        }

      } catch (innerError) {
        console.error(`Error processing action ${action.action}:`, innerError);
      }
    }
  } catch (e) {
    console.error("Failed to parse/execute task actions:", e);
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

    // 1. Get Context
    await connectDB();
    const allTasks = await fetchAllTasksFromDB();
    // Provide compact list for context
    const taskListText = JSON.stringify(allTasks.map(t => ({ name: t.name, status: t.status, priority: t.priority })), null, 2);

    let historyDocument = await ChatHistory.findOne({ sessionId });
    if (!historyDocument) historyDocument = await ChatHistory.create({ sessionId });

    // 2. Build System Prompt
    const systemInstruction = `
            You are JARVIS, a helpful voice assistant.
            Address the user as "Boss" (Deepansh Sharma).
            
            IMPORTANT RULES:
            1. Reply in a conversational manner but keep your answer extremely short and concise (max 2 sentences).
            2. Do not use markdown formatting (no bold/bullets), just plain text for speech.
            3. If the user asks to CREATE, UPDATE (status or priority), or DELETE a task, confirm it briefly AND output a JSON block at the end (hidden from speech) to execute it.
            
            JSON FORMAT FOR ACTIONS:
            \`\`\`json
            [
              {"action": "create", "Task": "task name", "Project": "category", "Priority": "High/Medium/Low"},
              {"action": "update", "searchName": "task name to find", "status": "Completed/Pending", "Priority": "High/Medium/Low"},
              {"action": "delete", "searchName": "task name to delete"}
            ]
            \`\`\`
            Note: For updates, only include fields that need changing. Status must be "Pending", "Completed", or similar.

            CURRENT PENDING TASKS:
            ${taskListText}
        `;

    // 3. Prepare History
    const historyParts = historyDocument.messages.slice(-6).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const contents = [
      ...historyParts,
      { role: 'user', parts: [{ text: `User said: "${userQuery}"` }] }
    ];

    // 4. Call Gemini
    let response;
    try {
      // Try user's preferred model first
      response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: { systemInstruction: systemInstruction },
        contents: contents
      });
    } catch (modelError) {
      console.warn("Gemini 3 failed, falling back to 1.5 Flash:", modelError.message);
      // Fallback
      response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: { systemInstruction: systemInstruction },
        contents: contents
      });
    }

    const replyText = typeof response.text === 'function' ? response.text() : response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!replyText) {
      // If completely empty, just say error
      return NextResponse.json({ text: "I'm sorry, I couldn't generate a response." });
    }

    // 5. Execute Actions
    await handleTaskActions(replyText);

    // Clean response for speech
    const speechText = replyText.replace(/```json[\s\S]*```/g, '').trim();

    // Update History
    historyDocument.messages.push(
      { role: 'user', content: userQuery },
      { role: 'model', content: speechText }
    );
    await historyDocument.save();

    return NextResponse.json({ text: speechText });

  } catch (error) {
    console.error("Gemini Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
