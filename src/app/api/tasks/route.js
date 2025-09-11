import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/connectdb';
import Task from '@/app/models/task';

// GET handler to fetch all tasks
export async function GET() {
  await connectDB();
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST handler to create a new task
export async function POST(req) {
  await connectDB();
  try {
    const { name, description, priority } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false, error: 'Task name is required' }, { status: 400 });
    }

    const newTask = new Task({
      name,
      description,
      priority,
      statusHistory: [{ status: 'Pending' }],
    });

    const task = await newTask.save();
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// PATCH handler to update a task by ID from the request body
export async function PATCH(req) {
  await connectDB();
  const { id, updates } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, error: 'Task ID is required for updating' }, { status: 400 });
  }

  try {
    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    // Check if status is being updated and add to history
    if (updates.status && updates.status !== task.status) {
      task.statusHistory.push({ status: updates.status });
    }

    // Apply other updates
    Object.assign(task, updates);
    
    await task.save();
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE handler to remove a task by ID from the request body
export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, error: 'Task ID is required for deletion' }, { status: 400 });
  }

  try {
    const deletedTask = await Task.deleteOne({ _id: id });

    if (deletedTask.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}