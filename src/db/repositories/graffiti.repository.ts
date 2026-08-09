import { desc } from "drizzle-orm";

import { db } from "../index";
import { graffitiSightings } from "../schema";

export type CreateGraffitiSightingInput = Pick<
  typeof graffitiSightings.$inferInsert,
  "userId" | "latitude" | "longitude" | "imageUrl" | "imagePublicId" | "notes"
>;

export async function getAllGraffitiSightings() {
  return db
    .select()
    .from(graffitiSightings)
    .orderBy(desc(graffitiSightings.createdAt));
}

export async function createGraffitiSighting(
  data: CreateGraffitiSightingInput,
) {
  const [sighting] = await db
    .insert(graffitiSightings)
    .values(data)
    .returning();

  return sighting;
}
