import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";
import { DayTasks } from "@/app/lib/types";

const TASKS_KEY = "user_tasks";

// GET - Fetch all tasks
export async function GET() {
  try {
    const tasks = await kv.get<DayTasks>(TASKS_KEY);
    return NextResponse.json(tasks || {});
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST - Save/update tasks
export async function POST(request: NextRequest) {
  try {
    const tasks: DayTasks = await request.json();
    await kv.set(TASKS_KEY, tasks);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving tasks:", error);
    return NextResponse.json(
      { error: "Failed to save tasks" },
      { status: 500 }
    );
  }
}

// DELETE - Clear all tasks (optional, for testing)
export async function DELETE() {
  try {
    await kv.del(TASKS_KEY);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tasks:", error);
    return NextResponse.json(
      { error: "Failed to delete tasks" },
      { status: 500 }
    );
  }
}
