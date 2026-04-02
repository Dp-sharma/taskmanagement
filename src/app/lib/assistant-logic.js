import { ChatGoogle } from "@langchain/google";
import { StateGraph, MessagesAnnotation, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import connectDB from "./connectdb";
import Task from "@/app/models/task";
import Lead from "@/app/models/lead";
import Memory from "@/app/models/memory";

// --- TOOLS ---
// (No changes to tools)

// 1. Task Tool
const taskTool = tool(
  async ({ action, name, description, priority, status, searchName }) => {
    await connectDB();
    if (action === "create") {
      const newTask = await Task.create({ name, description, priority, status });
      return `Created task: ${newTask.name}`;
    }
    if (action === "update") {
      const updatedTask = await Task.findOneAndUpdate(
        { name: new RegExp(searchName, 'i') },
        { name, description, priority, status },
        { new: true }
      );
      return updatedTask ? `Updated task: ${updatedTask.name}` : "Task not found.";
    }
    if (action === "delete") {
      await Task.findOneAndDelete({ name: new RegExp(searchName, 'i') });
      return `Deleted task matching: ${searchName}`;
    }
    return "Action not recognized.";
  },
  {
    name: "manage_tasks",
    description: "Create, update, or delete tasks for the user.",
    schema: z.object({
      action: z.enum(["create", "update", "delete"]),
      name: z.string().optional(),
      description: z.string().optional(),
      priority: z.enum(["Low", "Medium", "High"]).optional(),
      status: z.string().optional(),
      searchName: z.string().optional().describe("Used for finding existing tasks to update or delete"),
    }),
  }
);

// 2. Lead Tool
const leadTool = tool(
  async ({ action, name, stage, notes, searchName }) => {
    await connectDB();
    if (action === "create") {
      const newLead = await Lead.create({ name, stage });
      if (notes) newLead.notes.push({ content: notes });
      await newLead.save();
      return `Created school lead: ${newLead.name} in stage: ${newLead.stage}`;
    }
    if (action === "update") {
      const updateData = { stage };
      if (name) updateData.name = name;
      const updatedLead = await Lead.findOneAndUpdate(
        { name: new RegExp(searchName || name, 'i') },
        updateData,
        { new: true }
      );
      if (updatedLead && notes) {
        updatedLead.notes.push({ content: notes });
        await updatedLead.save();
      }
      return updatedLead ? `Updated lead: ${updatedLead.name} to stage: ${updatedLead.stage}` : "Lead not found.";
    }
    return "Action not recognized.";
  },
  {
    name: "manage_leads",
    description: "Create or update school leads and tracking their stages (Pitching, Installation, Training, etc.).",
    schema: z.object({
      action: z.enum(["create", "update"]),
      name: z.string().optional(),
      stage: z.string().optional().describe("Current stage: Pitching, Installation, Training, Performance tracing, General, etc."),
      notes: z.string().optional().describe("Add a note about the meeting or follow-up"),
      searchName: z.string().optional().describe("Used for finding existing leads"),
    }),
  }
);

// 3. Memory Tool
const memoryTool = tool(
  async ({ key, value }) => {
    await connectDB();
    await Memory.findOneAndUpdate(
      { key },
      { value, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
    return `Updated memory: ${key} = ${value}`;
  },
  {
    name: "update_memory",
    description: "Store high-level facts about the user or their preferences (e.g., job role, favorite tools).",
    schema: z.object({
      key: z.string().describe("Unique identifier for this fact"),
      value: z.string().describe("The information to remember"),
    }),
  }
);

// --- GRAPH SETUP ---

const tools = [taskTool, leadTool, memoryTool];
const toolNode = new ToolNode(tools);

async function callModel(state) {
  const { messages } = state;
  // Initialize LLM lazily within the call to ensure environment variables are ready
  const llm = new ChatGoogle({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-3-flash-preview", 
  });
  
  const llmWithTools = llm.bindTools(tools);
  const response = await llmWithTools.invoke(messages);
  return { messages: [response] };
}

function shouldContinue(state) {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return END;
}

// Define the graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

export const assistantAgent = workflow.compile();
