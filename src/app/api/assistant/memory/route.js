import { NextResponse } from 'next/server';
import connectDB from "@/app/lib/connectdb";
import Memory from "@/app/models/memory";

export async function GET() {
  try {
    await connectDB();
    const memories = await Memory.find({}).sort({ lastUpdated: -1 });
    return NextResponse.json(memories);
  } catch (error) {
    console.error("Memory Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { key, value } = await req.json();
    await connectDB();
    const memory = await Memory.findOneAndUpdate(
      { key },
      { value, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
    return NextResponse.json(memory);
  } catch (error) {
    console.error("Memory Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
