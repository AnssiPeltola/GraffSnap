import {
  pgTable,
  pgSchema,
  text,
  timestamp,
  uuid,
  decimal,
} from "drizzle-orm/pg-core";

const neonAuthSchema = pgSchema("neon_auth");

export const user = neonAuthSchema.table("user", {
  id: uuid("id").primaryKey(),
  // add name/email/etc. here only if you actually need to select/join on them
});

export const graffitiSightings = pgTable("graffiti_sightings", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  latitude: decimal("latitude").notNull(),
  longitude: decimal("longitude").notNull(),
  imageUrl: text("image_url").notNull(),
  imagePublicId: text("image_public_id").notNull(),
  notes: text("notes"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
