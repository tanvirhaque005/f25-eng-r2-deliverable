import type { Database } from "@/lib/schema";

type SpeciesRow = Database["public"]["Tables"]["species"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type SpeciesWithAuthor = SpeciesRow & {
  profiles: Pick<ProfileRow, "display_name" | "email"> | null;
};
