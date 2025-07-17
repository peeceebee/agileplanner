import { SprintItem, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface DashboardFiltersProps {
  sprintFilter: string;
  assigneeFilter: string;
  onSprintFilterChange: (value: string) => void;
  onAssigneeFilterChange: (value: string) => void;
  onCreateItem: () => void;
  users: User[];
  sprintItems: SprintItem[];
}

export default function DashboardFilters({
  sprintFilter,
  assigneeFilter,
  onSprintFilterChange,
  onAssigneeFilterChange,
  onCreateItem,
  users,
  sprintItems,
}: DashboardFiltersProps) {
  // Get unique sprint numbers from items
  const sprintNumbers = Array.from(
    new Set(sprintItems.map(item => item.sprintNumber).filter(Boolean))
  ).sort((a, b) => a! - b!);

  return (
    <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-700">Sprint:</label>
          <Select value={sprintFilter} onValueChange={onSprintFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Sprints" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sprints</SelectItem>
              {sprintNumbers.map(sprint => (
                <SelectItem key={sprint} value={sprint!.toString()}>
                  Sprint {sprint}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-700">Assignee:</label>
          <Select value={assigneeFilter} onValueChange={onAssigneeFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {users.map(user => (
                <SelectItem key={user.username} value={user.username}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={onCreateItem} className="bg-blue-600 hover:bg-blue-700">
        <Plus size={16} className="mr-2" />
        Add New Item
      </Button>
    </div>
  );
}
