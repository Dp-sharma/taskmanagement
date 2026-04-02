import { NextResponse } from 'next/server';
import connectDB from "@/app/lib/connectdb";
import Lead from "@/app/models/lead";

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    await connectDB();
    const lead = await Lead.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(lead);
  } catch (error) {
    console.error("Lead Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await connectDB();
    await Lead.findByIdAndDelete(id);
    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Lead Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
