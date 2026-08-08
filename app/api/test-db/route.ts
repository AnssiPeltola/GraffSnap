import { NextResponse } from "next/server";
import { db } from "../../../src/db/index";
import { graffitiSightings } from "../../../src/db/schema";

export async function GET() {
  try {
    const result = await db.select().from(graffitiSightings).limit(1);

    return NextResponse.json({
      success: true,
      message: "Database connection works!",
      rows: result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 },
    );
  }
}
