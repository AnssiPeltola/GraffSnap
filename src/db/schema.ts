import { pgTable, text, timestamp, uuid, decimal } from "drizzle-orm/pg-core";

export const graffitiSightings = pgTable("graffiti_sightings", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id").notNull(),

  latitude: decimal("latitude", {
    precision: 9,
    scale: 6,
  }).notNull(),

  longitude: decimal("longitude", {
    precision: 9,
    scale: 6,
  }).notNull(),

  imageUrl: text("image_url").notNull(),
  imagePublicId: text("image_public_id").notNull(),
  notes: text("notes"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type GraffitiSighting = typeof graffitiSightings.$inferSelect;
