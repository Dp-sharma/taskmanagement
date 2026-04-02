import { NextResponse } from 'next/server';
import connectDB from "@/app/lib/connectdb";
import Lead from "@/app/models/lead";

export async function GET() {
  try {
    await connectDB();
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Leads Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    await connectDB();
    const lead = await Lead.create(data);
    return NextResponse.json(lead);
  } catch (error) {
    console.error("Lead Create Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
