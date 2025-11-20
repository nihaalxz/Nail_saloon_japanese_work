import type { Database } from "@/lib/database.types";

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type SkillCheck = Database["public"]["Tables"]["skill_checks"]["Row"];

export interface TabProps {
  currentCheck: SkillCheck | null;
  previousCheck: SkillCheck | null;
}

export interface Check {
  id: number;
  // ... existing fields
  color_score: number;

  // Add the new columns here
  color_base_score: number;
  color_cuticle_score: number;
  color_apex_score: number;
  color_saturation_score: number;
  color_edge_score: number;
}
