export type DashboardTab = "sprint" | "refinement" | "backlog" | "reports";

export interface FilterState {
  sprint: string;
  assignee: string;
}

export interface SummaryStats {
  new: number;
  "in-progress": number;
  complete: number;
  deleted: number;
}
