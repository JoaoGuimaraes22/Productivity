import { createClient } from "redis";
import { NextRequest, NextResponse } from "next/server";
import { BaseWeekTemplate, SpecificDayTasks } from "@/app/lib/types";

const BASE_WEEK_KEY = "user_base_week";
const SPECIFIC_TASKS_KEY = "user_specific_tasks";

// Create Redis client
const getRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on("error", (err) => console.error("Redis Client Error", err));

  await client.connect();
  return client;
};

// GET - Fetch planner data (base week + specific tasks)
export async function GET() {
  let client;
  try {
    client = await getRedisClient();

    const [baseWeekData, specificTasksData] = await Promise.all([
      client.get(BASE_WEEK_KEY),
      client.get(SPECIFIC_TASKS_KEY),
    ]);

    const baseWeek: BaseWeekTemplate = baseWeekData
      ? JSON.parse(baseWeekData)
      : {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        };

    const specificTasks: SpecificDayTasks = specificTasksData
      ? JSON.parse(specificTasksData)
      : {};

    return NextResponse.json({ baseWeek, specificTasks });
  } catch (error) {
    console.error("Error fetching planner data:", error);
    return NextResponse.json(
      { error: "Failed to fetch planner data" },
      { status: 500 }
    );
  } finally {
    if (client) await client.quit();
  }
}

// POST - Save planner data
export async function POST(request: NextRequest) {
  let client;
  try {
    client = await getRedisClient();
    const { baseWeek, specificTasks } = await request.json();

    await Promise.all([
      client.set(BASE_WEEK_KEY, JSON.stringify(baseWeek)),
      client.set(SPECIFIC_TASKS_KEY, JSON.stringify(specificTasks)),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving planner data:", error);
    return NextResponse.json(
      { error: "Failed to save planner data" },
      { status: 500 }
    );
  } finally {
    if (client) await client.quit();
  }
}

// DELETE - Clear planner data
export async function DELETE() {
  let client;
  try {
    client = await getRedisClient();
    await Promise.all([
      client.del(BASE_WEEK_KEY),
      client.del(SPECIFIC_TASKS_KEY),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting planner data:", error);
    return NextResponse.json(
      { error: "Failed to delete planner data" },
      { status: 500 }
    );
  } finally {
    if (client) await client.quit();
  }
}
