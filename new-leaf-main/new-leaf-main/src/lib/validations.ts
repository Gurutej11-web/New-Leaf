import { z } from "zod";

export const tournamentSchema = z.object({
  name: z.string()
    .min(3, "Event name must be at least 3 characters")
    .max(100, "Event name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Event name can only contain letters, numbers, spaces, hyphens, and underscores"),
  playerCount: z.number()
    .int("Player count must be a whole number")
    .min(2, "Must have at least 2 players")
    .max(64, "Maximum 64 players allowed"),
  gameType: z.enum(["singles", "doubles"]),
  pointsTo: z.number()
    .int("Points must be a whole number")
    .min(5, "Must play to at least 5 points")
    .max(21, "Maximum 21 points allowed"),
  expiresAt: z.date()
    .min(new Date(), "Expiration date must be in the future")
    .optional(),
  isPublic: z.boolean().default(true)
});

export const playerSchema = z.object({
  name: z.string()
    .min(1, "Player name is required")
    .max(50, "Player name must be less than 50 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "Player name can only contain letters, spaces, hyphens, and apostrophes"),
  dupr: z.number()
    .min(1.0, "DUPR must be at least 1.0")
    .max(6.0, "DUPR must be at most 6.0")
});

export type TournamentData = z.infer<typeof tournamentSchema>;
export type PlayerData = z.infer<typeof playerSchema>;
