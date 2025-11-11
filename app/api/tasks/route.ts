import { createClient } from "redis";
import { NextRequest, NextResponse } from "next/server";
import { DayTasks } from "@/app/lib/types";

const TASKS_KEY = "user_tasks";

// Create Redis client
const getRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on("error", (err) => console.error("Redis Client Error", err));

  await client.connect();
  return client;
};

// GET - Fetch all tasks
export async function GET() {
  let client;
  try {
    client = await getRedisClient();
    const data = await client.get(TASKS_KEY);
    const tasks = data ? JSON.parse(data) : {};
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  } finally {
    if (client) await client.quit();
  }
}

// POST - Save/update tasks
export async function POST(request: NextRequest) {
  let client;
  try {
    client = await getRedisClient();
    const tasks: DayTasks = await request.json();
    await client.set(TASKS_KEY, JSON.stringify(tasks));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving tasks:", error);
    return NextResponse.json(
      { error: "Failed to save tasks" },
      { status: 500 }
    );
  } finally {
    if (client) await client.quit();
  }
}

// DELETE - Clear all tasks
export async function DELETE() {
  let client;
  try {
    client = await getRedisClient();
    await client.del(TASKS_KEY);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tasks:", error);
    return NextResponse.json(
      { error: "Failed to delete tasks" },
      { status: 500 }
    );
  } finally {
    if (client) await client.quit();
  }
}
